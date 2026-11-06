const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const source=fs.readFileSync("app/ensayos-simce/corrector/cargar/page.tsx","utf8");
test("SIMCE existing corrector accepts PDF, JPG and PNG in both upload modes",()=>{
 for(const extension of [".pdf",".jpg",".jpeg",".png"])assert.ok(source.includes(extension),"missing "+extension);
 for(const mime of ["application/pdf","image/jpeg","image/png"])assert.ok(source.includes(mime),"missing "+mime);
 assert.match(source,/accept=\{ACCEPT\}/);
 assert.match(source,/multiple accept=\{ACCEPT\}/);
 assert.match(source,/\["pdf","jpg","jpeg","png"\]/);
 assert.match(source,/createImageBitmap\(file\)/);
 assert.match(source,/createImageBitmap\(fileItem\)/);
 assert.match(source,/MAX_BYTES = 50 \* 1024 \* 1024/);
});
