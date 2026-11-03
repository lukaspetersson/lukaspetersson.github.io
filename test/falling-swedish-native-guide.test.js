const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const figure = `      <figure class="native-game-screenshot">\n        <img src="falling-kitten-android-score-1.png" width="252" height="560" alt="En blå kattunge på marken, 1 poäng och tre röda hjärtan." />\n        <figcaption>Skärmbild från Falling Kitten 1.2 för Android med 1 poäng och tre hjärtan. Spelets gränssnitt är på engelska.</figcaption>\n      </figure>\n\n`;
const ptAlternate = '    <link rel="alternate" hreflang="pt-BR" href="https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-pt-br.html" />\n';
const ptAnchor = '        <a href="falling-kitten-how-to-play-pt-br.html" lang="pt-BR">Português (Brasil)</a>\n';
test("Swedish guide inserts only the bounded native screenshot", () => {
  const html = fs.readFileSync(path.join(__dirname, "../lp-apps/falling-kitten-how-to-play-sv.html"), "utf8");
  assert.equal(html.split(figure).length - 1, 1);
  assert.equal(html.split(ptAlternate).length - 1, 1, "one Portuguese alternate");
  assert.equal(html.split(ptAnchor).length - 1, 1, "one visible Portuguese link");
  assert.equal(
    crypto
      .createHash("sha256")
      .update(
        html
          .replace(ptAlternate, "")
          .replace(ptAnchor, "")
          .replace(figure, "")
          .replace('    <link rel="alternate" hreflang="fr-FR" href="https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-fr.html" />\n', "")
          .replace('        <a href="falling-kitten-how-to-play-fr.html" lang="fr">Français</a>\n', "")
      )
      .digest("hex"),
    "c99a14955198a40b8ed3ce19bb3e182ea45d10a2543a88af2613fb8708ced959"
  );
  assert.equal(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(__dirname, "../lp-apps/falling-kitten-android-score-1.png")))
      .digest("hex"),
    "551001bcd3a81fffa17b5c22029fede3a3d4d2f299302f497adf64b1ce28b793"
  );
});
