const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");
const file = path.join(__dirname, "../lib/institutional-license-enrollment.server.ts");
const js = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = new Module(file, module);
mod.filename = file;
mod.paths = module.paths;
mod.require = name => name === "@prisma/client" ? { Prisma: { TransactionIsolationLevel: { Serializable: "Serializable" }, PrismaClientKnownRequestError: class extends Error {} } } :
 name === "./institutional-exam-quota.server" ? { InstitutionalQuotaError: class extends Error {} } : require(name);
mod._compile(js, file);
const { enrollInstitutionalStudent } = mod.exports;

function fixture() {
 const license = { id: "lic", schoolId: "school", level: "4M", status: "ACTIVE", startsAt: new Date("2020-01-01"), endsAt: new Date("2099-01-01"), studentCount: 1 };
 const rows = [];
 const db = {
  institutionalExamLicense: { findUnique: async () => license },
  institutionalStudent: { findFirst: async ({ where }) => where.schoolId === "school" && where.curso === "4M" && ["a", "b"].includes(where.id) ? { id: where.id } : null },
  institutionalLicenseEnrollment: {
   findUnique: async ({ where }) => rows.find(r => r.studentId === where.licenseId_studentId.studentId) || null,
   count: async () => rows.filter(r => r.active).length,
   create: async ({ data }) => { rows.push({ ...data, active: true }); },
   update: async ({ where }) => { const row = rows.find(r => r.studentId === where.licenseId_studentId.studentId); row.active = true; },
  },
  $transaction: async fn => fn(db),
 };
 return { db, license, rows };
}
test("enrollment is idempotent and limited to purchased seats", async () => {
 const { db, rows } = fixture();
 assert.equal(await enrollInstitutionalStudent(db, "lic", "a"), "enrolled");
 assert.equal(await enrollInstitutionalStudent(db, "lic", "a"), "duplicate");
 await assert.rejects(enrollInstitutionalStudent(db, "lic", "b"));
 assert.equal(rows.length, 1);
});
test("enrollment rejects outsiders and expired licenses", async () => {
 const { db, license, rows } = fixture();
 await assert.rejects(enrollInstitutionalStudent(db, "lic", "outsider"));
 license.endsAt = new Date("2021-01-01");
 await assert.rejects(enrollInstitutionalStudent(db, "lic", "a"));
 assert.equal(rows.length, 0);
});
