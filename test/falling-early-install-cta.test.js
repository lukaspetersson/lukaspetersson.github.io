const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const pages = [
  {
    file: "falling-kitten-how-to-play.html",
    hash: "96cf45827b833f2abb82a79102521300f715392108da28da172924523389ae13",
    label: "Get Falling Kitten on Google Play",
  },
  {
    file: "falling-kitten-how-to-play-sv.html",
    hash: "fb3e8e3a790de6b749cab2dab18e5f4d0ae21a87378bee99537ed98a8427947d",
    label: "Hämta Falling Kitten på Google Play",
  },
  {
    file: "falling-kitten-how-to-play-es.html",
    hash: "4477543b23fce94f4726e848bee0d52066ca2f64cfbe99887c8da4579262e26b",
    label: "Descarga Falling Kitten en Google Play",
  },
];

test("each localized guide adds one matching Play link after its lede without other changes", () => {
  for (const { file, hash, label } of pages) {
    const html = fs.readFileSync(path.join(__dirname, "..", "lp-apps", file), "utf8");
    const hrefs = [...html.matchAll(/href="(https:\/\/play\.google\.com\/store\/apps\/details[^"]+)"/g)].map((match) => match[1]);
    assert.equal(hrefs.length, 2, `${file}: exactly two Play anchors`);
    assert.equal(hrefs[0], hrefs[1], `${file}: hrefs match exactly`);
    const inserted = `\n      <p>\n        <a\n          href="${hrefs[0]}"\n          >${label}</a\n        >\n      </p>`;
    assert.equal(html.split(label).length - 1, 2, `${file}: both links use the existing label`);
    const insertionIndex = html.indexOf(inserted);
    assert.notEqual(insertionIndex, -1, `${file}: inserted paragraph is present`);
    const stripped = html.slice(0, insertionIndex) + html.slice(insertionIndex + inserted.length);
    assert.equal(crypto.createHash("sha256").update(stripped).digest("hex"), hash, `${file}: all preexisting bytes preserved`);
    assert.ok(html.indexOf(inserted) > html.indexOf('<p class="lede">'), `${file}: CTA follows lede`);
    assert.ok(html.indexOf(inserted) < html.indexOf("<h2"), `${file}: CTA precedes first section`);
  }
});
