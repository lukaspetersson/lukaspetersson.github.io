const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "lp-apps", "booklog-notas-de-lectura.html"), "utf8");
const english = fs.readFileSync(path.join(root, "lp-apps", "booklog-reading-notes.html"), "utf8");
const css = fs.readFileSync(path.join(root, "lp-apps", "styles.css"), "utf8");
const script = fs.readFileSync(path.join(root, "lp-apps", "script.js"), "utf8");
const normalize = (value) => value.replace(/\s+/g, " ");

test("Spanish guide includes the exact translated blank card using shared print hooks", () => {
  for (const copy of [
    "Una nota de lectura en papel",
    "¿Prefieres empezar en papel? Imprime esta ficha en blanco y guárdala con tu libro. Son indicaciones para tus propias notas, no campos adicionales de la aplicación.",
    "Imprimir la ficha",
    "Nota de lectura",
    "Título del libro",
    "Autor",
    "Edición",
    "Página o capítulo",
    "Fecha",
    "Propósito",
    "Recordar",
    "Preguntar",
    "Relacionar",
    "Decidir",
    "¿Qué me llamó la atención?",
    "¿Qué quiero retomar?",
    "Notas de lectura de BookLog · lukaspetersson.com/lp-apps/booklog-notas-de-lectura.html",
  ])
    assert.ok(normalize(html).includes(copy), `missing translated copy: ${copy}`);
  assert.match(html, /<button class="print-note-button" type="button">Imprimir la ficha<\/button>/);
  assert.equal((html.match(/class="printable-note-section"/g) || []).length, 1);
  assert.doesNotMatch(html, /<input|<textarea|localStorage|sessionStorage/i);
  assert.match(css, /body\.printing-note-card \.print-note-card \{\s*page: booklog-note-card;\s*display: block/);
  assert.match(css, /@page booklog-note-card \{\s*size: auto;\s*margin: 0?\.4in;/);
  assert.doesNotMatch(css, /@page \{/);
  assert.match(script, /afterprint/);
  assert.ok(html.indexOf('class="printable-note-section"') < html.indexOf("<h2>3. Vuelve a la nota</h2>"));
  assert.match(html, /☐ Recordar &nbsp; ☐ Preguntar &nbsp; ☐ Relacionar &nbsp; ☐ Decidir/);
  assert.ok(english.includes('class="printable-note-section"'));
});

test("insertion preserves all Spanish guide bytes outside the card and adds no route metadata", () => {
  const section = html.match(/      <section class="printable-note-section"[\s\S]*?<\/article>\n      <\/section>\n/);
  assert.ok(section, "card insertion is present");
  const withoutCard = html.replace(section[0], "");
  assert.equal(crypto.createHash("sha256").update(withoutCard).digest("hex"), "3cf4f0978dd09f168f523ffaedae7ccf798a635a3976059c27b925d4cb03d0a1");
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((html.match(/hreflang=/g) || []).length, 6);
  assert.doesNotMatch(section[0], /<a\b|href=|<input|<textarea|<script|data-/i);
});

test("print lifecycle restores normal page after printing and on synchronous failure", () => {
  const vm = require("node:vm");
  const run = (shouldThrow) => {
    let click;
    let afterprint;
    let removed = false;
    const classes = new Set();
    const context = {
      document: {
        querySelectorAll: () => [],
        querySelector: () => ({
          addEventListener: (_name, handler) => {
            click = handler;
          },
        }),
        body: { classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) } },
      },
      window: {
        addEventListener: (_name, handler) => {
          afterprint = handler;
        },
        removeEventListener: (_name, handler) => {
          if (handler === afterprint) removed = true;
        },
        print: () => {
          assert.ok(classes.has("printing-note-card"));
          if (shouldThrow) throw new Error("print unavailable");
        },
      },
      Date,
    };
    vm.runInNewContext(script, context);
    return {
      click,
      classes,
      get afterprint() {
        return afterprint;
      },
      get removed() {
        return removed;
      },
    };
  };
  const normal = run(false);
  normal.click();
  assert.ok(normal.classes.has("printing-note-card"));
  normal.afterprint();
  assert.equal(normal.classes.has("printing-note-card"), false);
  const failed = run(true);
  assert.throws(() => failed.click(), /print unavailable/);
  assert.equal(failed.removed, true);
  assert.equal(failed.classes.has("printing-note-card"), false);
});
