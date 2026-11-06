const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = function(mod, filename) {
  const source = fs.readFileSync(filename, "utf8");
  mod._compile(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, filename);
};
const {createUnifiedAnswerSheet} = require("../lib/unified-answer-sheet.ts");
const {buildSimceGrid} = require("../lib/simce-paper-grid.ts");

for (const [family,subject,count] of [
  ["SIMCE","Lectura",35],["SIMCE","Matemáticas",40],
  ["PAES","Competencia Lectora",65],["PAES","Matemática M1",80],
  ["PAES","Matemática M2",80],["PAES","Ciencias",80],
  ["PAES","Historia y Ciencias Sociales",80],
]) {
  test(`Plantilla unificada: ${family} ${subject} (${count})`, () => {
    const s=createUnifiedAnswerSheet(family,subject,count);
    assert.equal(s.title,`Ensayo ${family} de ${subject}`);
    assert.equal(s.rutPattern,"OO.OOO.OOO-O");
    assert.equal(s.courseLabel,"Curso");
    assert.deepEqual(s.alternatives,["A","B","C","D"]);
    assert.equal(s.pages.reduce((n,p)=>n+p.questionCount,0),count);
    const width=1200,height=1600,c=s.calibration;
    for (const page of s.pages) {
    const rows=buildSimceGrid(page.questionCount,{
      firstColumnA:{x:c.leftX*width,y:c.leftY*height},
      secondColumnA:{x:c.rightX*width,y:c.rightY*height},
      bubbleSpacing:c.spacing*width,rowSpacing:c.rowSpacing*height,
      bubbleRadius:c.radius*Math.min(width,height),
      leftRows:page.leftRows
    },width,height);
    assert.equal(rows.length,page.questionCount);
    assert.equal(rows.at(-1).number,page.questionCount);
    }
  });
}
test("No se mezclan materias ni se aceptan cantidades inválidas",()=>{
  assert.throws(()=>createUnifiedAnswerSheet("SIMCE","Ciencias",35),/inválida/);
  assert.throws(()=>createUnifiedAnswerSheet("PAES","Lectura",65),/inválida/);
  assert.throws(()=>createUnifiedAnswerSheet("PAES","Matemática M1",81),/inválida/);
});
