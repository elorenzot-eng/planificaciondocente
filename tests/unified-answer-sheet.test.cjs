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
    assert.equal(s.leftRows,Math.ceil(count/2));
    const width=1200,height=1600,c=s.calibration;
    const rows=buildSimceGrid(count,{
      firstColumnA:{x:c.leftX*width,y:c.leftY*height},
      secondColumnA:{x:c.rightX*width,y:c.rightY*height},
      bubbleSpacing:c.spacing*width,rowSpacing:c.rowSpacing*height,
      bubbleRadius:c.radius*Math.min(width,height),
      leftRows:s.leftRows
    },width,height);
    assert.equal(rows.length,count);
    assert.equal(rows.at(-1).number,count);
  });
}
test("No se mezclan materias ni se aceptan cantidades inválidas",()=>{
  assert.throws(()=>createUnifiedAnswerSheet("SIMCE","Ciencias",35),/inválida/);
  assert.throws(()=>createUnifiedAnswerSheet("PAES","Lectura",65),/inválida/);
  assert.throws(()=>createUnifiedAnswerSheet("PAES","Matemática M1",81),/inválida/);
});
