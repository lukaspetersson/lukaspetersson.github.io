const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const site = path.join(__dirname, "..", "lp-apps");
const read = (name) => fs.readFileSync(path.join(site, name), "utf8");
const esUrl = "https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-es.html";

test("Spanish Falling Kitten guide matches reviewed copy and metadata", () => {
  const html = read("falling-kitten-how-to-play-es.html");
  const title = "Falling Kitten para Android: cómo girar gatitos — LP Apps";
  assert.ok(html.includes(`<title>${title}</title>`));
  assert.ok(html.includes(`<meta property="og:title" content="${title}" />`));
  assert.ok(html.includes(`<meta name="twitter:title" content="${title}" />`));
  const normalizedHtml = html.replace(/\s+/g, " ");
  for (const text of [
    'lang="es-ES"',
    "Cómo jugar a Falling Kitten",
    "Falling Kitten 1.2 para Android",
    "dispositivo configurado en español",
    "La puntuación comienza en 0 y tienes tres corazones.",
    "un cuarto de vuelta (90°)",
    "un punto",
    "pierdes un corazón",
    "icono de repetición",
    "no requiere una cuenta",
    "No es una mascota virtual",
    "Los botones y mensajes de la aplicación están en inglés",
    "details?id=com.lukas.android.fallingkitten&amp;hl=es&amp;gl=ES",
    "social-falling-kitten.png",
  ])
    assert.ok(normalizedHtml.includes(text), `missing ${text}`);
  assert.equal((html.match(/rel=\"canonical\"/g) || []).length, 1);
  assert.ok(html.includes(`<link rel=\"canonical\" href=\"${esUrl}\"`));
  for (const locale of ["en", "sv-SE", "es-ES", "x-default"]) assert.match(html, new RegExp(`hreflang=\"${locale}\"`));
  assert.doesNotMatch(html, /paus|pause|reanudar/i);
  for (const key of ["og:title", "og:description", "og:url", "og:image", "twitter:title", "twitter:description", "twitter:image"])
    assert.equal((html.match(new RegExp(`(?:property|name)=\"${key}\"`, "g")) || []).length, 1, `${key} must be unique`);
});

test("Spanish guide is discoverable and locale siblings link reciprocally", () => {
  for (const name of ["falling-kitten-how-to-play.html", "falling-kitten-how-to-play-sv.html"]) {
    const html = read(name);
    assert.match(html, /hreflang=\"es-ES\"[^>]+falling-kitten-how-to-play-es.html/);
    assert.match(html, /href=\"falling-kitten-how-to-play-es.html\"/);
  }
  assert.match(read("index.html"), /falling-kitten-how-to-play-es.html/);
  assert.match(read("index-sv.html"), /falling-kitten-how-to-play-es.html/);
  assert.match(read("sitemap.xml"), /<loc>https:\/\/lukaspetersson\.com\/lp-apps\/falling-kitten-how-to-play-es\.html<\/loc>/);
});

test("English guide uses the unchanged bounded native score screenshot", () => {
  const html = read("falling-kitten-how-to-play.html");
  assert.match(
    html,
    /<figure class="native-game-screenshot">[\s\S]*?<img\s+src="falling-kitten-android-score-1\.png"\s+width="252"\s+height="560"\s+alt="A blue kitten on the ground, a score of 1, three red hearts, and a pause button\."\s*\/>\s*<figcaption>Android game screen showing 1 point and three hearts\.<\/figcaption>\s*<\/figure>/
  );
  assert.equal((html.match(/class="native-game-screenshot"/g) || []).length, 1);
  const asset = fs.readFileSync(path.join(site, "falling-kitten-android-score-1.png"));
  assert.equal(asset.length, 236098);
  assert.equal(
    require("node:crypto").createHash("sha256").update(asset).digest("hex"),
    "551001bcd3a81fffa17b5c22029fede3a3d4d2f299302f497adf64b1ce28b793"
  );
  assert.equal(asset.readUInt32BE(16), 1080);
  assert.equal(asset.readUInt32BE(20), 2400);
});

test("Spanish guide screenshot is the exact bounded native score image", () => {
  const html = read("falling-kitten-how-to-play-es.html");
  const figure = `      <figure class="native-game-screenshot">\n        <img\n          src="falling-kitten-android-score-1.png"\n          width="252"\n          height="560"\n          alt="Un gatito azul en el suelo, una puntuación de 1 y tres corazones rojos."\n        />\n        <figcaption>Pantalla del juego para Android con 1 punto y tres corazones.</figcaption>\n      </figure>\n\n`;
  assert.equal((html.match(/<figure class="native-game-screenshot">/g) || []).length, 1);
  assert.ok(html.includes(figure));
  const baseline = html.replace(figure, "");
  assert.equal(
    require("node:crypto").createHash("sha256").update(baseline).digest("hex"),
    "84b6f68cbf929d0b0ed2799374b021fc207c7f5e89928ebe01acae0b82f8a968"
  );
  const asset = fs.readFileSync(path.join(site, "falling-kitten-android-score-1.png"));
  assert.equal(
    require("node:crypto").createHash("sha256").update(asset).digest("hex"),
    "551001bcd3a81fffa17b5c22029fede3a3d4d2f299302f497adf64b1ce28b793"
  );
  assert.equal(asset.readUInt32BE(16), 1080);
  assert.equal(asset.readUInt32BE(20), 2400);
});
