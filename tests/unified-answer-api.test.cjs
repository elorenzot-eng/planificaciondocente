const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
test("OMR download route validates query and does not expose student data",()=>{
 const src=fs.readFileSync("app/api/omr/hoja/route.ts","utf8");
 assert.match(src,/createUnifiedAnswerSheet/);
 assert.match(src,/renderUnifiedAnswerSvg/);
 assert.match(src,/Content-Disposition/);
 assert.match(src,/status:400/);
 assert.match(src,/no-store/);
 assert.doesNotMatch(src,/studentId|studentRut|prisma\./);
});
