function formatNoteDe(page, attention, returnTo) {
  const clean = (value, limit) =>
    String(value || "")
      .slice(0, limit)
      .replace(/[\uD800-\uDBFF]$/, "")
      .trim();
  const location = clean(page, 80),
    first = clean(attention, 2000),
    second = clean(returnTo, 2000),
    sections = [];
  if (first) sections.push(`Was mir aufgefallen ist:\n${first}`);
  if (second) sections.push(`Worauf ich zurückkommen möchte:\n${second}`);
  if (!sections.length) return "";
  return `${location ? `Seite oder Kapitel: ${location}\n\n` : ""}${sections.join("\n\n")}`;
}
globalThis.formatNoteDe = formatNoteDe;
if (typeof module !== "undefined") module.exports = { formatNoteDe };
