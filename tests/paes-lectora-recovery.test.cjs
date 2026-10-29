const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ui = fs.readFileSync(path.join(__dirname, "../app/ensayos-paes/piloto/page.tsx"), "utf8");
const api = fs.readFileSync(path.join(__dirname, "../app/api/paes/lectora/full-pilot/route.ts"), "utf8");
test("completed 30/30 jobs open through existing jobId", () => {
 assert.match(ui, /if \(job\.nextPart !== 30\) return;/);
 assert.match(ui, /jobId:job\.id,difficulty:job\.difficulty/);
 assert.match(ui, /setResult\(data\);setJobId\(job\.id\);setProgress\(30\)/);
});
test("completed jobs require 65 items and printable documents", () => {
 assert.match(ui, /data\.count !== 65/);
 assert.match(ui, /!data\.studentHtml \|\| !data\.teacherHtml/);
 assert.match(api, /reviewLectoraExam\(exam, INTERNAL_65_MATRIX\)/);
});
test("recovery filters by authenticated owner and completed path precedes generation", () => {
 assert.match(api, /where: \{ userId: session\.id/);
 assert.match(api, /job\.userId!==session\.id/);
 assert.ok(api.indexOf("if (job.nextPart === 30)") < api.indexOf("await assertPaesAiAccess"));
});
