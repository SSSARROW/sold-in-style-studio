# Sold in Style Studio: website

Static site: `index.html` + `css/style.css` + `js/main.js`. No build step.
Animation: GSAP 3.12.5 + ScrollTrigger, Lenis smooth scroll (CDN).

## Run locally
    python -m http.server 5173
then open http://127.0.0.1:5173

## Deploy
Drag the folder into Netlify / Vercel / any static host (exclude `assets/raw`).

## Replace before launch
- Studio email is `info@soldinstylestudio.com` (index.html footer + `STUDIO_EMAIL` in js/main.js)
- Instagram link in the footer points to instagram.com (placeholder)
- The form opens the visitor's mail app (mailto). For real submissions, point it at Formspree / Netlify Forms.

## Images
Every visible image is used once on the page.
- Real studio photos (Google Business listing): `work-living`, `work-kitchen`, `work-kitchen-fireplace`, `work-office`, `work-bath`.
  Upscaled 4x with Real-ESRGAN (x4plus) from the originals in `assets/raw/`.
- Logo: `logo-mark.png`, `logo-full.png` (cut out of the original logo file).
- AI-generated images (Figma AI): `hero-living` (also upscaled), `bedroom`, `str-lounge`, `str-patio`, `detail`, `exterior`,
  services `svc-staging`, `svc-rental`, `svc-styling`, `svc-photo`, and process steps `step-consult`, `step-plan`, `step-install`, `step-photo`.
  Swap these for real portfolio shots when available; keep the same filenames.
- `assets/raw/` holds the original downloads; not needed in production.
