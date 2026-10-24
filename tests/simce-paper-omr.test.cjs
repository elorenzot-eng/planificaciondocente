const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ts=require("typescript");
const Module=require("node:module");
require.extensions[".ts"]=function(mod,filename){
  const source=fs.readFileSync(filename,"utf8");
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  mod._compile(compiled,filename);
};
const {readCalibratedSheet}=require("../lib/simce-paper-sheet-reader.ts");
const {classifyBubbleRow}=require("../lib/simce-paper-omr.ts");
function synthetic(marks){
  const width=400,height=300;
  const data=new Uint8ClampedArray(width*height*4).fill(255);
  const rows=marks.map((mark,i)=>({
    number:i+1,
    bubbles:["A","B","C","D"].map((letter,j)=>{
      const x=50+j*75,y=50+i*60,radius=13;
      if(mark===letter||Array.isArray(mark)&&mark.includes(letter)){
        for(let py=y-9;py<=y+9;py++)for(let px=x-9;px<=x+9;px++){
          if((px-x)**2+(py-y)**2<=81){
            const k=(py*width+px)*4;data[k]=data[k+1]=data[k+2]=0;
          }
        }
      }
      return {x,y,radius};
    })
  }));
  return {raster:{data,width,height},rows};
}
test("OMR: A, B, C, D y blanco se distinguen",()=>{
  const {raster,rows}=synthetic(["A","B","C","D",null]);
  assert.deepEqual(readCalibratedSheet(raster,rows).answers.map(a=>a.mark),["A","B","C","D",null]);
});
test("OMR: dos marcas se remiten a revisión",()=>{
  const {raster,rows}=synthetic([["A","C"]]);
  const result=readCalibratedSheet(raster,rows);
  assert.equal(result.answers[0].mark,"MULTIPLE");
  assert.deepEqual(result.reviewNumbers,[1]);
});
test("OMR: una marca tenue se señala como incierta",()=>{
  assert.equal(classifyBubbleRow([0.23,0.02,0.01,0.02]).mark,"UNCERTAIN");
});
test("OMR: rechaza geometría duplicada",()=>{
  const {raster,rows}=synthetic(["A"]);
  assert.throws(()=>readCalibratedSheet(raster,[rows[0],rows[0]]),/Geometría/);
});