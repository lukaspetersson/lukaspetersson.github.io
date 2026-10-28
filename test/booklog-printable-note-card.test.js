const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "lp-apps", "booklog-reading-notes.html"), "utf8");
const css = fs.readFileSync(path.join(root, "lp-apps", "styles.css"), "utf8");
const script = fs.readFileSync(path.join(root, "lp-apps", "script.js"), "utf8");
const normalizedHtml = html.replace(/\s+/g, " ");

test("guide contains the complete blank paper card and precise print-only affordance", () => {
  for (const content of [
    "A reading note on paper",
    "Prefer to start on paper? Print this blank card and keep it with your book. These are prompts for your own notes, not extra fields in the app.",
    "Print the note card",
    "Reading note",
    "Book title",
    "Author",
    "Edition",
    "Page or chapter",
    "Date",
    "Remember",
    "Question",
    "Connect",
    "Decide",
    "What caught my attention?",
    "What do I want to return to?",
    "BookLog reading notes · lukaspetersson.com/lp-apps/booklog-reading-notes.html",
  ])
    assert.ok(normalizedHtml.includes(content), `missing card copy: ${content}`);
  assert.match(html, /<button class="print-note-button" type="button">/);
  assert.doesNotMatch(html, /<input|<textarea|localStorage|sessionStorage/i);
  assert.match(css, /@media print\s*\{[\s\S]*body\.printing-note-card/);
  assert.match(css, /body\.printing-note-card > \* \{\s*display: none/);
  assert.match(css, /body\.printing-note-card > main\.prose \{\s*page: booklog-note-card;/);
  assert.match(css, /body\.printing-note-card main\.prose > :not\(\.printable-note-section\)/);
  assert.match(css, /body\.printing-note-card \.print-note-card \{\s*page: booklog-note-card;\s*display: block/);
  assert.match(css, /@page booklog-note-card \{\s*size: auto;\s*margin: 0?\.4in;/);
  assert.match(css, /\.print-note-card \{\s*page: booklog-note-card;/);
  assert.match(css, /body\.printing-note-card \.print-note-details \{\s*grid-template-columns: 1fr 1fr;/);
  assert.doesNotMatch(css, /@page \{/);
});

test("nonblocking print retains print state until afterprint, then clears it", () => {
  let click;
  let printed = 0;
  const classes = new Set();
  const handlers = {};
  const context = {
    document: {
      querySelectorAll: () => [],
      querySelector: () => ({
        addEventListener: (name, fn) => {
          assert.equal(name, "click");
          click = fn;
        },
      }),
      body: { classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value) } },
    },
    window: {
      addEventListener: (name, fn) => {
        handlers[name] = fn;
      },
      removeEventListener: (name) => {
        delete handlers[name];
      },
      print: () => {
        printed++;
        assert.ok(classes.has("printing-note-card"));
      },
    },
    Date,
  };
  vm.runInNewContext(script, context);
  click();
  assert.equal(printed, 1);
  assert.equal(classes.has("printing-note-card"), true);
  assert.equal(typeof handlers.afterprint, "function");
  handlers.afterprint();
  assert.equal(classes.has("printing-note-card"), false);
});

test("a synchronous window.print error removes its listener and clears print state", () => {
  let click;
  let handler;
  let removed = false;
  const classes = new Set();
  const context = {
    document: {
      querySelectorAll: () => [],
      querySelector: () => ({
        addEventListener: (_name, fn) => {
          click = fn;
        },
      }),
      body: { classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value) } },
    },
    window: {
      addEventListener: (_name, fn) => {
        handler = fn;
      },
      removeEventListener: (_name, fn) => {
        assert.equal(fn, handler);
        removed = true;
      },
      print: () => {
        throw new Error("print unavailable");
      },
    },
    Date,
  };
  vm.runInNewContext(script, context);
  assert.throws(() => click(), /print unavailable/);
  assert.equal(removed, true);
  assert.equal(classes.has("printing-note-card"), false);
});

test("existing guide identity, locale links, and product copy remain unchanged", () => {
  assert.match(html, /<title>Start a reading note in BookLog — LP Apps<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/lukaspetersson\.com\/lp-apps\/booklog-reading-notes\.html" \/>/);
  for (const locale of ["en", "sv-SE", "pt-BR", "es-ES", "fr-FR", "x-default"]) assert.match(html, new RegExp(`hreflang="${locale}"`));
  for (const text of ["BookLog 4.0.7", "version 4.0.4", "JSON export and restore", "without creating an account"])
    assert.ok(html.includes(text), `existing app/version copy missing: ${text}`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
});
