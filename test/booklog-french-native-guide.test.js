const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const removeApprovedFrenchComposerDelta = require("./booklog-french-composer-delta");

const root = path.resolve(__dirname, "..");
const guide = fs.readFileSync(path.join(root, "lp-apps/booklog-notes-de-lecture.html"), "utf8");
const figure = `      <figure class="native-book-screen">
        <img
          src="booklog-native-note-screen.png"
          width="252"
          height="560"
          alt="Écran de BookLog pour Android avec le livre fictif The Lantern Room et une note d’exemple en anglais."
        />
        <figcaption>
          Écran de notes de BookLog pour Android, capturé en septembre 2026 avec un livre et une note fictifs. L’interface est en anglais.
        </figcaption>
      </figure>
`;
const historicalImageHash = "fa3bd388048e7b88a34d8faecf76ade0e80c4e093649cc3c90cc464d5523e424";
const frenchBaselineHash = "195b91dcc80cb450209f6b020767064c402c910d9e41c3dba29799fd7ef79366";

test("French guide adds only the disclosed historical native illustration", () => {
  const image = fs.readFileSync(path.join(root, "lp-apps/booklog-native-note-screen.png"));
  assert.equal(crypto.createHash("sha256").update(image).digest("hex"), historicalImageHash);
  assert.equal(guide.split(figure).length - 1, 1, "exact figure appears once");
  assert.ok(guide.includes(figure));
  assert.ok(guide.indexOf(figure) > guide.indexOf("Soyez concret:".replace(":", "")));
  assert.ok(guide.indexOf(figure) < guide.indexOf('<section class="printable-note-section"'));
  const withoutFigure = removeApprovedFrenchComposerDelta(guide).replace(figure, "");
  assert.equal(
    crypto.createHash("sha256").update(withoutFigure).digest("hex"),
    frenchBaselineHash,
    "removing the exact figure restores every byte of the French baseline"
  );
});
