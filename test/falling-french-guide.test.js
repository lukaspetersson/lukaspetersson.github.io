const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const site = path.join(__dirname, "..", "lp-apps");
const read = (name) => fs.readFileSync(path.join(site, name), "utf8");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const frUrl = "https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-fr.html";
const newAlternate = `    <link rel="alternate" hreflang="fr-FR" href="${frUrl}" />\n`;
const newAnchor = `        <a href="falling-kitten-how-to-play-fr.html" lang="fr">Français</a>\n`;
const ptAlternate = `    <link rel="alternate" hreflang="pt-BR" href="https://lukaspetersson.com/lp-apps/falling-kitten-how-to-play-pt-br.html" />\n`;
const ptAnchor = `        <a href="falling-kitten-how-to-play-pt-br.html" lang="pt-BR">Português (Brasil)</a>\n`;

test("French guide matches parent-reviewed copy, metadata, and source-bounded product behavior", () => {
  const html = read("falling-kitten-how-to-play-fr.html");
  assert.match(html, /<html lang="fr-FR">/);
  assert.match(html, /<title>Falling Kitten sur Android : comment faire tourner les chatons — LP Apps<\/title>/);
  assert.match(
    html,
    /<meta\s+name="description"\s+content="Un guide pour faire tourner les chatons, marquer des points et comprendre les cœurs dans Falling Kitten sur Android\."\s+\/>/
  );
  assert.ok(html.includes(`rel="canonical" href="${frUrl}"`));
  for (const [locale, file] of [
    ["en", "falling-kitten-how-to-play.html"],
    ["sv-SE", "falling-kitten-how-to-play-sv.html"],
    ["es-ES", "falling-kitten-how-to-play-es.html"],
    ["fr-FR", "falling-kitten-how-to-play-fr.html"],
    ["x-default", "falling-kitten-how-to-play.html"],
  ])
    assert.ok(html.includes(`hreflang="${locale}" href="https://lukaspetersson.com/lp-apps/${file}"`));
  const normalizedHtml = html.replace(/\s+/g, " ");
  for (const value of [
    "Comment jouer à Falling Kitten",
    "Navigation principale",
    "Confidentialité (en anglais)",
    "Aide (en anglais)",
    "Langue",
    "Faites tourner les chatons qui tombent pour qu’ils atterrissent sur leurs pattes. Ce guide correspond à Falling Kitten 1.2 pour Android. Les boutons et les messages de l’application sont en anglais, même sur un appareil configuré en français.",
    "Télécharger Falling Kitten sur Google Play",
    "Votre première partie",
    "Commencez une partie. Le score démarre à 0 et vous avez trois cœurs.",
    "Touchez un chaton pendant sa chute pour le faire tourner. Chaque appui lui fait faire un quart de tour (90°).",
    "Un chaton qui atterrit sur ses pattes rapporte un point. Sinon, vous perdez un cœur.",
    "Continuez à faire tourner les chatons pendant leur chute. La partie se termine quand vous avez perdu les trois cœurs.",
    "Un chaton bleu au sol, 1 point et trois cœurs rouges.",
    "Capture d’écran de Falling Kitten 1.2 pour Android : 1 point et trois cœurs. L’interface du jeu est en anglais.",
    "Après une partie",
    "Le jeu affiche le score de la partie et votre meilleur score enregistré sur l’appareil. Touchez l’icône pour rejouer.",
    "Falling Kitten fonctionne hors connexion et ne nécessite pas de compte. Ce n’est ni un animal de compagnie virtuel, ni un jeu destiné aux chats.",
    "Guides et aide de LP Apps",
  ])
    assert.ok(normalizedHtml.includes(value.replace(/\s+/g, " ")), `missing approved copy: ${value}`);
  assert.ok(
    html.includes(
      "id=com.lukas.android.fallingkitten&amp;hl=fr&amp;gl=FR&amp;referrer=utm_source%3Dlp_apps%26utm_medium%3Dreferral%26utm_campaign%3Dportfolio_2026"
    )
  );
  assert.ok(html.includes('src="falling-kitten-android-score-1.png"'));
});

test("French guide preserves the three existing guide pages apart from exact locale insertions", () => {
  const baselines = {
    "falling-kitten-how-to-play.html": "21c78763a5814a45a4b8788f4004b69a37c0c750d8c43e693eee2a959a89c2c2",
    "falling-kitten-how-to-play-sv.html": "38ea33bfed7b85b65b31c4470a4c2ea62cd77eee75c3dd09e59801d060c045b7",
    "falling-kitten-how-to-play-es.html": "f6e78c9244f7b2b60e19bd10da3935cf672d96524893cead1fc18af1d487e98e",
  };
  for (const [file, expected] of Object.entries(baselines)) {
    const html = read(file);
    assert.equal(html.split(ptAlternate).length - 1, 1, `${file}: one reciprocal Portuguese alternate`);
    assert.equal(html.split(ptAnchor).length - 1, 1, `${file}: one visible Portuguese link`);
    const withoutPortuguese = html.replace(ptAlternate, "").replace(ptAnchor, "");
    assert.equal(withoutPortuguese.split(newAlternate).length - 1, 1, `${file}: one reciprocal French alternate`);
    assert.equal(html.split(newAnchor).length - 1, 1, `${file}: one visible French link`);
    const normalized = withoutPortuguese.replace(newAlternate, "").replace(newAnchor, "");
    assert.equal(hash(normalized), expected, `${file} changed beyond exact French locale insertions`);
  }
});
