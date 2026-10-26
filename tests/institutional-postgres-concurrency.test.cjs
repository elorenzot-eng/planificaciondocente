const test = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const ts = require("typescript");
const Module = require("node:module");
const fs = require("node:fs");
const path = require("node:path");
const sourceFile = path.join(__dirname, "../lib/institutional-exam-quota.server.ts");
const js = ts.transpileModule(fs.readFileSync(sourceFile, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const m = new Module(sourceFile, module);
m.filename = sourceFile;
m.paths = module.paths;
m._compile(js, sourceFile);
const { chargeInstitutionalExam } = m.exports;

test("PostgreSQL: concurrent PDF requests never exceed license cap", async () => {
  const db = new PrismaClient();
  const stamp = Date.now().toString(36);
  const org = await db.organization.create({ data: { name: "CI " + stamp } });
  const school = await db.school.create({ data: { name: "CI " + stamp, organizationId: org.id } });
  try {
    const license = await db.institutionalExamLicense.create({ data: {
      organizationId: org.id, schoolId: school.id, module: "PAES", level: "4M",
      subject: "LECTORA", status: "ACTIVE", studentCount: 1, pdfLimit: 2,
      reviewsPerStudent: 10, startsAt: new Date(Date.now()-60000), endsAt: new Date(Date.now()+86400000),
    } });
    const base = { licenseId: license.id, kind: "PDF", schoolId: school.id,
      organizationId: org.id, module: "PAES", level: "4M", subject: "LECTORA" };
    const results = await Promise.allSettled(Array.from({ length: 8 }, (_, i) =>
      chargeInstitutionalExam(db, { ...base, requestKey: "pgci_"+stamp+"_"+i.toString().padStart(12,"0") })));
    const success = results.filter(r => r.status === "fulfilled").length;
    const current = await db.institutionalExamLicense.findUnique({ where: { id: license.id } });
    const receipts = await db.institutionalExamUsage.count({ where: { licenseId: license.id } });
    assert.equal(success, 2);
    assert.equal(current.pdfUsed, 2);
    assert.equal(receipts, 2);
    const first = await db.institutionalExamUsage.findFirst({ where: { licenseId: license.id }, select: { requestKey: true } });
    assert.ok(first);
    const repeated = await chargeInstitutionalExam(db, { ...base, requestKey: first.requestKey });
    assert.equal(repeated, "duplicate");
    const afterRetry = await db.institutionalExamLicense.findUnique({ where: { id: license.id } });
    assert.equal(afterRetry.pdfUsed, 2);
    assert.equal(await db.institutionalExamUsage.count({ where: { licenseId: license.id } }), 2);
    const wrongScope = await Promise.allSettled([
      chargeInstitutionalExam(db, { ...base, subject: "M1", requestKey: first.requestKey }),
      chargeInstitutionalExam(db, { ...base, licenseId: "other-license", requestKey: first.requestKey }),
    ]);
    assert.equal(wrongScope.filter(result => result.status === "rejected").length, 2);
    assert.equal(await db.institutionalExamUsage.count({ where: { licenseId: license.id } }), 2);
  } finally {
    await db.institutionalExamLicense.deleteMany({ where: { schoolId: school.id } });
    await db.school.delete({ where: { id: school.id } });
    await db.organization.delete({ where: { id: org.id } });
    await db.$disconnect();
  }
});
