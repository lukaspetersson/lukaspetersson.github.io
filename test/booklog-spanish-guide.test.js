const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const site = path.join(__dirname, "..", "lp-apps");
const read = name => fs.readFileSync(path.join(site, name), "utf8");

test("Spanish reading guide explains verified workflow and data limits", () => {
  const html = read("booklog-notas-de-lectura.html");
  for (const text of ["BookLog 4.0.4", "está en inglés", "Add a book", "Title", "Author", "Add notes", "Save", "ISBN", "no utiliza la cámara", "Open Library", "elimina esos datos locales", "transferencia de datos entre dispositivos Android también está desactivada", "no es una sincronización continua", "es_ES"]) assert.ok(html.includes(text), `missing ${text}`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.match(html, /hreflang="es-ES"[^>]+booklog-notas-de-lectura.html/);
  assert.doesNotMatch(html, /(?:exportar|copia de seguridad)[^<]*(?:disponible|incluida)/i);
  for (const text of ["Order by", "Filter", "Title", "Author", "Rating", "Pages", "Start Date", "Finish date", "Show all", "To read", "Reading", "Finished", "páginas leídas"]) assert.ok(html.includes(text), `missing ${text}`);
  assert.match(html, /número total de páginas del libro, no un contador de páginas leídas/);
  assert.match(html, /sin <strong>Start date<\/strong>[^<]* es por leer/);
  assert.match(html, /con inicio pero sin <strong>Finish date<\/strong> \(fecha de finalización\) es leyendo/);
  assert.match(html, /con ambas fechas es terminado/);
});

test("Spanish lookup, locale siblings, hub and sitemap link the candidate", () => {
  assert.match(read("booklog-book-lookup-es.html"), /booklog-notas-de-lectura.html/);
  for (const name of ["booklog-reading-notes.html", "booklog-reading-notes-sv.html", "booklog-diario-de-leitura.html"]) {
    const html = read(name); assert.match(html, /hreflang="es-ES"[^>]+booklog-notas-de-lectura.html/); assert.match(html, /booklog-notas-de-lectura.html/);
  }
  assert.match(read("index.html"), /booklog-notas-de-lectura.html/);
  assert.match(read("sitemap.xml"), /<loc>https:\/\/lukaspetersson.com\/lp-apps\/booklog-notas-de-lectura.html<\/loc>/);
});
