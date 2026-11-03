const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { formatNoteFr } = require("../lp-apps/booklog-note-format-fr.js");
const removeApprovedFrenchComposerDelta = require("./booklog-french-composer-delta");
const base = path.join(__dirname, "../lp-apps");
const read = (name) => fs.readFileSync(path.join(base, name), "utf8");
test("French formatter preserves user newlines and enforces UTF-16 limits safely", () => {
  assert.equal(
    formatNoteFr(" p. 42 ", " idée\ndétaillée ", "revoir"),
    "Page ou chapitre : p. 42\n\nCe qui a retenu mon attention :\nidée\ndétaillée\n\nCe sur quoi je veux revenir :\nrevoir"
  );
  assert.equal(formatNoteFr("", "", "  "), "");
  assert.equal(formatNoteFr("x".repeat(79) + "📚", "idée", ""), `Page ou chapitre : ${"x".repeat(79)}\n\nCe qui a retenu mon attention :\nidée`);
  assert.equal(formatNoteFr("", "x".repeat(1999) + "📚", ""), `Ce qui a retenu mon attention :\n${"x".repeat(1999)}`);
});
test("guide insertion preserves frozen French baseline outside the sole additions", () => {
  const fixture = fs.readFileSync(path.join(__dirname, "french-guide-baseline.html"));
  assert.equal(crypto.createHash("sha256").update(fixture).digest("hex"), "eb28ca2e6b55d8f0e596d5b75eb1925819351c49a07bcb1c2f8d0c45ac72a015");
  const baseline = fixture.toString();
  const source = removeApprovedFrenchComposerDelta(read("booklog-notes-de-lecture.html"));
  assert.equal(source, baseline);
});
test("composer remains local, gated, accessible and has no external behavior", () => {
  const html = read("booklog-notes-de-lecture.html"),
    js = read("booklog-note-composer-fr.js");
  assert.match(html, /Vous voulez commencer ici/);
  assert.match(html, /class="note-composer-jump" hidden/);
  assert.match(html, /class="note-composer"[^>]* hidden/);
  assert.match(html, /Préparez une note à copier/);
  assert.match(html, /Page ou chapitre \(facultatif\)/);
  assert.match(html, /Ex\. : p\. 42 ou chapitre 3/);
  assert.match(html, /Qu’est-ce qui a retenu mon attention \?/);
  assert.match(html, /Sur quoi ai-je envie de revenir \?/);
  assert.match(html, /Note prête à copier/);
  assert.match(html, /Copier la note/);
  assert.match(html, /Effacer/);
  assert.match(
    html,
    /Cet outil ne sauvegarde ni n’envoie votre texte\. Copiez la note avant de fermer ou recharger cette page\. Le collage dans BookLog est manuel\./
  );
  assert.match(js, /Note copiée\. Collez-la vous-même dans BookLog\./);
  assert.match(js, /La copie a échoué\. Sélectionnez le texte de la note et copiez-le manuellement\./);
  assert.match(js, /Ajoutez une idée pour préparer la note\./);
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
  assert.equal(
    crypto.createHash("sha256").update(read("booklog-note-composer-1.0.0.css")).digest("hex"),
    "3595813d7fa253af64cfee4475209ab61549f397007da9bc1f02d1564e965f5e"
  );
});

test("deferred clipboard completion after clear cannot report success for stale text", async () => {
  const handlers = {};
  const field = (name) => ({
    value: "",
    addEventListener: (event, fn) => {
      handlers[name + event] = fn;
    },
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
    status = { textContent: "" };
  const copy = {
    disabled: false,
    addEventListener: (event, fn) => {
      handlers["copy" + event] = fn;
    },
  };
  const clear = {
    addEventListener: (event, fn) => {
      handlers["clear" + event] = fn;
    },
  };
  const root = {
    hidden: true,
    classList: { add() {} },
    querySelector(selector) {
      return {
        "[name=page]": page,
        "[name=attention]": attention,
        "[name=return]": returning,
        "[name=preview]": preview,
        "[data-copy]": copy,
        "[aria-live]": status,
        "[data-clear]": clear,
      }[selector];
    },
  };
  const jump = { hidden: true, classList: { add() {} } };
  let resolveWrite;
  const context = {
    document: {
      querySelector(selector) {
        return selector === ".note-composer" ? root : jump;
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
    formatNoteFr,
  };
  vm.runInNewContext(read("booklog-note-composer-fr.js"), context);
  attention.value = "Une idée";
  handlers["attentioninput"]();
  const pending = handlers["copyclick"]();
  handlers["clearclick"]();
  assert.equal(attention.focused, true);
  assert.equal(preview.value, "");
  resolveWrite();
  await pending;
  assert.equal(status.textContent, "Ajoutez une idée pour préparer la note.");
  attention.value = "Ancienne idée";
  handlers["attentioninput"]();
  const pendingEdit = handlers["copyclick"]();
  attention.value = "Idée modifiée";
  handlers["attentioninput"]();
  resolveWrite();
  await pendingEdit;
  assert.equal(status.textContent, "");
  context.navigator.clipboard.writeText = () => Promise.reject(new Error("blocked"));
  attention.value = "Texte de secours";
  handlers["attentioninput"]();
  await handlers["copyclick"]();
  assert.equal(preview.focused, true);
  assert.equal(preview.selected, true);
  assert.equal(status.textContent, "La copie a échoué. Sélectionnez le texte de la note et copiez-le manuellement.");
});
