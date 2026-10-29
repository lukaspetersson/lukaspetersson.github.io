const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { formatNoteEs } = require("../lp-apps/booklog-note-format-es.js");

test("formats only nonblank Spanish sections and preserves internal newlines", () => {
  assert.equal(formatNoteEs("  12  ", "  Idea\ncon detalle  ", ""), "Página/capítulo: 12\n\nMe llamó la atención:\nIdea\ncon detalle");
  assert.equal(formatNoteEs("", "", "Volver"), "Para volver a leer:\nVolver");
  assert.equal(formatNoteEs("  ", "", ""), "");
  assert.equal(
    formatNoteEs("página 📚".repeat(20), "ñ🙂\ntexto", "segunda"),
    `Página/capítulo: ${"página 📚".repeat(20).slice(0, 80)}\n\nMe llamó la atención:\nñ🙂\ntexto\n\nPara volver a leer:\nsegunda`
  );
});
test("localization controls and privacy/readiness boundaries are present", () => {
  const html = fs.readFileSync(path.join(__dirname, "../lp-apps/booklog-notas-de-lectura.html"), "utf8");
  const js = fs.readFileSync(path.join(__dirname, "../lp-apps/booklog-note-composer-es.js"), "utf8");
  assert.match(html, /class="note-composer"[^>]*hidden/);
  assert.match(html, /maxlength="80"/);
  assert.equal((html.match(/maxlength="2000"/g) || []).length, 2);
  assert.match(html, /Esta página no envía ni guarda lo que escribes/);
  assert.match(js, /--lp-note-composer-ready/);
  assert.match(js, /revision === copiedRevision/);
  assert.match(js, /preview\.focus\(\)[\s\S]*preview\.select\(\)/);
  assert.doesNotMatch(js, /\?\.|catch\s*\{/);
  assert.doesNotMatch(js, /localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon/);
});
