const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ts=require("typescript");
function loadTs(relativePath){
 const source=fs.readFileSync(path.join(__dirname,"..",relativePath),"utf8");
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function("module","exports",js)(module,module.exports);
 return module.exports;
}
const {parseYanayLead}=loadTs("lib/yanay-commercial.ts");
const {chileLocalToIso}=loadTs("lib/chile-meeting-time.ts");
const valid={name:"Ana Pérez",phone:"+56 9 1234 5678",email:"  ANA@COLEGIO.CL  ",product:"SIMCE",consent:true};
test("accepts consented lead and normalizes email",()=>{
 const r=parseYanayLead(valid);
 assert.equal(r.ok,true);
 assert.equal(r.data.email,"ana@colegio.cl");
});
test("rejects missing consent and invalid contact",()=>{
 const r=parseYanayLead({...valid,consent:false,phone:"123",email:"not-email"});
 assert.equal(r.ok,false);
 assert.equal(r.errors.length,3);
});
test("rejects arrays and empty input",()=>{
 assert.equal(parseYanayLead([]).ok,false);
 assert.equal(parseYanayLead(null).ok,false);
});
test("converts Chile summer and winter local times to UTC",()=>{
 assert.equal(chileLocalToIso("2026-01-15T10:30"),"2026-01-15T13:30:00.000Z");
 assert.equal(chileLocalToIso("2026-07-15T10:30"),"2026-07-15T14:30:00.000Z");
});
test("rejects invalid meeting datetime format",()=>{
 assert.equal(chileLocalToIso("2026-07-15"),null);
 assert.equal(chileLocalToIso("not-a-date"),null);
});
