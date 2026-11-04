const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { formatNoteDe } = require("../lp-apps/booklog-note-format-de.js");
const reduce = require("./booklog-german-composer-delta");
const base = path.join(__dirname, "../lp-apps");
const read = (name) => fs.readFileSync(path.join(base, name), "utf8");
test("German formatter limits UTF-16 safely, trims and keeps line breaks", () => {
  assert.equal(
    formatNoteDe(" S. 42 ", " Idee\ndetail ", "zurück"),
    "Seite oder Kapitel: S. 42\n\nWas mir aufgefallen ist:\nIdee\ndetail\n\nWorauf ich zurückkommen möchte:\nzurück"
  );
  assert.equal(formatNoteDe("", "", "  "), "");
  assert.equal(formatNoteDe("x".repeat(79) + "📚", "x", ""), `Seite oder Kapitel: ${"x".repeat(79)}\n\nWas mir aufgefallen ist:\nx`);
  assert.equal(formatNoteDe("", "x".repeat(1999) + "📚", ""), `Was mir aufgefallen ist:\n${"x".repeat(1999)}`);
});
test("German composer insertions reconstruct frozen guide byte-for-byte", () => {
  const fixture = fs.readFileSync(path.join(__dirname, "german-guide-baseline.html"));
  assert.equal(crypto.createHash("sha256").update(fixture).digest("hex"), "45c71f1496535cea2e275a9d09f709faf996204a27dbee9e5bae5b8dfce49f74");
  assert.equal(reduce(read("booklog-lesetagebuch.html")), fixture.toString());
});
test("German composer is local, gated, bounded and manually copied", () => {
  const html = read("booklog-lesetagebuch.html"),
    js = read("booklog-note-composer-de.js");
  for (const text of [
    "Eine Notiz zum Kopieren vorbereiten",
    "Seite oder Kapitel (optional)",
    "Zum Beispiel: S. 42 oder Kapitel 3",
    "Was ist mir aufgefallen?",
    "Worauf möchte ich zurückkommen?",
    "Notiz zum Kopieren",
    "Notiz kopieren",
    "Felder leeren",
    "Möchtest du hier beginnen?",
  ])
    assert.ok(html.includes(text), text);
  assert.match(html, /class="note-composer"[^>]* hidden/);
  assert.match(html, /name="preview" readonly/);
  assert.match(html, /maxlength="80"/);
  assert.equal((html.match(/maxlength="2000"/g) || []).length, 2);
  assert.match(js, /--lp-note-composer-ready/);
  assert.match(js, /revision === copiedRevision/);
  assert.match(js, /preview\.focus\(\)[\s\S]*preview\.select\(\)/);
  assert.match(js, /attention\.focus\(\)/);
  const approved = [
    "Möchtest du hier beginnen?",
    "Eine Notiz zum Kopieren vorbereiten",
    "Eine Notiz zum Kopieren vorbereiten",
    "Halte hier deine eigenen Gedanken fest und kopiere die Notiz, um sie manuell in BookLog einzufügen. Dieses Hilfsmittel ordnet nur deinen Text; es speichert und versendet deine Notizen nicht.",
    "Seite oder Kapitel (optional)",
    "Zum Beispiel: S. 42 oder Kapitel 3",
    "Was ist mir aufgefallen?",
    "Worauf möchte ich zurückkommen?",
    "Notiz zum Kopieren",
    "Notiz kopieren",
    "Felder leeren",
    "Gib einen Gedanken ein, um die Notiz vorzubereiten.",
    "Notiz kopiert. Füge sie selbst in BookLog ein.",
    "Kopieren nicht möglich. Markiere und kopiere den Notiztext manuell.",
    "Dieses Hilfsmittel speichert und versendet deinen Text nicht. Kopiere die Notiz, bevor du diese Seite schließt oder neu lädst. Das Einfügen in BookLog erfolgt manuell.",
    "Seite oder Kapitel:",
    "Was mir aufgefallen ist:",
    "Worauf ich zurückkommen möchte:",
  ];
  const allCopy = (html + js + read("booklog-note-format-de.js")).replace(/\s+/g, " ");
  assert.equal(approved.length, 18);
  for (const text of approved) assert.ok(allCopy.includes(text), `approved German copy missing: ${text}`);
  assert.doesNotMatch(js, /\?\.|catch\s*\{/);
  assert.doesNotMatch(js, /localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon/);
});
test("stale clipboard completion after edit or clear is ignored; fallback selects preview", async () => {
  const handlers = {},
    field = (name) => ({
      value: "",
      addEventListener: (e, fn) => (handlers[name + e] = fn),
      focus() {
        this.focused = true;
      },
      select() {
        this.selected = true;
      },
    });
  const page = field("page"),
    attention = field("attention"),
    returning = field("return"),
    preview = field("preview"),
    status = { textContent: "" },
    copy = { addEventListener: (e, fn) => (handlers["copy" + e] = fn) },
    clear = { addEventListener: (e, fn) => (handlers["clear" + e] = fn) };
  const root = {
    hidden: true,
    classList: { add() {} },
    querySelector(s) {
      return {
        "[name=page]": page,
        "[name=attention]": attention,
        "[name=return]": returning,
        "[name=preview]": preview,
        "[data-copy]": copy,
        "[aria-live]": status,
        "[data-clear]": clear,
      }[s];
    },
  };
  let resolveWrite;
  const context = {
    document: {
      querySelector: (s) => (s === ".note-composer" ? root : { hidden: true, classList: { add() {} } }),
    },
    getComputedStyle: () => ({ getPropertyValue: () => "1" }),
    navigator: {
      clipboard: { writeText: () => new Promise((r) => (resolveWrite = r)) },
    },
    formatNoteDe,
  };
  vm.runInNewContext(read("booklog-note-composer-de.js"), context);
  attention.value = "alt";
  handlers.attentioninput();
  const pending = handlers.copyclick();
  handlers.clearclick();
  assert.equal(attention.focused, true);
  resolveWrite();
  await pending;
  assert.equal(status.textContent, "Gib einen Gedanken ein, um die Notiz vorzubereiten.");
  attention.value = "alt";
  handlers.attentioninput();
  const editing = handlers.copyclick();
  attention.value = "neu";
  handlers.attentioninput();
  resolveWrite();
  await editing;
  assert.equal(status.textContent, "");
  context.navigator.clipboard.writeText = () => Promise.reject(Error("blocked"));
  await handlers.copyclick();
  assert.equal(preview.focused, true);
  assert.equal(preview.selected, true);
  assert.equal(status.textContent, "Kopieren nicht möglich. Markiere und kopiere den Notiztext manuell.");
});

test("readiness gate leaves a missing or CSS-unready composer untouched", () => {
  for (const ready of ["", "0"]) {
    const root = {
      hidden: true,
      classList: {
        add() {
          throw new Error("unready root revealed");
        },
      },
      querySelector() {
        throw new Error("unready fields were wired");
      },
    };
    const jump = {
      hidden: true,
      classList: {
        add() {
          throw new Error("unready jump revealed");
        },
      },
    };
    const calls = [];
    const context = {
      document: {
        querySelector(selector) {
          calls.push(selector);
          return selector === ".note-composer" ? root : jump;
        },
      },
      getComputedStyle() {
        return { getPropertyValue: () => ready };
      },
      formatNoteDe,
    };
    vm.runInNewContext(read("booklog-note-composer-de.js"), context);
    assert.deepEqual(calls, [".note-composer"]);
    assert.equal(root.hidden, true);
    assert.equal(jump.hidden, true);
  }

  const calls = [];
  vm.runInNewContext(read("booklog-note-composer-de.js"), {
    document: {
      querySelector(selector) {
        calls.push(selector);
        return null;
      },
    },
    getComputedStyle() {
      throw new Error("style read without a root");
    },
    formatNoteDe,
  });
  assert.deepEqual(calls, [".note-composer"]);
});

test("stale clipboard completions after edit or clear are ignored; current rejection selects preview", async () => {
  const handlers = {},
    field = (name) => ({
      value: "",
      addEventListener: (e, fn) => (handlers[name + e] = fn),
      focus() {
        this.focused = true;
      },
      select() {
        this.selected = true;
      },
    });
  const page = field("page"),
    attention = field("attention"),
    returning = field("return"),
    preview = field("preview"),
    status = { textContent: "" },
    copy = { addEventListener: (e, fn) => (handlers["copy" + e] = fn) },
    clear = { addEventListener: (e, fn) => (handlers["clear" + e] = fn) };
  const root = {
    hidden: true,
    classList: { add() {} },
    querySelector(s) {
      return {
        "[name=page]": page,
        "[name=attention]": attention,
        "[name=return]": returning,
        "[name=preview]": preview,
        "[data-copy]": copy,
        "[aria-live]": status,
        "[data-clear]": clear,
      }[s];
    },
  };
  const writes = [];
  const context = {
    document: {
      querySelector: (s) => (s === ".note-composer" ? root : { hidden: true, classList: { add() {} } }),
    },
    getComputedStyle: () => ({ getPropertyValue: () => "1" }),
    navigator: {
      clipboard: {
        writeText: () => new Promise((resolve, reject) => writes.push({ resolve, reject })),
      },
    },
    formatNoteDe,
  };
  vm.runInNewContext(read("booklog-note-composer-de.js"), context);

  attention.value = "alt";
  handlers.attentioninput();
  const clearedSuccess = handlers.copyclick();
  handlers.clearclick();
  assert.equal(attention.focused, true);
  const afterClear = status.textContent;
  writes[0].resolve();
  await clearedSuccess;
  assert.equal(status.textContent, afterClear);

  attention.value = "alt";
  handlers.attentioninput();
  const editedSuccess = handlers.copyclick();
  attention.value = "neu";
  handlers.attentioninput();
  const afterEdit = status.textContent;
  writes[1].resolve();
  await editedSuccess;
  assert.equal(status.textContent, afterEdit);

  const editedFailure = handlers.copyclick();
  attention.value = "neu bearbeitet";
  handlers.attentioninput();
  const afterSecondEdit = status.textContent;
  writes[2].reject(Error("stale edit rejection"));
  await editedFailure;
  assert.equal(status.textContent, afterSecondEdit);
  assert.equal(preview.focused, undefined);
  assert.equal(preview.selected, undefined);

  const clearedFailure = handlers.copyclick();
  handlers.clearclick();
  const afterSecondClear = status.textContent;
  writes[3].reject(Error("stale clear rejection"));
  await clearedFailure;
  assert.equal(status.textContent, afterSecondClear);
  assert.equal(preview.focused, undefined);
  assert.equal(preview.selected, undefined);

  attention.value = "normal";
  handlers.attentioninput();
  const currentFailure = handlers.copyclick();
  writes[4].reject(Error("current clipboard rejection"));
  await currentFailure;
  assert.equal(preview.focused, true);
  assert.equal(preview.selected, true);
  assert.equal(status.textContent, "Kopieren nicht möglich. Markiere und kopiere den Notiztext manuell.");
});
