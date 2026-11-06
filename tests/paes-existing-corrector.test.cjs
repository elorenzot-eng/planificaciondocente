const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const source=fs.readFileSync("app/ensayos-paes/corrector/cargar/page.tsx","utf8");
test("existing PAES corrector limits manual alternatives to A-D",()=>{
 assert.match(source,/\["A","B","C","D"\]\.map/);
 assert.doesNotMatch(source,/\["A","B","C","D","E"\]\.map/);
});
test("existing PAES corrector accepts JPG PNG PDF up to 50MB",()=>{
 assert.match(source,/\["jpg","jpeg","png","pdf"\]/);
 assert.match(source,/file\.size>50\*1024\*1024/);
 assert.match(source,/JPG, PNG o PDF de hasta 50 MB/);
});
