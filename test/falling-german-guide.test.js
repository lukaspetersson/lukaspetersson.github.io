const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const site = path.join(__dirname, "..", "lp-apps");
const read = (f) => fs.readFileSync(path.join(site, f), "utf8");
const url = "https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-de.html";
test("German insertions reduce exactly back to frozen canonical five-page bytes", () => {
  const alt = '    <link rel="alternate" hreflang="de-DE" href="https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-de.html" />\n';
  const anchor = '        <a href="falling-kitten-how-to-play-de.html" lang="de">Deutsch</a>\n';
  for (const f of [
    "falling-kitten-how-to-play.html",
    "falling-kitten-how-to-play-sv.html",
    "falling-kitten-how-to-play-es.html",
    "falling-kitten-how-to-play-fr.html",
    "falling-kitten-how-to-play-pt-br.html",
  ]) {
    const candidate = read(f);
    assert.equal(candidate.split(alt).length - 1, 1, `${f}: exactly one new alternate`);
    assert.equal(candidate.split(anchor).length - 1, 1, `${f}: exactly one new navigation link`);
    const reduced = candidate.replace(alt, "").replace(anchor, "");
    assert.equal(
      reduced,
      fs.readFileSync(path.join(__dirname, "fixtures", "falling-german-baseline", f), "utf8"),
      `${f}: reducer restores frozen canonical bytes`
    );
  }
});
test("German guide has approved copy, locale symmetry, German Play link and unchanged screenshot", () => {
  const h = read("falling-kitten-how-to-play-de.html");
  const c = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "falling-german-copy.json")));
  assert.match(h, /<html lang="de">/);
  assert.ok(h.includes(`<title>${c.title}</title>`));
  assert.ok(h.includes(`<meta property="og:title" content="${c.title}" />`));
  assert.ok(h.includes(`<meta name="twitter:title" content="${c.title}" />`));
  assert.ok(h.includes(`name="description"`));
  assert.match(h, new RegExp(`<link rel="canonical" href="${url}"`));
  assert.match(h, /hreflang="de-DE"/);
  const normalized = h.replace(/\s+/g, " ");
  for (const v of [c.description, ...c.steps, c.interface_warning, c.screenshot.alt, c.screenshot.caption, c.lede, c.cta])
    assert.ok(normalized.includes(v.replace(/\s+/g, " ")), v);
  assert.match(h, /hl=de&amp;gl=DE&amp;referrer=utm_source%3Dlp_apps/);
  assert.equal((h.match(/play\.google\.com\/store/g) || []).length, 2);
  assert.equal(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(site, "falling-kitten-android-score-1.png")))
      .digest("hex"),
    "551001bcd3a81fffa17b5c22029fede3a3d4d2f299302f497adf64b1ce28b793"
  );
  for (const f of [
    "falling-kitten-how-to-play.html",
    "falling-kitten-how-to-play-sv.html",
    "falling-kitten-how-to-play-es.html",
    "falling-kitten-how-to-play-fr.html",
    "falling-kitten-how-to-play-pt-br.html",
  ]) {
    const s = read(f);
    assert.equal((s.match(/hreflang="de-DE"/g) || []).length, 1, f);
    assert.equal((s.match(/href="falling-kitten-how-to-play-de.html" lang="de">Deutsch/g) || []).length, 1, f);
  }
  assert.equal(
    (read("sitemap.xml").match(/<loc>https:\/\/lukaspetersson\.com\/lp-apps\/falling-kitten-how-to-play-de\.html<\/loc>/g) || []).length,
    1
  );
  assert.equal((read("index.html").match(/href="falling-kitten-how-to-play-de\.html"/g) || []).length, 1);
  assert.doesNotMatch(h, /replay|rejouer|pause|zurücksetzen/i);
});
