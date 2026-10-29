function formatNote(page, attention, returnTo) {
  const clean = (value, limit) =>
    String(value || "")
      .slice(0, limit)
      .trim();
  const location = clean(page, 80);
  const first = clean(attention, 2000);
  const second = clean(returnTo, 2000);
  const sections = [];
  if (first) sections.push(`What caught my attention?\n${first}`);
  if (second) sections.push(`What do I want to return to?\n${second}`);
  if (!sections.length) return "";
  return `${location ? `Page or chapter: ${location}\n\n` : ""}${sections.join("\n\n")}`;
}
globalThis.formatNote = formatNote;
if (typeof module !== "undefined") module.exports = { formatNote };
