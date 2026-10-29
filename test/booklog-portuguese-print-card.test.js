const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
const removeApprovedGermanLinks = require("./booklog-german-delta");
const html = fs.readFileSync(path.join(root, "lp-apps", "booklog-diario-de-leitura.html"), "utf8");
const english = fs.readFileSync(path.join(root, "lp-apps", "booklog-reading-notes.html"), "utf8");
const css = fs.readFileSync(path.join(root, "lp-apps", "styles.css"), "utf8");
const script = fs.readFileSync(path.join(root, "lp-apps", "script.js"), "utf8");
const normalize = (value) => value.replace(/\s+/g, " ");
const withoutComposer = (value) =>
  value
    .replace('    <link rel="stylesheet" href="booklog-note-composer-1.0.0.css" />\n', "")
    .replace(/      <p class="note-composer-jump"[\s\S]*?<\/p>\n/, "")
    .replace(/      <section class="note-composer"[\s\S]*?<\/section>\n/, "")
    .replace('    <script src="booklog-note-format-pt.js"></script>\n    <script src="booklog-note-composer-pt.js"></script>\n', "");

test("Portuguese guide includes the exact translated blank card using shared print hooks", () => {
  const lede = html.match(/<p class="lede">([\s\S]*?)<\/p>/);
  assert.ok(lede);
  assert.equal(
    normalize(lede[1]).trim(),
    "O BookLog é um aplicativo para Android com interface em inglês. Adicione livros à sua estante no dispositivo e registre avaliações, número de páginas, datas de leitura e anotações."
  );
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
  assert.doesNotMatch(withoutComposer(html), /<input|<textarea|localStorage|sessionStorage/i);
  assert.match(css, /body\.printing-note-card \.print-note-card \{\s*page: booklog-note-card;\s*display: block/);
  assert.match(css, /@page booklog-note-card \{\s*size: auto;\s*margin: 0?\.4in;/);
  assert.doesNotMatch(css, /@page \{/);
  assert.match(script, /afterprint/);
  assert.ok(english.includes('class="printable-note-section"'));
});

test("card insertion preserves normalized Portuguese content outside the card and approved lede, with no added route metadata", () => {
  const section = html.match(/      <section class="printable-note-section"[\s\S]*?<\/article>\n      <\/section>\n/);
  assert.ok(section, "card insertion is present");
  const baselineLede = '<p class="lede">Um diário de leitura pessoal para organizar livros e guardar os detalhes que você quer lembrar.</p>';
  const withoutCard = normalize(
    removeApprovedGermanLinks(withoutComposer(html))
      .replace(section[0], "")
      .replace(/<p class="lede">[\s\S]*?<\/p>/, baselineLede)
  );
  assert.equal(crypto.createHash("sha256").update(withoutCard).digest("hex"), "0436c4e8d27cf09a393564d667da4d8407fa0f46e60aa3633c9471aee48f3084");
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((removeApprovedGermanLinks(html).match(/hreflang=/g) || []).length, 6);
  assert.doesNotMatch(section[0], /<a\b|href=|<input|<textarea|<script|data-/i);
});
