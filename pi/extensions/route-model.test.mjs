// Check route-model's classify() rules. Run: node route-model.test.mjs
// tsx not required — we import the .ts with a type-only pi import (erased at runtime).
import assert from "node:assert";
import { classify } from "./route-model.ts";

const cases = [
  ["rename the helper to fetchUser", "fast"],
  ["fix this typo in the readme", "fast"],
  ["run the tests for the changed files", "fast"],
  ["git commit and push", "fast"],
  ["review this PR for correctness", "strong"],
  ["why does this race condition happen?", "strong"],
  ["design the auth model for granular scopes", "strong"],
  ["explain the rename we just did", "strong"], // reasoning beats mechanical
  ["refactor this to remove the duplication", "strong"],
  ["what's for lunch", null], // no rule → no switch
];

for (const [prompt, want] of cases) {
  const got = classify(prompt)?.tier ?? null;
  assert.strictEqual(got, want, `"${prompt}" → ${got}, want ${want}`);
}
console.log(`ok: ${cases.length} routing cases pass`);
