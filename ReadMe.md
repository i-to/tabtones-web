# Tabtones Website

## Tech Stack

- Eleventy (11ty) 3 for static site generation, with `@11ty/eleventy-img` for responsive photos
- HTML, Nunjucks templates, CSS, and vanilla JavaScript (ES modules)
- Self-hosted variable fonts (Plus Jakarta Sans, Playfair Display) from `@fontsource-variable/*`; no third-party requests before YouTube consent
- Node.js and npm

## Structure

- `src/index.html`, `src/impressum.html`, `src/datenschutz.html` - Pages
- `src/_data/` - `site.js` (contact data, social links) and `videos.json` (YouTube IDs and titles; the first entry is shown large)
- `src/_includes/` - `base.njk` layout, `partials/` (header, footer, consent banner, icon sprite), `macros.njk`
- `src/css/`, `src/js/` - Stylesheet and ES modules (`consent.js`, `nav.js`, `contact.js`)
- `src/photos/` - Original band photos. They are resized at build time and are not published as-is.
- `src/assets/` - Published assets: placeholder and generated images, video posters, favicon
- `scripts/` - Developer tools (see below)
- `.github/workflows/deploy.yml` - Build and deploy to GitHub Pages
- `_site/` - Generated output (ignored by git)

## Setup and Commands

Install Node.js (LTS recommended), then install dependencies from the repository root:

```sh
npm ci
```

Build the static site into `_site/`:

```sh
npm run build
```

Start the local development server at <http://localhost:8080/>:

```sh
npm start
```

Developer tools:

- `npm run posters` - Downloads YouTube thumbnails and missing titles into `src/assets/images/video-posters/` and `videos.json`. Run it after adding a video to `videos.json`. Visitors never contact YouTube for posters.
- `npm run placeholders` - Creates missing placeholder images under their final names. Existing files are never overwritten.
- `npm run check` - Run after `npm run build`. Fails on inline styles/scripts (blocked by the CSP) and on unexpected external hosts.

Environment variables (set by the GitHub Actions workflow): `PATH_PREFIX` (e.g. `/tabtones-web/`) and `SITE_URL` (canonical URL used for Open Graph tags and the sitemap). The Content-Security-Policy meta tag is only emitted for `npm run build`, not for `npm start`, because the dev server injects an inline reload script.

There is currently no automated test suite configured.

## Deployment

The repository includes a GitHub Actions workflow for building and deploying to GitHub Pages.

## Consent and legal notes

- YouTube iframes are only created after user consent. The decision is stored in `localStorage` (key `tabtones.consent.youtube`) for up to six months and can be changed via "Cookie-Einstellungen" in the footer.

## VS Code Tasks

- **Eleventy: Serve** - Runs `npm start` and serves the site at <http://localhost:8080/>.