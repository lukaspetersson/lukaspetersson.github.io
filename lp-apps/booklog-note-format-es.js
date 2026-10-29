function formatNoteEs(page, attention, returnTo) {
  const clean = (value, limit) =>
    String(value || "")
      .slice(0, limit)
      .trim();
  const location = clean(page, 80);
  const first = clean(attention, 2000);
  const second = clean(returnTo, 2000);
  const sections = [];
  if (first) sections.push(`Me llamó la atención:\n${first}`);
  if (second) sections.push(`Para volver a leer:\n${second}`);
  if (!sections.length) return "";
  return `${location ? `Página/capítulo: ${location}\n\n` : ""}${sections.join("\n\n")}`;
}
globalThis.formatNoteEs = formatNoteEs;
if (typeof module !== "undefined") module.exports = { formatNoteEs };
