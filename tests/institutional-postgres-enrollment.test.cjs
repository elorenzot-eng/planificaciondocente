const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");
const { PrismaClient } = require("@prisma/client");
const filename = path.join(__dirname, "../lib/institutional-license-enrollment.server.ts");
const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const m = new Module(filename, module);
m.filename = filename;
m.paths = module.paths;
m._compile(js, filename);
const { enrollInstitutionalStudent } = m.exports;

test("PostgreSQL: concurrent enrollment never exceeds contracted seats", async () => {
  const db = new PrismaClient();
  const stamp = Date.now().toString(36);
  const org = await db.organization.create({ data: { name: "Enrollment CI " + stamp } });
  const school = await db.school.create({ data: { name: "Enrollment CI " + stamp, organizationId: org.id } });
  try {
    const license = await db.institutionalExamLicense.create({ data: {
      organizationId: org.id, schoolId: school.id, module: "SIMCE", level: "4B", subject: "MATEMATICA",
      status: "ACTIVE", studentCount: 2, startsAt: new Date(Date.now()-60000), endsAt: new Date(Date.now()+86400000),
    } });
    const students = await Promise.all(Array.from({length: 8}, (_, i) => db.institutionalStudent.create({data:{
      schoolId: school.id, nombres: "Test", apellidoPaterno: "CI", apellidoMaterno: "Alumno",
      rut: stamp + "-" + i, curso: "4B",
    }})));
    const results = await Promise.allSettled(students.map(student => enrollInstitutionalStudent(db, license.id, student.id)));
    assert.equal(results.filter(r => r.status === "fulfilled").length, 2);
    assert.equal(await db.institutionalLicenseEnrollment.count({where:{licenseId:license.id,active:true}}), 2);
    const enrolled = await db.institutionalLicenseEnrollment.findFirst({where:{licenseId:license.id}});
    assert.ok(enrolled);
    assert.equal(await enrollInstitutionalStudent(db, license.id, enrolled.studentId), "duplicate");
    assert.equal(await db.institutionalLicenseEnrollment.count({where:{licenseId:license.id,active:true}}), 2);
    const outsider = await db.institutionalStudent.create({data:{schoolId:school.id,nombres:"Otro",apellidoPaterno:"CI",apellidoMaterno:"Alumno",rut:stamp+"-outsider",curso:"8B"}});
    await assert.rejects(enrollInstitutionalStudent(db, license.id, outsider.id));
    assert.equal(await db.institutionalLicenseEnrollment.count({where:{licenseId:license.id,active:true}}), 2);
  } finally {
    await db.institutionalExamLicense.deleteMany({where:{schoolId:school.id}});
    await db.institutionalStudent.deleteMany({where:{schoolId:school.id}});
    await db.school.delete({where:{id:school.id}});
    await db.organization.delete({where:{id:org.id}});
    await db.$disconnect();
  }
});
