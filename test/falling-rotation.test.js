const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const rotation = require("../lp-apps/falling-rotation.js");

test("illustration turns do not animate through intermediate orientations", () => {
  const css = fs.readFileSync(path.join(__dirname, "../lp-apps/styles.css"), "utf8");
  assert.doesNotMatch(css, /\.rotation-kitten(?:\s*,\s*\.rotation-kitten\s+svg)?\s*\{[^}]*transition/s);
});

test("quarter turns wrap through the four orientations", () => {
  assert.deepEqual([0, 1, 2, 3].map(rotation.nextOrientation), [1, 2, 3, 0]);
});
test("alternate starting angles cycle 1, 2, 3 and reset orientation", () => {
  assert.deepEqual([1, 2, 3, 1].map(rotation.nextStartingAngle), [2, 3, 1, 2]);
});
test("upright is orientation zero only", () => {
  assert.deepEqual([0, 1, 2, 3].map(rotation.isUpright), [true, false, false, false]);
});
