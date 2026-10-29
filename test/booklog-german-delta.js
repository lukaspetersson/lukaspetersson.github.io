const assert = require("node:assert/strict");
const hreflang = '    <link rel="alternate" hreflang="de" href="https://lukaspetersson.com/lp-apps/booklog-lesetagebuch.html" />\n';
const visible = '        <a href="booklog-lesetagebuch.html" lang="de">Deutsch</a>\n';
module.exports = function removeApprovedGermanLinks(source) {
  assert.equal(source.split(hreflang).length - 1, 1, "expected exactly one reviewed German hreflang insertion");
  assert.equal(source.split(visible).length - 1, 1, "expected exactly one reviewed visible Deutsch link insertion");
  return source.replace(hreflang, "").replace(visible, "");
};
