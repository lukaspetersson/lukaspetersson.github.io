const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "lp-apps");
const guides = [
  ["booklog-reading-notes.html", "Get BookLog on Google Play"],
  ["booklog-reading-notes-sv.html", "Hämta BookLog på Google Play"],
  ["booklog-diario-de-leitura.html", "Baixe o BookLog no Google Play"],
  ["booklog-notas-de-lectura.html", "Descarga BookLog en Google Play"],
  ["booklog-notes-de-lecture.html", "Télécharger BookLog sur Google Play"],
];

test("localized guides place one original Play link after disclosure and before instructions", () => {
  for (const [file, label] of guides) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    assert.equal((html.match(/https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.lukas\.android\.booklog/g) || []).length, 1, file);
    const linkAt = html.indexOf("https://play.google.com/store/apps/details?id=com.lukas.android.booklog");
    const introduction = html.match(/<p\b[^>]*class="lede"[^>]*>[\s\S]*?<\/p>/);
    assert.ok(introduction, `${file}: introduction disclosure exists`);
    assert.ok(linkAt > introduction.index + introduction[0].length, `${file}: link follows introduction`);
    const firstHeading = html.search(/<h2\b/);
    assert.ok(linkAt < firstHeading, `${file}: link precedes instructions`);
    assert.ok(html.includes(label), `${file}: localized original label`);
    assert.match(html, /4\.0\.4/);
    assert.match(html, /class="lede"/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.equal((html.match(/<\/html>/g) || []).length, 1);
    assert.match(html, /<\/html>\s*$/);
  }
});
