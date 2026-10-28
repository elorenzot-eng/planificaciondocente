const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const ts = require("typescript");
const Module = require("node:module");
const filename = require("node:path").resolve("lib/biblioteca-policy.ts");
const source = fs.readFileSync(filename,"utf8");
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const m = new Module(filename,module);
m.filename=filename;
m.paths=module.paths;
m._compile(compiled,filename);
const {canShareEducationalResource:allowed}=m.exports;
test("accepts ordinary teaching resources",()=>{
 assert.equal(allowed({title:"Guía de fracciones",content:{activities:["Sumar medios","Restar cuartos"]}}),true);
});
test("rejects SIMCE and PAES regardless of nesting",()=>{
 for(const value of [{title:"Ensayo SIMCE"},{content:{nested:{type:"PAES"}}},{content:{topic:"Ensayo nacional"}}])assert.equal(allowed(value),false);
});
test("rejects student identifiers and sensitive nested fields",()=>{
 for(const value of [{content:{students:[{name:"Persona"}]}},{content:{studentRut:"12345678-5"}},{content:{student:{email:"alumno@example.cl"}}},{content:{paci:{details:"privado"}}}])assert.equal(allowed(value),false);
});
test("rejects oversized resources",()=>{
 assert.equal(allowed({content:"x".repeat(150001)}),false);
});
test("rejects nested cycles",()=>{
 const value={title:"Ciclo"};value.self=value;
 assert.throws(()=>allowed(value),TypeError);
});
const route=fs.readFileSync("app/api/biblioteca/route.ts","utf8");
test("API reads source documents only for their author",()=>{
 assert.match(route,/sourceId/);
 assert.match(route,/userId: u\.id/);
 assert.match(route,/const published = false/);
});
test("API restricts publication changes to author",()=>{
 assert.match(route,/authorId: u\.id/);
});

test("institutional accounts require a current license or subscription",()=>{
 assert.match(route,/pedagogicalModuleLicense\.findFirst/);
 assert.doesNotMatch(route,/institutionalExamLicense/);
 assert.match(route,/RECURSOS_PEDAGOGICOS/);
 assert.match(route,/expiresAt: \{ gt: now \}/);
 assert.match(route,/startsAt: \{ lte: now \}/);
 assert.match(route,/if \(!entitlement\) return null/);
});

test("pedagogical license API prevents overlapping entitlements",()=>{
 const admin=fs.readFileSync("app/api/admin/pedagogical-licenses/route.ts","utf8");
 assert.match(admin,/schoolId, module: moduleName, active: true/);
 assert.match(admin,/status: 409/);
 assert.match(admin,/role === "SUPERADMIN"/);
});

test("publication requires explicit boolean and author-scoped update",()=>{
 assert.match(route,/typeof b\.published !== "boolean"/);
 assert.match(route,/updateMany\(\{ where: \{ id, authorId: u\.id \}/);
});

test("library imports are deduplicated by author and source",()=>{
 const schema=fs.readFileSync("prisma/schema.prisma","utf8");
 assert.match(schema, /@@unique\(\[authorId,kind,sourceId\]\)/);
 assert.match(route, /error\?\.code === "P2002"/);
});

test("source picker hides documents already imported by the same author",()=>{
 assert.match(route,/sourceId: \{ not: null \}/);
 assert.match(route,/imported\.some\(i => i\.kind === x\.kind && i\.sourceId === x\.id\)/);
});

test("reactivating a license checks for overlapping active periods",()=>{
 const admin=fs.readFileSync("app/api/admin/pedagogical-licenses/route.ts","utf8");
 const patch=admin.slice(admin.indexOf("export async function PATCH"));
 assert.match(patch,/if \(body\.active\)/);
 assert.match(patch,/id: \{ not: current\.id \}/);
 assert.match(patch,/startsAt: \{ lt: current\.expiresAt \}/);
 assert.match(patch,/expiresAt: \{ gt: current\.startsAt \}/);
 assert.match(patch,/status: 409/);
});
test("new library tables have a versioned PostgreSQL migration",()=>{
 const migration=fs.readFileSync("prisma/migrations/20261028003000_biblioteca_educantay/migration.sql","utf8");
 assert.match(migration,/CREATE TABLE "SharedLibraryResource"/);
 assert.match(migration,/CREATE TABLE "PedagogicalModuleLicense"/);
 assert.match(migration,/CREATE UNIQUE INDEX "SharedLibraryResource_authorId_kind_sourceId_key"/);
});

test("institutional users without a school are denied unless they are sostenedores",()=>{
 assert.match(route,/if \(!u\.schoolId && u\.role !== "SOSTENEDOR"\) return null/);
 assert.match(route,/organizationId: u\.organizationId, active: true/);
 assert.match(route,/if \(!entitlement\) return null/);
});

test("publishing is opt-in and requires a user confirmation",()=>{
 const ui=fs.readFileSync("app/biblioteca/page.tsx","utf8");
 assert.match(route,/const published = false/);
 assert.match(route,/typeof b\.published !== "boolean"/);
 assert.match(ui,/confirm\(r\.published\?/);
 assert.match(ui,/published:!r\.published/);
 assert.match(route,/canShareEducationalResource\(\{ title:current\.title/);
});

test("rejects additional personal identifiers in shared materials",()=>{
 for(const value of [
  {content:{note:"RUT 12 345 678-5"}},
  {content:{note:"RUT 123456785"}},
  {content:{note:"Contacto +56 9 1234 5678"}},
  {content:{note:"Nombre completo: Estudiante Ejemplo"}},
  {content:{note:"Diagnóstico del estudiante: información reservada"}}
 ]) assert.equal(allowed(value),false);
});

test("school-linked sostenedores must belong to their own active organization",()=>{
 assert.match(route,/if \(u\.schoolId\)/);
 assert.match(route,/id: u\.schoolId, organizationId: u\.organizationId, active: true/);
 assert.match(route,/if \(!ownSchool\) return null/);
});

test("institutional school users cannot access a school in another organization",()=>{
 assert.match(route,/if \(u\.schoolId\)/);
 assert.match(route,/id: u\.schoolId, organizationId: u\.organizationId, active: true/);
});

test("unknown account types fail closed",()=>{
 assert.match(route,/u\.accountType !== "INDIVIDUAL" && u\.accountType !== "INSTITUTIONAL"/);
});

test("active superadmin access does not depend on institution status",()=>{
 const active=route.indexOf('if (!u?.active) return null;');
 const admin=route.indexOf('if (u.role === "SUPERADMIN") return u;');
 const institution=route.indexOf('if (!u.organization?.active');
 assert.ok(active>=0 && admin>active && institution>admin);
});

test("license grant checks active school and organization and permits adjacent periods",()=>{
 const admin=fs.readFileSync("app/api/admin/pedagogical-licenses/route.ts","utf8");
 assert.match(admin,/!school\.active \|\| !school\.organization\?\.active/);
 assert.match(admin,/startsAt: \{ lt: expiresAt \}, expiresAt: \{ gt: startsAt \}/);
});

test("license reactivation rejects inactive school or organization",()=>{
 const admin=fs.readFileSync("app/api/admin/pedagogical-licenses/route.ts","utf8");
 const patch=admin.slice(admin.indexOf("export async function PATCH"));
 assert.match(patch,/if \(body\.active\)/);
 assert.match(patch,/where: \{ id: current\.schoolId \}/);
 assert.match(patch,/!school\?\.active \|\| !school\.organization\?\.active/);
});
