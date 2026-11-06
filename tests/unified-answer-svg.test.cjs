const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),ts=require("typescript");
require.extensions[".ts"]=function(mod,f){mod._compile(ts.transpileModule(fs.readFileSync(f,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f)};
const {renderUnifiedAnswerSvg}=require("../lib/unified-answer-svg.ts");
test("SIMCE 35: A4 SVG with fiducials, title and 140 answer bubbles",()=>{
 const svg=renderUnifiedAnswerSvg("SIMCE","Lectura",35);
 assert.match(svg,/width="210mm" height="297mm"/);
 assert.match(svg,/Ensayo SIMCE de Lectura/);
 assert.match(svg,/Curso:/);assert.match(svg,/RUT:/);
 assert.equal((svg.match(/<circle /g)||[]).length,140);
 assert.match(svg,/x="6" y="6"/);
});
test("PAES 80: two pages with independent question numbering",()=>{
 const first=renderUnifiedAnswerSvg("PAES","Matemática M1",80,0);
 const second=renderUnifiedAnswerSvg("PAES","Matemática M1",80,1);
 assert.match(first,/Preguntas 1–50/);
 assert.match(second,/Preguntas 51–80/);
 assert.equal((first.match(/<circle /g)||[]).length,200);
 assert.equal((second.match(/<circle /g)||[]).length,120);
 assert.throws(()=>renderUnifiedAnswerSvg("PAES","Matemática M1",80,2),/inexistente/);
});
