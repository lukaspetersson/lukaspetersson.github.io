const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const guidePath = path.join(__dirname, "..", "lp-apps", "booklog-reading-notes.html");
const html = fs.readFileSync(guidePath, "utf8");
const text = html
  .replace(/<[^>]*>/g, "")
  .replace(/\s+/g, " ")
  .trim();

test("English guide explains verified shelf filtering and sorting before local-copy limits", () => {
  const sectionStart = html.indexOf("<h2>4. Organize your shelf</h2>");
  const localCopiesStart = html.indexOf("<h2>Keep local copies in mind</h2>");
  assert.ok(sectionStart >= 0 && sectionStart < localCopiesStart);

  for (const phrase of [
    "Open Settings, choose Filter, and select Show all, To read, Reading or Finished.",
    "The status comes from the book’s dates: no start date means To read; a start date without a finish date means Reading; both dates mean Finished.",
    "Under Order by, choose Title, Author, Rating, Pages or Start Date.",
    "Title and Author are ascending; Rating, Pages and Start Date are descending.",
    "Pages is the book’s total page count, not a pages-read counter.",
    "The date fields in the book editor are labelled Start date and Finish date.",
  ])
    assert.ok(text.includes(phrase), `missing guide wording: ${phrase}`);

  assert.match(html, /<strong>Settings<\/strong>.*?<strong>Filter<\/strong>/s);
  assert.match(html, /<strong>Start date<\/strong> and <strong>Finish date<\/strong>/);
  assert.ok(text.includes("Keep local copies in mind"));
  assert.ok(text.includes("open Settings and use “Export shelf and notes”"));
  assert.ok(text.includes("Automatic Android device transfer remains disabled"));
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.match(html, /<link rel="canonical" href="https:\/\/lukaspetersson\.com\/lp-apps\/booklog-reading-notes\.html"/);
});
