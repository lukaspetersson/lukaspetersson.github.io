const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("prospective Spanish lookup explains v13 transfer without implying automated catalog sync", () => {
  const html = fs.readFileSync(path.join(__dirname, "../lp-apps/booklog-book-lookup-es.html"), "utf8");
  for (const text of [
    "versión 4.0.7",
    "Export shelf and notes",
    "Restore shelf and notes",
    "archivo JSON",
    "identificadores ya existen se conservan",
    "no se combinan notas",
    "No hay traslado automático",
    "no cifra el archivo exportado",
    "no borra ese archivo",
    "los controles de BookLog aparecen en inglés",
    "No añade libros a BookLog automáticamente",
    "no usa la cámara",
  ])
    assert.ok(html.includes(text), text);
  assert.ok(!html.includes("la versión actual no ofrece una función general para exportar"));
});

test("all prospective guides distinguish the export-capable version from 4.0.4", () => {
  const rows = [
    ["booklog-reading-notes.html", "not available"],
    ["booklog-reading-notes-sv.html", "finns inte"],
    ["booklog-diario-de-leitura.html", "não estão disponíveis"],
    ["booklog-notas-de-lectura.html", "no están disponibles"],
    ["booklog-notes-de-lecture.html", "ne sont pas disponibles"],
  ];
  for (const [name, qualifier] of rows) {
    const html = fs.readFileSync(path.join(__dirname, "../lp-apps", name), "utf8").replace(/\s+/g, " ");
    assert.ok(html.includes("4.0.4"), name);
    assert.ok(html.includes(qualifier), name);
    assert.ok(html.includes("4.0.7"), name);
  }
});
