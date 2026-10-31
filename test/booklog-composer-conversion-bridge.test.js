const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "lp-apps");
const cases = [
  [
    "booklog-reading-notes.html",
    "Get BookLog on Google Play",
    "Keep your reading notes with their books in BookLog. Get BookLog on Google Play, then paste the note into the book’s notes field yourself.",
  ],
  [
    "booklog-notas-de-lectura.html",
    "Descarga BookLog en Google Play",
    "Guarda tus notas de lectura junto a sus libros en BookLog. Descarga BookLog en Google Play y pega la nota manualmente en el campo de notas del libro.",
  ],
  [
    "booklog-diario-de-leitura.html",
    "Baixe o BookLog no Google Play",
    "Guarde suas notas de leitura junto aos livros no BookLog. Baixe o BookLog no Google Play e cole a nota manualmente no campo de notas do livro. A interface do app está em inglês.",
  ],
];

test("localized composer bridges to the existing Play CTA and manual paste", () => {
  for (const [file, label, copy] of cases) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    const composer = html.match(/<section class="note-composer"[\s\S]*?<\/section>/);
    assert.ok(composer, `${file}: composer exists`);
    const topCta = html.match(new RegExp(`<a\\b[^>]*href="([^"]*play\\.google\\.com[^"]*)"[^>]*>[\\s\\S]*?${label}[\\s\\S]*?<\\/a>`));
    assert.ok(topCta, `${file}: top CTA exists`);
    const composerText = composer[0]
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.])/g, "$1");
    assert.ok(composerText.includes(copy), `${file}: exact manual-paste copy`);
    const playHrefs = [...html.matchAll(/href="([^"]*play\.google\.com[^"]*)"/g)].map((match) => match[1]);
    assert.equal(playHrefs[0], topCta[1], `${file}: top CTA href`);
    assert.equal(playHrefs[playHrefs.length - 1], topCta[1], `${file}: composer reuses exact top CTA href`);
    assert.ok(composerText.includes(label), `${file}: exact locale link label`);
    const status = composer[0].match(/<p aria-live="polite">([^<]*)/);
    assert.ok(status && composerText.indexOf(status[1]) < composerText.lastIndexOf(label), `${file}: CTA follows status`);
    assert.match(composer[0], /your text|no envía|não salva/i);
  }
});
