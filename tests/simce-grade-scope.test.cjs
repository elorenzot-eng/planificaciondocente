const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../app/api/recursos-aprendizaje/generar/route.ts"),"utf8");
test("SIMCE only supports approved grades and subjects",()=>{
 assert.match(source,/\["4","6","8","10"\]/);
 assert.match(source,/const allowed = \["simce-lectura","simce-matematica"\]/);
 assert.doesNotMatch(source,/2° básico|MODELO PRECURSORES|MODELO FLUIDEZ|MODELO REFORZAMIENTO/);
});
test("SIMCE prompt requires four unique options and no open questions",()=>{
 assert.match(source,/CUATRO alternativas A\/B\/C\/D/);
 assert.match(source,/No incluir preguntas abiertas/);
 assert.match(source,/original\.length!==4/);
 assert.match(source,/new Set\(options/);
});
