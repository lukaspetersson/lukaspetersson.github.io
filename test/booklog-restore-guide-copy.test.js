const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const guide = fs.readFileSync(path.join(__dirname, "..", "lp-apps", "booklog-reading-notes.html"), "utf8");
const restoreCopy =
  "Before restoring, the confirmation dialog shows how many books are in the file and how many IDs already match records on the device. After you choose “Restore missing”, the completion dialog reports inserted and skipped records. If all IDs already exist, a successful restore can report 0 inserted: the existing records are left unchanged. These counts refer to book records, including their notes—not individual note paragraphs.";
const paragraphs = [...guide.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((match) =>
  match[1]
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
);

test("English guide clarifies restore counts are book records, not note paragraphs", () => {
  const restoreIndex = paragraphs.indexOf(restoreCopy);

  assert.ok(restoreIndex > 0);
  assert.match(paragraphs[restoreIndex - 1], /^Moving to a new phone\?/);
  assert.match(paragraphs[restoreIndex + 1], /^The file contains plain-text private notes:/);
  assert.equal(paragraphs.filter((paragraph) => paragraph === restoreCopy).length, 1);
  assert.match(restoreCopy, /“Restore missing”/);
  assert.match(restoreCopy, /book records, including their notes—not individual note paragraphs\./);
});
