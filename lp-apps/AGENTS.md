# LP Apps website contributor guide

This directory is the static public site at `https://lukaspetersson.com/lp-apps/` inside `lukaspetersson/lukaspetersson.github.io`.

## Layout

- `index.html` and `index-sv.html`: English and Swedish portfolio hubs.
- `booklog-reading-notes*.html`: paired BookLog guides.
- `falling-kitten-how-to-play*.html`: paired Falling Kitten guides.
- `brannball-guide.html`: Swedish BrännballCounter guide.
- `*-privacy.html`, support and deletion pages: controlling public policy/support content. Do not broaden or translate legal claims without source evidence.
- `styles.css`: shared visual language. Keep new pages consistent instead of adding page-local themes.
- `social-preview.png`: shared Open Graph/Twitter preview image.
- `sitemap.xml`: explicit LP Apps URL inventory submitted to Search Console.

## Editing conventions

- Keep pages static and dependency-free. Use semantic HTML and the existing design tokens/classes.
- Preserve exact app package IDs and first-party canonical URLs.
- English/Swedish page pairs need reciprocal `hreflang="en"`, `hreflang="sv-SE"` and `hreflang="x-default"`, self-canonicals and visible language links.
- Play links may keep a campaign referrer, but attribution is never assumed. Swedish links use `hl=sv&gl=SE`.
- Use only verified product behavior. Do not claim goals, streaks, analytics, social features, cloud sync, barcode scanning, install growth or official sports rules unless current source evidence supports it.
- Do not invent app screenshots. Clearly branded site artwork is acceptable when it is not presented as in-app UI.
- Keep Open Graph and Twitter metadata aligned with each page's title, description, canonical URL and locale.
- Add every new public page to `sitemap.xml` and to an appropriate visible internal navigation path.

## Verification

Before publication:

1. Parse every changed HTML/XML file and check all local relative links.
2. Verify one self-canonical per page and reciprocal hreflang on locale pairs.
3. Confirm Play package IDs, locale parameters and privacy/support links.
4. Check Open Graph/Twitter keys are unique and match title, description, canonical and image dimensions.
5. Serve this directory locally with `python3 -m http.server 8795`, expose it through the platform preview tunnel, and inspect changed pages at desktop and mobile widths.
6. Run repository CI after publication, but distinguish deployment success from known repository-wide formatter or unrelated legacy link-check failures.
7. Verify the exact live custom-domain URLs after GitHub Pages and CDN propagation. An indexing request is not evidence that a page is indexed.

## Publication

The controlling source is the GitHub repository. In this environment use the GitHub REST API with `gh` and `GH_TOKEN='{{secret:github-token}}'`; never use git-over-HTTPS. Publish against a verified base commit with a non-force Git Data ref update, then verify the `Deploy site` GitHub Actions run and the custom-domain output.

Keep local test reports, screenshots and operational receipts outside the public repository under `~/lp-apps/`; do not commit generated audit bulk.
