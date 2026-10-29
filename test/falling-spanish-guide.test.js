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
