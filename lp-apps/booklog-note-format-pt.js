function formatNotePt(page, attention, returnTo) {
  const clean = (value, limit) =>
    String(value || "")
      .slice(0, limit)
      .replace(/[\uD800-\uDBFF]$/, "")
      .trim();
  const location = clean(page, 80);
  const first = clean(attention, 2000);
  const second = clean(returnTo, 2000);
  const sections = [];
  if (first) sections.push(`O que chamou a minha atenção:\n${first}`);
  if (second) sections.push(`O que quero retomar:\n${second}`);
  if (!sections.length) return "";
  return `${location ? `Página ou capítulo: ${location}\n\n` : ""}${sections.join("\n\n")}`;
}
globalThis.formatNotePt = formatNotePt;
if (typeof module !== "undefined") module.exports = { formatNotePt };
