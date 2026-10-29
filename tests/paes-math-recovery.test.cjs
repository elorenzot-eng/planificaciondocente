const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const m1 = read("app/ensayos-paes/m1/piloto/page.tsx");
const m2 = read("app/ensayos-paes/m2/piloto/page.tsx");
const m1api = read("app/api/paes/m1/recover/route.ts");
const m2api = read("app/api/paes/m2/recover/route.ts");
test("M1 recovery is scoped to authenticated user and 65 questions", () => {
 assert.match(m1api, /userId:session\.id/);
 assert.match(m1, /run\(item\)/);
 assert.match(m1, /data\.status==="COMPLETED"/);
 assert.match(m1, /setProgress\(65\)/);
});
test("M2 recovery is scoped to authenticated user and 55 questions", () => {
 assert.match(m2api, /userId:session\.id/);
 assert.match(m2api, /difficulty:\{startsWith:"M2:"\}/);
 assert.match(m2, /run\(item\)/);
 assert.match(m2, /data\.status==="COMPLETED"/);
 assert.match(m2, /setProgress\(55\)/);
});
test("M1 and M2 have independent student, teacher and answer sheet actions", () => {
 for (const page of [m1,m2]) {
  assert.match(page, /print\(result\.studentHtml\)/);
  assert.match(page, /print\(result\.teacherHtml\)/);
  assert.match(page, /printAnswerSheet/);
  assert.match(page, /\/api\/paes\/saved/);
 }
});
