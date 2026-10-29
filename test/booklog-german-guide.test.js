const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "lp-apps/booklog-lesetagebuch.html"), "utf8");
test("German guide has approved copy, language metadata, and privacy boundaries", () => {
  const copy = JSON.parse(fs.readFileSync(path.join(root, "test/booklog-german-guide-copy.json"), "utf8"));
  const normalizedHtml = html.replace(/\s+/g, " ");
  for (const text of [
    copy.h1,
    copy.lede,
    copy.interface_warning,
    copy.cta,
    ...copy.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...copy.backup.paragraphs,
  ])
    assert.ok(normalizedHtml.includes(text), `missing approved text: ${text}`);
  assert.ok(normalizedHtml.indexOf(copy.interface_warning) < normalizedHtml.indexOf(copy.cta));
  assert.match(html, /<html lang="de">/);
  assert.match(html, /hreflang="de"/);
  assert.match(html, /rel="canonical" href="https:\/\/lukaspetersson\.com\/lp-apps\/booklog-lesetagebuch\.html"/);
  for (const label of ["Settings", "Export shelf and notes", "Restore shelf and notes"]) assert.ok(normalizedHtml.includes(label));
  assert.equal((html.match(/<button class="print-note-button"/g) || []).length, 1);
  assert.match(html, /<section class="printable-note-section">[\s\S]*?<article class="print-note-card">/);
  assert.match(html, /booklog-privacy\.html/);
  assert.match(html, /booklog-account-deletion\.html/);
  assert.match(html, /booklog-book-lookup\.html/);
  assert.match(html, /utm_campaign%3Dportfolio_2026/);
  assert.doesNotMatch(html, /note-composer|booklog-note-composer/);
});
test("five existing reading guides gain reciprocal German links", () => {
  for (const file of [
    "booklog-reading-notes.html",
    "booklog-reading-notes-sv.html",
    "booklog-diario-de-leitura.html",
    "booklog-notas-de-lectura.html",
    "booklog-notes-de-lecture.html",
  ]) {
    const s = fs.readFileSync(path.join(root, "lp-apps", file), "utf8");
    assert.equal(
      (s.match(/<link rel="alternate" hreflang="de" href="https:\/\/lukaspetersson\.com\/lp-apps\/booklog-lesetagebuch\.html" \/>/g) || []).length,
      1
    );
    assert.equal((s.match(/<a href="booklog-lesetagebuch\.html" lang="de">Deutsch<\/a>/g) || []).length, 1);
  }
});
