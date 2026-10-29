const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
const removeApprovedGermanLinks = require("./booklog-german-delta");
const html = fs.readFileSync(path.join(root, "lp-apps", "booklog-notes-de-lecture.html"), "utf8");
const css = fs.readFileSync(path.join(root, "lp-apps", "styles.css"), "utf8");
const script = fs.readFileSync(path.join(root, "lp-apps", "script.js"), "utf8");
const normalize = (value) => value.replace(/\s+/g, " ");

test("French guide contains the exact blank printable note card and shared print hooks", () => {
  for (const copy of [
    "Une note de lecture sur papier",
    "Vous préférez commencer sur papier ? Imprimez cette fiche vierge et glissez-la dans votre livre. Elle propose des repères pour vos propres notes, pas des champs supplémentaires dans l’application.",
    "Imprimer la fiche",
    "Note de lecture",
    "Titre du livre",
    "Auteur",
    "Édition",
    "Page ou chapitre",
    "Date",
    "But de la note",
    "Retenir",
    "Questionner",
    "Relier",
    "Décider",
    "Qu’est-ce qui a retenu mon attention ?",
    "Que voudrais-je reprendre ?",
    "Notes de lecture de BookLog · lukaspetersson.com/lp-apps/booklog-notes-de-lecture.html",
  ])
    assert.ok(normalize(html).includes(copy), `missing exact copy: ${copy}`);
  assert.match(html, /<button class="print-note-button" type="button">Imprimer la fiche<\/button>/);
  assert.equal((html.match(/class="printable-note-section"/g) || []).length, 1);
  assert.doesNotMatch(html, /<input|<textarea|localStorage|sessionStorage/i);
  assert.match(css, /body\.printing-note-card \.print-note-card \{\s*page: booklog-note-card;\s*display: block/);
  assert.match(css, /@page booklog-note-card \{\s*size: auto;\s*margin: 0?\.4in;/);
  assert.doesNotMatch(css, /@page \{/);
  assert.match(script, /afterprint/);
  assert.match(html, /☐ Retenir &nbsp; ☐ Questionner &nbsp; ☐ Relier &nbsp; ☐ Décider/);
  const section = html.match(/      <section class="printable-note-section"[\s\S]*?<\/article>\n      <\/section>\n/);
  assert.ok(section);
  assert.doesNotMatch(section[0], /<a\b|href=|<input|<textarea|<script|data-/i);
});

test("French card insertion preserves every pre-existing guide byte outside the section", () => {
  const section = html.match(/      <section class="printable-note-section"[\s\S]*?<\/article>\n      <\/section>\n/);
  assert.ok(section, "card insertion exists");
  const withoutCard = removeApprovedGermanLinks(html).replace(section[0], "");
  assert.equal(crypto.createHash("sha256").update(withoutCard).digest("hex"), "38284d9d9e8f20f1abc76cab75a50099df14cc19591b328845c1e596ae2dd4cf");
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((removeApprovedGermanLinks(html).match(/hreflang=/g) || []).length, 6);
});
