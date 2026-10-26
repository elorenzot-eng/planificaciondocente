const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");

const file = require("node:path").join(__dirname, "../lib/institutional-exam-access.ts");
const source = fs.readFileSync(file, "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = new Module(file, module);
mod.filename = file;
mod.paths = module.paths;
mod._compile(js, file);
const { canAccessInstitutionalExam } = mod.exports;

const now = new Date("2026-10-26T12:00:00Z");
const actor = { active: true, accountType: "INSTITUTIONAL", role: "DOCENTE", organizationId: "org-1", schoolId: "school-1" };
const license = { organizationId: "org-1", schoolId: "school-1", module: "PAES", level: "4M", subject: "LECTORA", status: "ACTIVE", startsAt: new Date("2026-01-01"), endsAt: new Date("2027-01-01") };
const request = { module: "PAES", level: "4M", subject: "LECTORA", operation: "GENERATE" };
const allowed = (a = actor, l = license, r = request, date = now) => canAccessInstitutionalExam(a, l, r, date);

test("permite docente del colegio con licencia vigente", () => assert.equal(allowed(), true));
test("deniega cuenta individual o inactiva", () => {
  assert.equal(allowed({ ...actor, accountType: "INDIVIDUAL" }), false);
  assert.equal(allowed({ ...actor, active: false }), false);
});
test("deniega acceso entre sostenedores y colegios", () => {
  assert.equal(allowed({ ...actor, organizationId: "org-2" }), false);
  assert.equal(allowed({ ...actor, schoolId: "school-2" }), false);
});
test("deniega licencia vencida, pendiente o suspendida", () => {
  for (const status of ["PENDING", "SUSPENDED", "EXPIRED"]) assert.equal(allowed(actor, { ...license, status }), false);
  assert.equal(allowed(actor, license, request, new Date("2027-01-01")), false);
});
test("deniega módulo, nivel o asignatura no contratados", () => {
  assert.equal(allowed(actor, license, { ...request, module: "SIMCE" }), false);
  assert.equal(allowed(actor, license, { ...request, level: "2M" }), false);
  assert.equal(allowed(actor, license, { ...request, subject: "M1" }), false);
});
test("deniega rol no habilitado", () => assert.equal(allowed({ ...actor, role: "INVITADO" }), false));

test("deniega fechas malformadas y operaciones desconocidas", () => {
  assert.equal(allowed(actor, { ...license, startsAt: "2026-01-01" }), false);
  assert.equal(allowed(actor, { ...license, endsAt: null }), false);
  assert.equal(allowed(actor, license, { ...request, operation: "DELETE" }), false);
  assert.equal(allowed(actor, license, { ...request, module: "OTHER" }), false);
  assert.equal(allowed(null), false);
});
