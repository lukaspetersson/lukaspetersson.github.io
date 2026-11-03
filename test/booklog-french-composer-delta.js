const assert = require("node:assert/strict");

function replaceOne(source, target, description) {
  assert.equal(source.split(target).length - 1, 1, `${description} occurs exactly once`);
  return source.replace(target, "");
}

function removeApprovedFrenchComposerDelta(source) {
  let result = replaceOne(source, '    <link rel="stylesheet" href="booklog-note-composer-1.0.0.css" />\n', "French composer stylesheet link");
  result = replaceOne(
    result,
    '      <p class="note-composer-jump" hidden>Vous voulez commencer ici ? <a href="#note-composer-heading">Préparez une note à copier</a>.</p>\n',
    "French composer intro jump"
  );
  const sections =
    result.match(/      <section class="note-composer" aria-labelledby="note-composer-heading" hidden>[\s\S]*?      <\/section>\n/g) || [];
  assert.equal(sections.length, 1, "one French composer section exists");
  assert.match(sections[0], /id="note-composer-heading">Préparez une note à copier<\/h2>/);
  assert.match(sections[0], /name="page"/);
  assert.equal((sections[0].match(/maxlength="2000"/g) || []).length, 2);
  result = result.replace(sections[0], "");
  return replaceOne(
    result,
    '    <script src="booklog-note-format-fr.js"></script>\n    <script src="booklog-note-composer-fr.js"></script>\n',
    "French composer script tags"
  );
}

module.exports = removeApprovedFrenchComposerDelta;
