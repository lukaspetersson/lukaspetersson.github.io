const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const site = path.join(__dirname, "..", "lp-apps");
const read = (name) => fs.readFileSync(path.join(site, name), "utf8");
const target = "booklog-notes-de-lecture.html";
const canonical = `https://lukaspetersson.com/lp-apps/${target}`;
const siblings = [
  ["en", "booklog-reading-notes.html"],
  ["sv-SE", "booklog-reading-notes-sv.html"],
  ["pt-BR", "booklog-diario-de-leitura.html"],
  ["es-ES", "booklog-notas-de-lectura.html"],
  ["fr-FR", target],
  ["x-default", "booklog-reading-notes.html"],
];

test("French guide preserves reviewed content, English UI labels and data boundaries", () => {
  const html = read(target);
  for (const phrase of [
    "BookLog 4.0.7",
    "interface actuelle de BookLog est en anglais",
    "Add a book",
    "Title",
    "Author",
    "Add notes",
    "Save",
    "Settings",
    "Filter",
    "Order by",
    "Show all",
    "To read",
    "Reading",
    "Finished",
    "Rating",
    "Pages",
    "Start Date",
    "Finish date",
    "Open Library",
    "sans créer de compte",
    "désinstaller BookLog supprime les données locales",
    "Export shelf and notes",
    "elle ne synchronise pas la bibliothèque locale actuelle",
    "ne propose pas de scanner de codes-barres",
    "hl=fr&amp;gl=FR",
    "Restore shelf and notes",
    "Restore missing",
    "notes privées",
    "identifiant déjà présent sur l’appareil restent inchangés",
    "fichier incomplet",
  ])
    assert.ok(html.replace(/\s+/g, " ").includes(phrase), `missing ${phrase}`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  for (const [lang, page] of siblings) assert.match(html, new RegExp(`hreflang="${lang}"[^>]+${page.replaceAll(".", "\\.")}`));
  for (const attr of ["og:title", "og:description", "og:url", "og:image", "twitter:title", "twitter:description", "twitter:image"])
    assert.equal((html.match(new RegExp(`(?:property|name)="${attr}"`, "g")) || []).length, 1, `${attr} uniqueness`);
  assert.match(html, /og:locale" content="fr_FR/);
  assert.match(html, /og:image:width" content="3600/);
  assert.match(html, /og:image:height" content="1890/);
  assert.match(html, /utm_source%3Dlp_apps%26utm_medium%3Dreferral%26utm_campaign%3Dportfolio_2026/);
  assert.match(html, /booklog-book-lookup\.html">\(en anglais\)/);
  assert.doesNotMatch(html, /href="[^\"]+\.(?:csv|json|zip)"|export(?:ation)?[^<]{0,60}(?:disponible|possible)/i);
  assert.doesNotMatch(html, /download attribution|attributed downloads|downloads are attributed/i);
  for (const label of ["Mémoriser", "Questionner", "Relier", "Décider"]) assert.ok(html.includes(label));
});

test("French hreflang is reciprocal and visible without changing sibling content", () => {
  for (const [, page] of siblings.slice(0, 4)) {
    const html = read(page);
    assert.ok(html.includes(`hreflang="fr-FR" href="${canonical}"`), `${page} alternate`);
    assert.ok(html.includes(`href="${target}"`), `${page} visible link`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page} must not duplicate its body`);
    assert.equal((html.match(/<\/html>/g) || []).length, 1, `${page} must be one document`);
    assert.equal(html.slice(html.indexOf("</html>") + 7).trim(), "", `${page} must end at the closing html tag`);
  }
});

test("only the French guide URL is newly added to sitemap", () => {
  const xml = read("sitemap.xml");
  assert.equal((xml.match(new RegExp(`<loc>${canonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>`, "g")) || []).length, 1);
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locations.length, 15);
  assert.equal(new Set(locations).size, 15);
});

const guides = [
  "booklog-reading-notes.html",
  "booklog-reading-notes-sv.html",
  "booklog-diario-de-leitura.html",
  "booklog-notas-de-lectura.html",
  "booklog-notes-de-lecture.html",
];

test("all BookLog reading guides place French in their single language group and styles allow wrapping", () => {
  const css = fs.readFileSync(path.join(site, "styles.css"), "utf8");
  assert.match(css, /\.language-links\s*\{[^}]*flex-wrap:\s*wrap/);
  assert.match(css, /\.header-inner nav\s*\{[^}]*max-width:\s*100%/);
  for (const guide of guides) {
    const html = fs.readFileSync(path.join(site, guide), "utf8");
    const groups = [...html.matchAll(/<div\b(?=[^>]*\bclass="language-links")[^>]*>([\s\S]*?)<\/div>/g)];
    assert.equal(groups.length, 1, `${guide} should have one language-links group`);
    const frenchLinks = [...groups[0][1].matchAll(/<a\b[^>]*href="booklog-notes-de-lecture\.html"[^>]*>Français<\/a>/g)];
    assert.equal(frenchLinks.length, 1, `${guide} should have one French link in its language group`);
    assert.equal((html.match(/>Français<\/a>/g) || []).length, 1, `${guide} should not have a separate French-only bar`);
    assert.equal(frenchLinks[0][0].includes('aria-current="page"'), guide === "booklog-notes-de-lecture.html", `${guide} French current-page state`);
  }
});
