document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());



const printNoteButton = document.querySelector(".print-note-button");
if (printNoteButton) {
  printNoteButton.addEventListener("click", () => {
    document.body.classList.add("printing-note-card");
    const clearPrintState = () => document.body.classList.remove("printing-note-card");
    window.addEventListener("afterprint", clearPrintState, { once: true });
    try {
      window.print();
    } catch (error) {
      window.removeEventListener("afterprint", clearPrintState);
      clearPrintState();
      throw error;
    }
  });
}
