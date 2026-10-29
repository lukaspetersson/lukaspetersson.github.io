import "./booklog-note-format.js";

const root = document.querySelector(".note-composer");
if (root && getComputedStyle(root).getPropertyValue("--lp-note-composer-ready").trim() === "1") {
  const page = root.querySelector("[name=page]");
  const attention = root.querySelector("[name=attention]");
  const returnTo = root.querySelector("[name=return]");
  const preview = root.querySelector("[name=preview]");
  const copy = root.querySelector("[data-copy]");
  const status = root.querySelector("[aria-live]");
  const fields = [page, attention, returnTo];
  let revision = 0;
  const update = () => {
    revision += 1;
    preview.value = globalThis.formatNote(page.value, attention.value, returnTo.value);
    copy.disabled = !attention.value.trim() && !returnTo.value.trim();
    status.textContent = copy.disabled ? "Add a thought to make a note." : "";
  };
  fields.forEach((field) => field.addEventListener("input", update));
  copy.addEventListener("click", async () => {
    const copiedValue = preview.value;
    const copiedRevision = revision;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(copiedValue);
      if (revision === copiedRevision && preview.value === copiedValue) {
        status.textContent = "Note copied. Paste it into BookLog yourself.";
      }
    } catch (error) {
      if (revision === copiedRevision && preview.value === copiedValue) {
        preview.focus();
        preview.select();
        status.textContent = "Copying was blocked. Select the note text and copy it yourself.";
      }
    }
  });
  root.querySelector("[data-clear]").addEventListener("click", () => {
    fields.forEach((field) => {
      field.value = "";
    });
    update();
    attention.focus();
  });
  update();
  root.hidden = false;
  root.classList.add("is-ready");
  const jump = document.querySelector(".note-composer-jump");
  if (jump) {
    jump.hidden = false;
    jump.classList.add("is-ready");
  }
}
