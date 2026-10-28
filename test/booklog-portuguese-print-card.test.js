const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "lp-apps", "booklog-diario-de-leitura.html"), "utf8");
const english = fs.readFileSync(path.join(root, "lp-apps", "booklog-reading-notes.html"), "utf8");
const css = fs.readFileSync(path.join(root, "lp-apps", "styles.css"), "utf8");
const script = fs.readFileSync(path.join(root, "lp-apps", "script.js"), "utf8");
const normalize = (value) => value.replace(/\s+/g, " ");

test("Portuguese guide includes the exact translated blank card using shared print hooks", () => {
  for (const copy of [
    "Uma nota de leitura no papel",
    "Prefere começar no papel? Imprima este cartão em branco e guarde-o com o seu livro. São sugestões para as suas próprias anotações, não campos adicionais no aplicativo.",
    "Imprimir o cartão de leitura",
    "Nota de leitura",
    "Título do livro",
    "Autor",
    "Edição",
    "Página ou capítulo",
    "Data",
    "Objetivo",
    "Lembrar",
    "Questionar",
    "Relacionar",
    "Decidir",
    "O que chamou a minha atenção?",
    "O que quero retomar?",
    "Notas de leitura do BookLog · lukaspetersson.com/lp-apps/booklog-diario-de-leitura.html",
  ])
    assert.ok(normalize(html).includes(copy), `missing translated copy: ${copy}`);
  assert.match(html, /<button class="print-note-button" type="button">Imprimir o cartão de leitura<\/button>/);
  assert.equal((html.match(/class="printable-note-section"/g) || []).length, 1);
  assert.doesNotMatch(html, /<input|<textarea|localStorage|sessionStorage/i);
  assert.match(css, /body\.printing-note-card \.print-note-card \{\s*page: booklog-note-card;\s*display: block/);
  assert.match(css, /@page booklog-note-card \{\s*size: auto;\s*margin: 0?\.4in;/);
  assert.doesNotMatch(css, /@page \{/);
  assert.match(script, /afterprint/);
  assert.ok(english.includes('class="printable-note-section"'));
});

test("insertion preserves all Portuguese guide bytes outside the card and adds no route metadata", () => {
  const section = html.match(/      <section class="printable-note-section"[\s\S]*?<\/article>\n      <\/section>\n/);
  assert.ok(section, "card insertion is present");
  const withoutCard = html.replace(section[0], "");
  assert.equal(crypto.createHash("sha256").update(withoutCard).digest("hex"), "05e300a0b5b6e66639a4853c71ae5c80678147a6b1172e1c9bc993d8bd5b2f7e");
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((html.match(/hreflang=/g) || []).length, 6);
  assert.doesNotMatch(section[0], /<a\b|href=|<input|<textarea|<script|data-/i);
});
