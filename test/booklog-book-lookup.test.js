const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const dir = path.join(__dirname, "../lp-apps");
const js = fs.readFileSync(path.join(dir, "book-lookup.js"), "utf8");
const en = fs.readFileSync(path.join(dir, "booklog-book-lookup.html"), "utf8");
const sv = fs.readFileSync(path.join(dir, "booklog-book-lookup-sv.html"), "utf8");
const pt = fs.readFileSync(path.join(dir, "booklog-book-lookup-pt-br.html"), "utf8");
const es = fs.readFileSync(path.join(dir, "booklog-book-lookup-es.html"), "utf8");

test("lookup uses encoded Open Library query, bounded fields, timeout, and safe text rendering", () => {
  assert.match(js, /new URLSearchParams\(\{ q: query, limit: '5', fields: 'key,title,author_name,first_publish_year' \}\)/);
  assert.match(js, /AbortController/);
  assert.match(js, /setTimeout\(\(\) => controller\.abort\(\), 10000\)/);
  assert.match(js, /heading\.textContent = book\.title/);
  assert.match(js, /authors\.textContent/);
  assert.doesNotMatch(js, /innerHTML|localStorage|sessionStorage/);
});

test("Brazilian Portuguese lookup has locale links and Brazilian Play target", () => {
  assert.match(pt, /lang="pt-BR"/);
  assert.match(pt, /hreflang="pt-BR"/);
  assert.match(en, /hreflang="pt-BR"/);
  assert.match(sv, /hreflang="pt-BR"/);
  assert.match(pt, /hl=pt_BR&amp;gl=BR/);
  assert.match(pt, /booklog-diario-de-leitura.html/);
  assert.match(pt, /Os registros disponíveis podem não estar em português/);
});

test("all locales disclose transfer, language switching, and no synchronization", () => {
  for (const [html, alt] of [[en, "booklog-book-lookup-sv.html"], [sv, "booklog-book-lookup.html"], [pt, "booklog-book-lookup.html"]]) {
    assert.match(html, new RegExp(alt));
    assert.match(html, /Open Library/);
    assert.match(html, /sync results with BookLog|synkroniserar inte resultat med BookLog|sincroniza os resultados com o BookLog/);
    assert.match(html, /type="reset"/);
    assert.match(html, /role="status"/);
    assert.match(html, /canonical/);
    assert.match(html, /og:url/);
  }
});


test("reset prevents an in-flight lookup from restoring stale results or status", async () => {
  let submitHandler;
  let resetHandler;
  let resolveFetch;
  const status = { textContent: "" };
  const results = { children: [], replaceChildren() { this.children = []; }, append(child) { this.children.push(child); } };
  const cta = { hidden: true };
  const submit = { disabled: false };
  const input = { value: "old query", disabled: false };
  const form = {
    addEventListener(type, handler) { if (type === "submit") submitHandler = handler; if (type === "reset") resetHandler = handler; },
    querySelector() { return submit; },
  };
  const document = {
    documentElement: { lang: "en" },
    querySelector(selector) { return ({ "#lookup-form": form, "#lookup-query": input, "#lookup-status": status, "#lookup-results": results, "#play-cta": cta })[selector]; },
    createElement(tag) { return { tag, children: [], append(child) { this.children.push(child); } }; },
  };
  const context = { document, AbortController, URLSearchParams, fetch: () => new Promise(resolve => { resolveFetch = resolve; }), window: { setTimeout, clearTimeout }, };
  vm.runInNewContext(js, context);
  const pending = submitHandler({ preventDefault() {} });
  assert.equal(submit.disabled, true);
  resetHandler();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(status.textContent, "Enter a search term to look up books.");
  assert.equal(input.disabled, false);
  resolveFetch({ ok: true, json: async () => ({ docs: [{ title: "Stale result" }] }) });
  await pending;
  assert.equal(results.children.length, 0);
  assert.equal(cta.hidden, true);
  assert.equal(status.textContent, "Enter a search term to look up books.");
  assert.equal(submit.disabled, false);
  assert.equal(input.disabled, false);
});


test("Spanish lookup is localized without changing lookup behavior", () => {
  assert.match(es, /lang="es"/);
  assert.match(es, /Buscar un libro por título, autor o ISBN/);
  assert.match(es, /No añade libros a BookLog automáticamente/);
  assert.match(es, /hl=es&amp;gl=ES/);
  assert.match(es, /los controles de BookLog aparecen en inglés/);
  assert.match(js, /No se encontraron libros/);
  assert.match(js, /Ver registro en Open Library/);
  assert.doesNotMatch(js, /localStorage|sessionStorage|innerHTML/);
  for (const html of [en, sv, pt, es]) {
    assert.match(html, /hreflang="es-ES"/);
    assert.match(html, /book-lookup\.js\?v=spanish20261026/);
  }
});


test("Spanish results render localized labels and safe catalog values", async () => {
  let submitHandler;
  const status = { textContent: "" };
  const results = { children: [], replaceChildren() { this.children = []; }, append(child) { this.children.push(child); } };
  const cta = { hidden: true };
  const input = { value: "Don Quijote", disabled: false };
  const submit = { disabled: false };
  const form = { addEventListener(type, handler) { if (type === "submit") submitHandler = handler; }, querySelector() { return submit; } };
  const document = {
    documentElement: { lang: "es" },
    querySelector(selector) { return ({ "#lookup-form": form, "#lookup-query": input, "#lookup-status": status, "#lookup-results": results, "#play-cta": cta })[selector]; },
    createElement(tag) { return { tag, children: [], append(child) { this.children.push(child); } }; },
  };
  const context = { document, AbortController, URLSearchParams, fetch: async () => ({ ok: true, json: async () => ({ docs: [{ title: "Don Quijote", author_name: ["Miguel de Cervantes"], first_publish_year: 1605, key: "/works/OL503666W" }] }) }), window: { setTimeout, clearTimeout } };
  vm.runInNewContext(js, context);
  await submitHandler({ preventDefault() {} });
  assert.equal(status.textContent, "");
  const rendered = results.children[0].children[0].children;
  assert.equal(rendered[0].textContent, "Don Quijote");
  assert.equal(rendered[1].textContent, "Autoría: Miguel de Cervantes");
  assert.equal(rendered[2].textContent, "Publicado por primera vez: 1605");
  assert.equal(rendered[3].textContent, "Ver registro en Open Library");
  assert.equal(cta.hidden, false);
});
