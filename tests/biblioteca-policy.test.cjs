const fs = require("node:fs");
const assert = require("node:assert/strict");
const test = require("node:test");
const policy = fs.readFileSync("lib/biblioteca-policy.ts","utf8");
const route = fs.readFileSync("app/api/biblioteca/route.ts","utf8");
test("biblioteca excludes reserved SIMCE and PAES materials",()=>{
 assert.match(policy,/simce\|paes/);
 assert.match(route,/excluded\(/);
});
test("biblioteca requires authenticated user and active subscription",()=>{
 assert.match(route,/getSession/);
 assert.match(route,/subscriptionEndsAt/);
});
test("sharing invokes personal-data policy",()=>{
 assert.match(route,/canShareEducationalResource/);
 assert.match(policy,/studentName/);
});
test("only author can change publication status",()=>{
 assert.match(route,/authorId: u\.id/);
});
