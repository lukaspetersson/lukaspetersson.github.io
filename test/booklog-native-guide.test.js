const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "lp-apps/booklog-diario-de-leitura.html"), "utf8");
const image = fs.readFileSync(path.join(root, "lp-apps/booklog-native-note-screen.png"));

test("Portuguese guide uses the verified historical note screenshot as a dated illustration", () => {
  assert.equal(crypto.createHash("sha256").update(image).digest("hex"), "fa3bd388048e7b88a34d8faecf76ade0e80c4e093649cc3c90cc464d5523e424");
  assert.equal(image.length, 124886);
  assert.equal(image.readUInt32BE(16), 1080);
  assert.equal(image.readUInt32BE(20), 2400);
  const notes = html.indexOf("<h2>Registre sua leitura</h2>");
  const bullets = html.indexOf("<ul>", notes);
  const intro = html.indexOf("<p>", html.indexOf("</ul>", bullets));
  const figure = html.indexOf('<figure class="native-book-screen">');
  const nextSection = html.indexOf('<section class="printable-note-section"', figure);
  assert.ok(notes < bullets && bullets < intro && intro < figure && figure < nextSection);
  assert.match(
    html,
    /<img\s+src="booklog-native-note-screen\.png"\s+width="252"\s+height="560"\s+alt="Tela do BookLog para Android com o livro fictício The Lantern Room e uma nota de exemplo em inglês\."\s*\/>/
  );
  assert.ok(
    html.includes("Tela de notas do BookLog para Android, capturada em setembro de 2026 com um livro e uma nota fictícios. A interface é em inglês.")
  );
  assert.match(
    fs.readFileSync(path.join(root, "lp-apps/styles.css"), "utf8"),
    /\.native-game-screenshot,\s*\.native-book-screen\s*\{[\s\S]*?max-width: 270px;[\s\S]*?\}\s*\.native-game-screenshot img,\s*\.native-book-screen img\s*\{[\s\S]*?width: 100%;[\s\S]*?height: auto;/
  );
});

test("native illustration addition preserves key Portuguese copy and page metadata/links", () => {
  for (const text of [
    "Registre sua leitura",
    "Registre sua avaliação, o número de páginas, a data de início e a data de conclusão.",
    "Escreva anotações de leitura sobre o que leu e quer lembrar.",
    "Avaliações, páginas, datas e notas ficam reunidas na mesma estante para você revisitar cada leitura.",
    'rel="canonical" href="https://lukaspetersson.com/lp-apps/booklog-diario-de-leitura.html"',
    'hreflang="pt-BR" href="https://lukaspetersson.com/lp-apps/booklog-diario-de-leitura.html"',
    'href="booklog-privacy.html"',
    "Baixe o BookLog no Google Play",
  ])
    assert.ok(html.includes(text), `missing preserved text/link: ${text}`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((html.match(/hreflang="pt-BR"/g) || []).length, 1);
});
