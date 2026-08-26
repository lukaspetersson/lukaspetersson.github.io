# LP Apps Brännball privacy/support candidate

Prepared 2026-08-26 for a narrow public site containing only Brännball information.

## Verified locally

- HTML parser accepted all pages; local relative-link crawl passed, including after the support-correspondence disclosure was added.
- No draft placeholders, `noindex`, or known analytics hooks were found.
- `/`, `/brannball-privacy.html`, and `/support.html` returned HTTP 200 from the local server.
- Desktop home/privacy navigation and rendering were reviewed through the preview tunnel.
- Privacy layout was visually reviewed in a 390px iframe; the initial long-title overflow was fixed and the retest showed no horizontal clipping.

## Publication gates

After the support-correspondence and website-access disclosures were added, the HTML parser/relative-link/marker scan passed and all three local HTTP routes returned 200. The revised privacy page was visually reviewed at desktop width and in a 390px iframe; the iframe reported equal scroll/client widths (388px), with both new website sections present. Mobile evidence screenshot: `d5ba3b75-50e8-48c7-b7a5-91e59df29e1b`. External Google transfer-framework links (English/Swedish) and IMY homepages (English/Swedish) were fetched successfully on 2026-08-26 and their language/purpose matched the link text.

The empty Andon repository `lp-apps-site` and handle `https://lp-apps.andonpages.com/` are reserved; no site content has been pushed. The intended policy URL is `https://lp-apps.andonpages.com/brannball-privacy.html`.

Do not publish the candidate until the clean signed versionCode 4/versionName 2.1 artifact has an explicit successful build marker and direct inspection confirms the statements about package/version, SDKs, permissions, embedded SDKs, backup rules, signing, and app implementation. Re-run all local checks after any content change, then bind/publish and verify the live HTTPS routes in a browser. Runtime behavior remains a separate Internal Testing gate.
