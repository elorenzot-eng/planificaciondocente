const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Execute the actual Next.js route handlers, replacing only auth, Prisma and NextResponse.
function loadRoute({ user, license, resources = [] }) {
  const filename = path.resolve("app/api/biblioteca/route.ts");
  const source = fs.readFileSync(filename, "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const calls = [];
  const db = {
    user: { findUnique: async () => user },
    school: { findFirst: async () => ({ id: user?.schoolId }), findMany: async () => [] },
    pedagogicalModuleLicense: { findFirst: async () => license ? { id: "licensed" } : null },
    sharedLibraryResource: {
      findMany: async ({ where }) => { calls.push(where); return resources.filter(r => where.authorId ? r.authorId === where.authorId : r.published); },
      findFirst: async ({ where }) => resources.find(r => r.id === where.id && r.authorId === where.authorId) || null,
      updateMany: async ({ where, data }) => {
        const row = resources.find(r => r.id === where.id && r.authorId === where.authorId);
        if (!row) return { count: 0 };
        row.published = data.published;
        return { count: 1 };
      }
    }
  };
  const fake = new Module(filename, module);
  fake.filename = filename;
  fake.paths = Module._nodeModulePaths(path.dirname(filename));
  fake.require = id => {
    if (id.includes("biblioteca-policy")) return { canShareEducationalResource: () => true };
    if (id === "next/server") return { NextResponse: { json: (body, options = {}) => ({ status: options.status || 200, body }) } };
    if (id.includes("lib/auth")) return { getSession: async () => ({ id: "user-1" }) };
    if (id.includes("lib/prisma")) return { prisma: db };
    return require(id);
  };
  fake._compile(js, filename);
  return { route: fake.exports, calls };
}
const now = Date.now();
const individual = status => ({
  id: "user-1", active: true, role: "DOCENTE", accountType: "INDIVIDUAL",
  organization: { active: true }, school: null,
  subscriptionStatus: status, subscriptionEndsAt: new Date(now + 86400000),
  trialEndsAt: new Date(now + 86400000)
});
const institutional = () => ({
  id: "user-1", active: true, role: "DOCENTE", accountType: "INSTITUTIONAL",
  organizationId: "org-1", organization: { active: true },
  schoolId: "school-1", school: { active: true }
});
const get = () => new Request("https://educantay.example/api/biblioteca");
const patch = (id, published) => new Request("https://educantay.example/api/biblioteca", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, published }) });

test("real GET handler denies expired individual subscription", async () => {
  const user = individual("CANCELED");
  const { route } = loadRoute({ user });
  assert.equal((await route.GET(get())).status, 403);
});
test("real GET handler accepts current individual subscription", async () => {
  const { route } = loadRoute({ user: individual("ACTIVE") });
  assert.equal((await route.GET(get())).status, 200);
});
test("real GET handler denies institution without pedagogical license", async () => {
  const { route } = loadRoute({ user: institutional(), license: false });
  assert.equal((await route.GET(get())).status, 403);
});
test("real GET handler accepts licensed institution", async () => {
  const { route } = loadRoute({ user: institutional(), license: true });
  assert.equal((await route.GET(get())).status, 200);
});
test("real GET handler only returns published resources", async () => {
  const resources = [
    { id: "private", authorId: "user-1", published: false, title: "Privado" },
    { id: "public", authorId: "other", published: true, title: "Público" }
  ];
  const { route } = loadRoute({ user: individual("ACTIVE"), resources });
  const result = await route.GET(get());
  assert.deepEqual(result.body.resources.map(r => r.id), ["public"]);
});
test("real PATCH handler prevents editing another author's resource", async () => {
  const resources = [{ id: "other", authorId: "another", published: true, title: "Ajeno" }];
  const { route } = loadRoute({ user: individual("ACTIVE"), resources });
  assert.equal((await route.PATCH(patch("other", false))).status, 404);
  assert.equal(resources[0].published, true);
});
test("real PATCH handler lets author withdraw a published resource", async () => {
  const resources = [{ id: "mine", authorId: "user-1", published: true, title: "Mío", content: {} }];
  const { route } = loadRoute({ user: individual("ACTIVE"), resources });
  assert.equal((await route.PATCH(patch("mine", false))).status, 200);
  assert.equal(resources[0].published, false);
});

test("inactive user cannot access Biblioteca even with active subscription", async () => {
  const user = individual("ACTIVE");
  user.active = false;
  const { route } = loadRoute({ user });
  assert.equal((await route.GET(get())).status, 403);
});
test("expired ACTIVE subscription is rejected", async () => {
  const user = individual("ACTIVE");
  user.subscriptionEndsAt = new Date(now - 86400000);
  const { route } = loadRoute({ user });
  assert.equal((await route.GET(get())).status, 403);
});
test("current trial grants access, expired trial does not", async () => {
  const user = individual("TRIAL");
  const { route } = loadRoute({ user });
  assert.equal((await route.GET(get())).status, 200);
  user.trialEndsAt = new Date(now - 86400000);
  assert.equal((await route.GET(get())).status, 403);
});
test("institution with inactive organization is rejected despite license", async () => {
  const user = institutional();
  user.organization.active = false;
  const { route } = loadRoute({ user, license: true });
  assert.equal((await route.GET(get())).status, 403);
});
test("institution with inactive school is rejected despite license", async () => {
  const user = institutional();
  user.school.active = false;
  const { route } = loadRoute({ user, license: true });
  assert.equal((await route.GET(get())).status, 403);
});
test("unknown account type is rejected", async () => {
  const user = individual("ACTIVE");
  user.accountType = "UNRECOGNIZED";
  const { route } = loadRoute({ user });
  assert.equal((await route.GET(get())).status, 403);
});
test("author's private resources are visible only in mine view", async () => {
  const resources = [
    { id: "private", authorId: "user-1", published: false, title: "Privado" },
    { id: "other", authorId: "other", published: false, title: "Ajeno" }
  ];
  const { route } = loadRoute({ user: individual("ACTIVE"), resources });
  const result = await route.GET(new Request("https://educantay.example/api/biblioteca?mine=1"));
  assert.deepEqual(result.body.resources.map(r => r.id), ["private"]);
});
