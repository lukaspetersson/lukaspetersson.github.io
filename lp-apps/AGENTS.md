# LP Apps website contributor guide

This directory is the static public site at `https://lukaspetersson.com/lp-apps/` inside `lukaspetersson/lukaspetersson.github.io`.

## Layout

- `index.html` and `index-sv.html`: English and Swedish portfolio hubs.
- `booklog-reading-notes*.html`, `booklog-diario-de-leitura.html`, `booklog-notas-de-lectura.html`, and `booklog-notes-de-lecture.html`: English, Swedish, Brazilian Portuguese, Spanish, and French BookLog reading guides; `booklog-book-lookup*.html`: English/Swedish/Brazilian Portuguese/Spanish external Open Library lookup tools.
- `falling-kitten-how-to-play*.html`: paired Falling Kitten guides.
- `brannball-guide.html`: Swedish BrännballCounter guide.
- `*-privacy.html`, support and deletion pages: controlling public policy/support content. Do not broaden or translate legal claims without source evidence.
- `styles.css`: shared visual language. Keep new pages consistent instead of adding page-local themes.
- `social-preview.png`: shared Open Graph/Twitter preview image.
- `sitemap.xml`: explicit LP Apps URL inventory submitted to Search Console.

## Editing conventions

- Keep pages static and dependency-free. Use semantic HTML and the existing design tokens/classes. The BookLog lookup sends only the submitted query to Open Library, renders returned values as text, and must not save data locally.
- Preserve exact app package IDs and first-party canonical URLs.
- BookLog reading guides use reciprocal `hreflang="en"`, `hreflang="sv-SE"`, `hreflang="pt-BR"`, `hreflang="es-ES"`, `hreflang="fr-FR"` and `hreflang="x-default"`. BookLog lookup pages use the same set without French; preserve the current locale sets on other guides. Every localized page needs a self-canonical and visible language links.
- Play links may keep a campaign referrer, but attribution is never assumed. Swedish links use `hl=sv&gl=SE`; Spanish lookup links use `hl=es&gl=ES` and must disclose that the app UI is English.
- Use only verified product behavior. Do not claim goals, streaks, analytics, social features, cloud sync, barcode scanning, install growth or official sports rules unless current source evidence supports it.
- Do not invent app screenshots. Clearly branded site artwork is acceptable when it is not presented as in-app UI.
- Keep Open Graph and Twitter metadata aligned with each page's title, description, canonical URL and locale.
- Add every new public page to `sitemap.xml` and to an appropriate visible internal navigation path.

## Cache-safe rotation practice

The English guide uses a versioned relative stylesheet URL and only reveals the browser rotation practice when its loaded CSS exposes `--lp-rotation-ready: 1` on the practice section. Keep the static guide and Play link available if CSS is missing or stale; do not add polling, downloads, or storage/network behavior. Test the readiness gate in `test/falling-rotation.test.js`.

## Verification

Before publication:

1. Parse every changed HTML/XML file and check all local relative links.
2. Verify one self-canonical per page and reciprocal hreflang on locale pairs.
3. Confirm Play package IDs, locale parameters and privacy/support links. Run `node --test test/booklog-book-lookup.test.js` from the repository root for the lookup pages; Spanish reading-guide coverage is `node --test test/booklog-spanish-guide.test.js` from the repository root. English reading-guide organization coverage is `node --test test/booklog-english-organization.test.js` from the repository root; French reading-guide coverage is `node --test test/booklog-french-guide.test.js` from the repository root.
   - Printable reading-note card coverage: `node --test test/booklog-printable-note-card.test.js` from the repository root.
   - Portuguese printable reading-note card coverage: `node --test test/booklog-portuguese-print-card.test.js` from the repository root.
   - Spanish printable reading-note card coverage: `node --test test/booklog-spanish-print-card.test.js` from the repository root.
   - French printable reading-note card coverage: `node --test test/booklog-french-print-card.test.js` from the repository root.
   - BookLog 4.0.7 version-scoped export/restore copy coverage: `node --test test/booklog-v13-lookup-copy.test.js` from the repository root.
   - Falling Kitten English/Spanish guide and rotation coverage: `node --test test/falling-spanish-guide.test.js test/falling-rotation.test.js` from the repository root. The isolated rotation test covers quarter turns, alternate starts, upright classification, and no transition animation.
4. Check Open Graph/Twitter keys are unique and match title, description, canonical and image dimensions.
5. Serve this directory locally with `python3 -m http.server 8795`, expose it through the platform preview tunnel, and inspect changed pages at desktop and mobile widths.
6. Run repository CI after publication, but distinguish deployment success from known repository-wide formatter or unrelated legacy link-check failures.
7. Verify the exact live custom-domain URLs after GitHub Pages and CDN propagation. An indexing request is not evidence that a page is indexed.

## Publication

The controlling source is the GitHub repository. In this environment use the GitHub REST API with `gh` and the authorized GitHub credential in `GH_TOKEN`; never use git-over-HTTPS. Publish against a verified base commit with a non-force Git Data ref update, then verify the `Deploy site` GitHub Actions run and the custom-domain output.

The `Deploy site` workflow filters HTML/CSS/JS/assets and does not run for a sitemap-only change. After such a commit, dispatch `deploy.yml` on `master` with `gh workflow run deploy.yml --repo lukaspetersson/lukaspetersson.github.io --ref master`, then verify the run and live sitemap. Do not dispatch while another deployment is in progress.

Keep local test reports, screenshots and operational receipts outside the public repository under `~/lp-apps/`; do not commit generated audit bulk.

## Reading-note composer

The English guide's composer formats only the visitor's own text for manual clipboard copying and pasting into BookLog. It must not save or send that text. Preserve the CSS readiness gate, the selectable fallback for blocked copying, and the guard against stale clipboard completion after editing or clearing.

Run `node --test test/booklog-note-composer.test.js` from the repository root. The deployed Uglifier 4.2.0 harmony parser does not support optional chaining or bindingless `catch`; avoid both and verify the actual deployment build before treating a change as live.
