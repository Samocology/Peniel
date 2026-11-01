import test from "node:test";
import assert from "node:assert/strict";

import { locationMatches, normalizeLocationLabel } from "./location.ts";

test("normalizeLocationLabel keeps Nigeria state labels consistent", () => {
  assert.equal(normalizeLocationLabel("Lagos"), "Lagos State");
  assert.equal(normalizeLocationLabel("Lagos, NG"), "Lagos State");
  assert.equal(normalizeLocationLabel("Abuja, NG"), "Federal Capital Territory");
});

test("locationMatches filters by state in vendor addresses", () => {
  assert.equal(locationMatches("15 Admiralty Way, Lekki Phase 1, Lagos", "Lagos State"), true);
  assert.equal(locationMatches("Wuse Market, Abuja", "Lagos State"), false);
  assert.equal(locationMatches("Port Harcourt Garden, Rivers", "Rivers State"), true);
  assert.equal(locationMatches("Wuse Market, Abuja", "Federal Capital Territory"), true);
});
