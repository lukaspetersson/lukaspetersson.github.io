const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { formatNotePt } = require("../lp-apps/booklog-note-format-pt.js");
const read = (name) => fs.readFileSync(path.join(__dirname, "../lp-apps", name), "utf8");
test("Portuguese output preserves entered newlines and applies limits", () => {
  assert.equal(
    formatNotePt(" p. 42 ", "  ideia\ncom detalhe ", "retomar"),
    "Página ou capítulo: p. 42\n\nO que chamou a minha atenção:\nideia\ncom detalhe\n\nO que quero retomar:\nretomar"
  );
  assert.equal(formatNotePt("", "", "   "), "");
  assert.equal(formatNotePt("x".repeat(79) + "📚", "idea", ""), `Página ou capítulo: ${"x".repeat(79)}\n\nO que chamou a minha atenção:\nidea`);
  assert.equal(formatNotePt("", "x".repeat(1999) + "📚", ""), `O que chamou a minha atenção:\n${"x".repeat(1999)}`);
  assert.equal(
    formatNotePt("📚".repeat(100), "x".repeat(2100), "y"),
    `Página ou capítulo: ${"📚".repeat(40)}\n\nO que chamou a minha atenção:\n${"x".repeat(2000)}\n\nO que quero retomar:\ny`
  );
});
test("guide insertion preserves every byte of the prior guide outside inserted composer resources", () => {
  const baselineBytes = fs.readFileSync(path.join(__dirname, "booklog-portuguese-guide-baseline.html"));
  assert.equal(crypto.createHash("sha256").update(baselineBytes).digest("hex"), "de699255e857fa909728659b526b9726516bba182a0fa6f533c039657b125c85");
  const baseline = baselineBytes.toString("utf8");
  const actual = read("booklog-diario-de-leitura.html")
    .replace('    <link rel="stylesheet" href="booklog-note-composer-1.0.0.css" />\n', "")
    .replace(/      <p class="note-composer-jump" hidden>[\s\S]*?<\/p>\n/, "")
    .replace(/      <section class="note-composer"[\s\S]*?<\/section>\n/, "")
    .replace('    <script src="booklog-note-format-pt.js"></script>\n    <script src="booklog-note-composer-pt.js"></script>\n', "");
  assert.equal(actual, baseline);
});
test("Portuguese composer static-source privacy/readiness guard", () => {
  const html = read("booklog-diario-de-leitura.html");
  const js = read("booklog-note-composer-pt.js");
  assert.match(html, /Quer começar aqui\?/);
  assert.match(html, /maxlength="80"/);
  assert.equal((html.match(/maxlength="2000"/g) || []).length, 2);
  assert.match(html, /name="preview" readonly/);
  assert.match(js, /--lp-note-composer-ready/);
  assert.match(js, /revision === copiedRevision/);
  assert.match(js, /preview\.focus\(\)[\s\S]*preview\.select\(\)/);
  assert.match(js, /attention\.focus\(\)/);
  assert.doesNotMatch(js, /\?\.|catch\s*\{/);
  assert.doesNotMatch(js, /localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon/);
  assert.match(html, /class="print-note-card"/);
  assert.match(read("booklog-note-composer-1.0.0.css"), /@media print[\s\S]*\.note-composer[\s\S]*display: none/);
});

test("controller callbacks initialize, fallback, clear, and suppress stale clipboard completion", async () => {
  const handlers = {};
  const makeField = (name) => ({
    value: "",
    addEventListener: (event, fn) => {
      handlers[name + ":" + event] = fn;
    },
    focus() {
      this.focused = true;
    },
    select() {
      this.selected = true;
    },
  });
  const page = makeField("page"),
    attention = makeField("attention"),
    returning = makeField("return"),
    preview = makeField("preview");
  const copy = {
    disabled: false,
    addEventListener: (event, fn) => {
      handlers["copy:" + event] = fn;
    },
  };
  const clear = {
    addEventListener: (event, fn) => {
      handlers["clear:" + event] = fn;
    },
  };
  const status = { textContent: "" };
  const root = {
    hidden: true,
    classList: { add() {} },
    querySelector(sel) {
      return {
        "[name=page]": page,
        "[name=attention]": attention,
        "[name=return]": returning,
        "[name=preview]": preview,
        "[data-copy]": copy,
        "[aria-live]": status,
        "[data-clear]": clear,
      }[sel];
    },
  };
  const jump = { hidden: true, classList: { add() {} } };
  let resolveWrite;
  const context = {
    document: {
      querySelector(sel) {
        return sel === ".note-composer" ? root : jump;
      },
    },
    getComputedStyle: () => ({ getPropertyValue: () => "1" }),
    navigator: {
      clipboard: {
        writeText: () =>
          new Promise((resolve) => {
            resolveWrite = resolve;
          }),
      },
    },
    formatNotePt,
  };
  vm.runInNewContext(read("booklog-note-composer-pt.js"), context);
  assert.equal(copy.disabled, true);
  assert.equal(preview.value, "");
  attention.value = "Minha ideia";
  handlers["attention:input"]();
  const pendingCopy = handlers["copy:click"]();
  page.value = "local";
  context.navigator.clipboard.writeText = () => {
    throw new Error("blocked");
  };
  await handlers["copy:click"]();
  assert.equal(preview.focused, true);
  assert.equal(preview.selected, true);
  assert.equal(status.textContent, "Não foi possível copiar. Selecione o texto da nota e copie manualmente.");
  handlers["clear:click"]();
  assert.equal(page.value + attention.value + returning.value + preview.value, "");
  assert.equal(attention.focused, true);
  resolveWrite();
  await pendingCopy;
  assert.notEqual(status.textContent, "Nota copiada. Cole-a você no BookLog.");
});
