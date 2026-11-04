const assert = require("node:assert/strict");
function once(source, value, label) {
  assert.equal(source.split(value).length - 1, 1, `${label} occurs exactly once`);
  return source.replace(value, "");
}
function removeApprovedGermanComposerDelta(source) {
  let result = once(source, '    <link rel="stylesheet" href="booklog-note-composer-1.0.0.css" />\n', "German composer stylesheet");
  result = once(
    result,
    '      <p class="note-composer-jump" hidden>Möchtest du hier beginnen? <a href="#note-composer-heading">Eine Notiz zum Kopieren vorbereiten</a>.</p>\n',
    "German jump"
  );
  const sections =
    result.match(/      <section class="note-composer" aria-labelledby="note-composer-heading" hidden>[\s\S]*?      <\/section>\n/g) || [];
  assert.equal(sections.length, 1, "one German composer section");
  assert.match(sections[0], /id="note-composer-heading">Eine Notiz zum Kopieren vorbereiten<\/h2>/);
  assert.equal((sections[0].match(/maxlength="2000"/g) || []).length, 2);
  result = result.replace(sections[0], "");
  return once(
    result,
    '    <script src="booklog-note-format-de.js"></script>\n    <script src="booklog-note-composer-de.js"></script>\n',
    "German composer scripts"
  );
}
module.exports = removeApprovedGermanComposerDelta;
