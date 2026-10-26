const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");

const file = path.join(__dirname, "../lib/institutional-exam-quota.server.ts");
const source = fs.readFileSync(file, "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = new Module(file, module);
mod.filename = file;
mod.paths = module.paths;
mod.require = name => name === "@prisma/client"
  ? { Prisma: { TransactionIsolationLevel: { Serializable: "Serializable" }, PrismaClientKnownRequestError: class extends Error {} } }
  : require(name);
mod._compile(js, file);
const { chargeInstitutionalExam, InstitutionalQuotaError } = mod.exports;

function fixture() {
  const usages = [];
  const license = { id: "lic1", schoolId: "s1", organizationId: "o1", module: "PAES", level: "4M", subject: "LECTORA", status: "ACTIVE",
    startsAt: new Date("2020-01-01"), endsAt: new Date("2099-01-01"), studentCount: 1, pdfLimit: 2, pdfUsed: 0, reviewsPerStudent: 2 };
  const api = {
    institutionalExamUsage: {
      findUnique: async ({ where }) => usages.find(u => u.requestKey === where.requestKey) || null,
      count: async ({ where }) => usages.filter(u => u.licenseId === where.licenseId && u.kind === where.kind && u.studentKey === where.studentKey).length,
      create: async ({ data }) => { if (usages.some(u => u.requestKey === data.requestKey)) throw Error("duplicate"); usages.push(data); },
    },
    institutionalExamLicense: {
      findFirst: async ({ where }) => where.id === license.id && where.schoolId === license.schoolId && where.organizationId === license.organizationId &&
        where.module === license.module && where.level === license.level && where.subject === license.subject && license.status === "ACTIVE" ? license : null,
      updateMany: async () => { if (license.pdfUsed >= license.pdfLimit) return { count: 0 }; license.pdfUsed++; return { count: 1 }; },
    },
    institutionalStudent: { findFirst: async ({ where }) => where.id === "student1" && where.schoolId === "s1" ? { id: "student1" } : null },
    $transaction: async callback => {
      // Snapshot rollback simulation; NOT a concurrency or PostgreSQL integration test.
      const before = [...usages], count = license.pdfUsed;
      try { return await callback(api); }
      catch (e) { usages.splice(0, usages.length, ...before); license.pdfUsed = count; throw e; }
    },
  };
  const args = { licenseId: "lic1", schoolId: "s1", organizationId: "o1", module: "PAES", level: "4M", subject: "LECTORA" };
  return { api, args, license, usages };
}
test("PDF: charge once per idempotency key and enforce limit", async () => {
  const { api, args, license, usages } = fixture();
  assert.equal(await chargeInstitutionalExam(api, { ...args, kind: "PDF", requestKey: "pdf-request-001" }), "charged");
  assert.equal(await chargeInstitutionalExam(api, { ...args, kind: "PDF", requestKey: "pdf-request-001" }), "duplicate");
  assert.equal(await chargeInstitutionalExam(api, { ...args, kind: "PDF", requestKey: "pdf-request-002" }), "charged");
  await assert.rejects(chargeInstitutionalExam(api, { ...args, kind: "PDF", requestKey: "pdf-request-003" }), InstitutionalQuotaError);
  assert.equal(license.pdfUsed, 2);
  assert.equal(usages.length, 2);
});
test("REVIEW: per-student cap and school membership", async () => {
  const { api, args, usages } = fixture();
  for (const requestKey of ["review-req-001", "review-req-002"])
    assert.equal(await chargeInstitutionalExam(api, { ...args, kind: "REVIEW", studentId: "student1", requestKey }), "charged");
  await assert.rejects(chargeInstitutionalExam(api, { ...args, kind: "REVIEW", studentId: "student1", requestKey: "review-req-003" }), InstitutionalQuotaError);
  await assert.rejects(chargeInstitutionalExam(api, { ...args, kind: "REVIEW", studentId: "outsider", requestKey: "review-req-004" }), InstitutionalQuotaError);
  assert.equal(usages.length, 2);
});
test("denies license scope mismatch", async () => {
  const { api, args } = fixture();
  await assert.rejects(chargeInstitutionalExam(api, { ...args, subject: "M1", kind: "PDF", requestKey: "scope-request-01" }), InstitutionalQuotaError);
});

test("denies missing or invalid contract limits", async () => {
  const { api, args, license } = fixture();
  for (const invalid of [undefined, 0, -1, 1.5, NaN]) {
    license.studentCount = invalid;
    await assert.rejects(chargeInstitutionalExam(api, { ...args, kind: "PDF", requestKey: "invalid-contract-001" }), InstitutionalQuotaError);
  }
  assert.equal(license.pdfUsed, 0);
});
