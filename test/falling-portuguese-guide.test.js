const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const site = path.join(__dirname, "..", "lp-apps");
const read = (file) => fs.readFileSync(path.join(site, file), "utf8");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const ptUrl = "https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-pt-br.html";
const ptAlternate = `    <link rel="alternate" hreflang="pt-BR" href="${ptUrl}" />\n`;
const ptAnchor = `        <a href="falling-kitten-how-to-play-pt-br.html" lang="pt-BR">Português (Brasil)</a>\n`;

test("Portuguese guide copy, metadata, locale symmetry, Play URL and assets are bounded", () => {
  const html = read("falling-kitten-how-to-play-pt-br.html");
  const copy = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "falling-portuguese-copy.json"), "utf8"));
  assert.match(html, /<html lang="pt-BR">/);
  assert.ok(html.includes(`<title>${copy.title}</title>`));
  assert.ok(html.includes(`<meta property="og:locale" content="pt_BR" />`));
  assert.ok(html.includes(`<link rel="canonical" href="${ptUrl}" />`));
  const locales = [
    ["en", "falling-kitten-how-to-play.html"],
    ["sv-SE", "falling-kitten-how-to-play-sv.html"],
    ["es-ES", "falling-kitten-how-to-play-es.html"],
    ["fr-FR", "falling-kitten-how-to-play-fr.html"],
    ["pt-BR", "falling-kitten-how-to-play-pt-br.html"],
    ["x-default", "falling-kitten-how-to-play.html"],
  ];
  for (const [locale, file] of locales) assert.ok(html.includes(`hreflang="${locale}" href="https://lukaspetersson.com/lp-apps/${file}"`));
  const normalized = html.replace(/\s+/g, " ");
  for (const value of Object.values(copy))
    if (typeof value === "string" && value !== copy.url && value !== copy.play_url && value !== copy.constraints && value !== copy.index_link)
      assert.ok(normalized.includes(value.replace(/\s+/g, " ")), `missing copy: ${value}`);
  const escapedPlayUrl = copy.play_url.replace(/&/g, "&amp;");
  assert.equal(html.split(escapedPlayUrl).length - 1, 2);
  assert.ok(html.includes("hl=pt_BR&amp;gl=BR&amp;referrer=utm_source%3Dlp_apps%26utm_medium%3Dreferral%26utm_campaign%3Dportfolio_2026"));
  assert.ok(html.includes('src="falling-kitten-android-score-1.png"'));
  assert.equal(
    hash(fs.readFileSync(path.join(site, "falling-kitten-android-score-1.png"))),
    "551001bcd3a81fffa17b5c22029fede3a3d4d2f299302f497adf64b1ce28b793"
  );
  assert.ok(!/replay|rejouer|jogar novamente|jogar de novo/i.test(html));
  const baselines = {
    "falling-kitten-how-to-play.html": "6d4e6f044cf14518411aebabf6c1e1b2a7550f4043265af7e44863dffa056ad5",
    "falling-kitten-how-to-play-sv.html": "50559efb01b91f5fc02fc98d05b2f22b1d6743047349c17f806485bcb8251cb1",
    "falling-kitten-how-to-play-es.html": "f25c19ae282104411b950bf550b42e089826390c1083692c2aaedeb78943651e",
    "falling-kitten-how-to-play-fr.html": "a2573df1ed823e15f9b8197beffda416ed27f23b320605534d3200daeeb5fc01",
  };
  for (const file of locales.slice(0, 4).map(([, file]) => file)) {
    const sibling = read(file);
    assert.equal(sibling.split(ptAlternate).length - 1, 1, `${file} alternate`);
    assert.equal(sibling.split(ptAnchor).length - 1, 1, `${file} visible locale link`);
    assert.equal(hash(sibling.replace(ptAlternate, "").replace(ptAnchor, "")), baselines[file], `${file}: all original bytes preserved`);
  }
});

test("index and sitemap retain frozen baselines except for the exact new links", () => {
  const indexAddition = '<br /><a href="falling-kitten-how-to-play-pt-br.html" lang="pt-BR">Como jogar (português)</a>';
  const index = read("index.html");
  assert.equal(index.split(indexAddition).length - 1, 1);
  const sitemapAddition = "  <url>\n    <loc>https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-pt-br.html</loc>\n  </url>\n";
  const sitemap = read("sitemap.xml");
  assert.equal(sitemap.split(sitemapAddition).length - 1, 1);
  assert.equal(hash(index.replace(indexAddition, "")), "126a2eb1d239c7c11144fbad6a653972b262d8602cfc33ebf60523e138548a91");
  assert.equal(hash(sitemap.replace(sitemapAddition, "")), "97cf1a613bdcf5f623ca020612670eb6876031c707dd5148702e1f89604c1ede");
});
