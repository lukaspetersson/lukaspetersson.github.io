const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { formatNote } = require("../lp-apps/booklog-note-format.js");
const root = path.join(__dirname, "../lp-apps");

test("formatNote omits empty inputs and formats one or both thoughts", () => {
  assert.equal(formatNote("", "", ""), "");
  assert.equal(formatNote("", "  idea  ", ""), "What caught my attention?\nidea");
  assert.equal(formatNote("", " idea ", " return "), "What caught my attention?\nidea\n\nWhat do I want to return to?\nreturn");
});
test("formatNote trims outer whitespace only and enforces field limits", () => {
  assert.equal(formatNote("  p  ", " a\n  b  ", ""), "Page or chapter: p\n\nWhat caught my attention?\na\n  b");
  assert.equal(
    formatNote("p".repeat(81), "a".repeat(2001), "b"),
    `Page or chapter: ${"p".repeat(80)}\n\nWhat caught my attention?\n${"a".repeat(2000)}\n\nWhat do I want to return to?\nb`
  );
  assert.equal(formatNote("page", "", ""), "");
});
test("candidate composer is isolated, readiness-gated and has no persistence or network", () => {
  const html = fs.readFileSync(path.join(root, "booklog-reading-notes.html"), "utf8");
  const js = fs.readFileSync(path.join(root, "booklog-note-composer-1.0.0.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "booklog-note-composer-1.0.0.css"), "utf8");
  assert.match(html, /booklog-note-composer-1\.0\.0\.css/);
  assert.match(html, /booklog-note-composer-1\.0\.0\.js/);
  assert.match(css, /--lp-note-composer-ready:\s*1/);
  assert.match(
    css,
    /\.note-composer button \{[\s\S]*?min-height: 2\.8rem;[\s\S]*?padding: 0\.6rem 1rem;[\s\S]*?font:\s*650 0\.92rem\/1\.3 system-ui,\s*sans-serif;/
  );
  assert.match(css, /\.note-composer \[data-copy\]:disabled \{[\s\S]*?cursor: not-allowed;/);
  assert.match(css, /\.note-composer button:focus-visible \{[\s\S]*?outline: 3px solid var\(--blue\);/);
  assert.match(js, /navigator\.clipboard\.writeText/);
  // Uglifier 4.2.0's deployed harmony parser predates these syntaxes.
  assert.doesNotMatch(js, /\?\.|catch\s*\{/);
  assert.match(js, /revision === copiedRevision && preview\.value === copiedValue/);
  assert.doesNotMatch(js, /localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|sendBeacon/);
  assert.match(html, /<section class="note-composer"[^>]* hidden>/);
  assert.match(
    html,
    /<p class="note-composer-jump" hidden>Want to start here\? <a href="#note-composer-heading">Make a note to paste into BookLog<\/a>\.<\/p>/
  );
  assert.match(js, /jump\.hidden = false/);
  assert.match(html, /print-note-card/);
});
