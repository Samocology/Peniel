import assert from "node:assert/strict";
import test from "node:test";

import { isSameOriginMutation, json, readJsonObject } from "./http.ts";

test("JSON reader accepts object bodies and rejects invalid or oversized bodies", async () => {
  const valid = await readJsonObject(
    new Request("https://peniel.test/api", {
      method: "POST",
      body: JSON.stringify({ value: 3 }),
    }),
  );
  assert.deepEqual(valid, { value: 3 });

  const invalid = await readJsonObject(
    new Request("https://peniel.test/api", { method: "POST", body: "[]" }),
  );
  assert.equal(invalid, null);

  const oversized = await readJsonObject(
    new Request("https://peniel.test/api", { method: "POST", body: "12345" }),
    4,
  );
  assert.equal(oversized, null);
});

test("mutation origin check permits only the request's own origin", () => {
  assert.equal(
    isSameOriginMutation(
      new Request("https://peniel.test/api/auth/login", {
        method: "POST",
        headers: { origin: "https://peniel.test" },
      }),
    ),
    true,
  );
  assert.equal(
    isSameOriginMutation(
      new Request("https://peniel.test/api/auth/login", {
        method: "POST",
        headers: { origin: "https://attacker.test" },
      }),
    ),
    false,
  );
});

test("JSON responses are explicitly non-cacheable", () => {
  const response = json({ ok: true });
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(response.headers.get("cache-control"), "no-store");
});
