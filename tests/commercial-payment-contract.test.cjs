const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (name) => fs.readFileSync(path.join(__dirname, "..", name), "utf8");

test("Individual subscription price is consistent across checkout, landing and SEO", () => {
  const checkout = read("app/api/flow-checkout/route.ts");
  const landing = read("app/page.tsx");
  const layout = read("app/layout.tsx");
  assert.match(checkout, /amount:\s*9990/);
  assert.match(checkout, /amount:"9990"/);
  assert.match(landing, /\$9\.990/);
  assert.match(layout, /price:\s*"9990"/);
});

test("Flow callbacks check order ownership, token, amount and idempotency", () => {
  for (const file of ["app/api/flow-confirmation/route.ts", "app/api/flow-return/route.ts"]) {
    const source = read(file);
    assert.match(source, /payment\.flowToken\s*!==\s*token/);
    assert.match(source, /Number\(d\.amount\)\s*===\s*payment\.amount/);
    assert.match(source, /fresh\.status\s*===\s*"PAID"/);
    assert.match(source, /user\.accountType\s*!==\s*"INDIVIDUAL"/);
  }
});
