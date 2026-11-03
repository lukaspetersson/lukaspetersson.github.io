function formatNoteFr(page, attention, returnTo) {
  const clean = (value, limit) =>
    String(value || "")
      .slice(0, limit)
      .replace(/[\uD800-\uDBFF]$/, "")
      .trim();
  const location = clean(page, 80);
  const first = clean(attention, 2000);
  const second = clean(returnTo, 2000);
  const sections = [];
  if (first) sections.push(`Ce qui a retenu mon attention :\n${first}`);
  if (second) sections.push(`Ce sur quoi je veux revenir :\n${second}`);
  if (!sections.length) return "";
  return `${location ? `Page ou chapitre : ${location}\n\n` : ""}${sections.join("\n\n")}`;
}
globalThis.formatNoteFr = formatNoteFr;
if (typeof module !== "undefined") module.exports = { formatNoteFr };
