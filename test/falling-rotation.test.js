const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
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

function runUi(styleValue) {
  const listeners = {};
  const kitten = { style: {} };
  const status = { textContent: "" };
  const turn = { addEventListener: (name, handler) => (listeners.turn = handler), setAttribute() {} };
  const another = { addEventListener: (name, handler) => (listeners.another = handler) };
  const practice = {
    hidden: true,
    querySelector(selector) {
      return { ".rotation-kitten": kitten, "[data-orientation]": status, "[data-turn]": turn, "[data-another]": another }[selector];
    },
  };
  const context = {
    document: { querySelector: () => practice },
    window: { FallingRotation: rotation, getComputedStyle: () => ({ getPropertyValue: () => styleValue }) },
    FallingRotation: rotation,
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../lp-apps/falling-rotation-ui.js"), "utf8"), context);
  return { practice, listeners, kitten, status };
}

test("missing or stale rotation CSS keeps the practice fail-closed", () => {
  for (const value of ["", "0"]) {
    const { practice, listeners } = runUi(value);
    assert.equal(practice.hidden, true);
    assert.deepEqual(Object.keys(listeners), []);
  }
});

test("current rotation CSS enables a functional quarter-turn practice", () => {
  const { practice, listeners, kitten, status } = runUi(" 1 ");
  assert.equal(practice.hidden, false);
  listeners.turn();
  assert.equal(kitten.style.transform, "rotate(180deg)");
  assert.equal(status.textContent, "Paws point up. Turn the kitten upright.");
  listeners.another();
  assert.equal(kitten.style.transform, "rotate(180deg)");
});
