(function () {
  const root = document.querySelector(".note-composer");
  if (!root || getComputedStyle(root).getPropertyValue("--lp-note-composer-ready").trim() !== "1") return;
  const page = root.querySelector("[name=page]");
  const attention = root.querySelector("[name=attention]");
  const returnTo = root.querySelector("[name=return]");
  const preview = root.querySelector("[name=preview]");
  const copy = root.querySelector("[data-copy]");
  const status = root.querySelector("[aria-live]");
  const fields = [page, attention, returnTo];
  let revision = 0;
  const update = function () {
    revision += 1;
    preview.value = globalThis.formatNoteFr(page.value, attention.value, returnTo.value);
    copy.disabled = !preview.value;
    status.textContent = copy.disabled ? "Ajoutez une idée pour préparer la note." : "";
  };
  fields.forEach(function (field) {
    field.addEventListener("input", update);
  });
  copy.addEventListener("click", async function () {
    const copiedValue = preview.value;
    const copiedRevision = revision;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(copiedValue);
      if (revision === copiedRevision && preview.value === copiedValue) status.textContent = "Note copiée. Collez-la vous-même dans BookLog.";
    } catch (error) {
      if (revision === copiedRevision && preview.value === copiedValue) {
        preview.focus();
        preview.select();
        status.textContent = "La copie a échoué. Sélectionnez le texte de la note et copiez-le manuellement.";
      }
    }
  });
  root.querySelector("[data-clear]").addEventListener("click", function () {
    fields.forEach(function (field) {
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
})();
