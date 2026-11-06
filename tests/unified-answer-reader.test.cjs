const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const ts=require("typescript");
require.extensions[".ts"]=function(mod,filename){
  mod._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
};
const {readUnifiedAnswerPages}=require("../lib/unified-answer-reader.ts");
function blank(){const width=1200,height=1600;return {width,height,data:new Uint8ClampedArray(width*height*4).fill(255)};}
test("PAES 80: reads two calibrated pages with global numbering",()=>{
 const result=readUnifiedAnswerPages("PAES","Matemática M1",80,[blank(),blank()]);
 assert.equal(result.answers.length,80);
 assert.equal(result.answers[0].number,1);
 assert.equal(result.answers[49].number,50);
 assert.equal(result.answers[50].number,51);
 assert.equal(result.answers[79].number,80);
 assert.equal(new Set(result.answers.map(a=>a.number)).size,80);
});
test("SIMCE 35: accepts one page",()=>{
 const result=readUnifiedAnswerPages("SIMCE","Lectura",35,[blank()]);
 assert.equal(result.answers.length,35);
});
test("rejects missing PAES page",()=>{
 assert.throws(()=>readUnifiedAnswerPages("PAES","Ciencias",80,[blank()]),/páginas/);
});

test("SIMCE: detects a filled B bubble at the exact printable SVG position",()=>{
 const raster=blank(),sx=raster.width/210,sy=raster.height/297;
 const cx=40*sx,cy=55*sy,rad=3*Math.min(sx,sy)*0.55;
 for(let y=Math.floor(cy-rad);y<=Math.ceil(cy+rad);y++)
  for(let x=Math.floor(cx-rad);x<=Math.ceil(cx+rad);x++)
   if((x-cx)**2+(y-cy)**2<=rad**2){
    const k=(y*raster.width+x)*4;
    raster.data[k]=raster.data[k+1]=raster.data[k+2]=0;
   }
 const result=readUnifiedAnswerPages("SIMCE","Lectura",1,[raster]);
 assert.equal(result.answers[0].mark,"B");
});
