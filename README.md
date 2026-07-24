# Lumen Skin & Wellness — concept mockup

A six-page Astro site for **Lumen Skin & Wellness**, a fictional NP-led med spa
in Scottsdale, AZ. Built by Atlas Studio as a portfolio piece — this is a
**concept build, not a client site**. No such business exists; the address,
phone, staff, and testimonials are invented.

The site footer says so on every page, and links back to atlasstudio.dev.

> **No credential numbers.** Medical aesthetics is the vertical most likely to
> carry fabricated credentials — state license numbers, NPI numbers, a named
> medical director. The design source named roles only ("licensed nurse
> practitioner," "Master Esthetician") and invented no numbers, so nothing
> needed stripping. Re-check with:
> `grep -rioE "licen[sc]e #|lic\.? ?#|#[0-9]{5,}|NPI ?#?[0-9]{6,}|RN ?#|AZBN" --include=*.html dist/`
>
> The five **"Results vary"** disclaimers on the before/after sections came from
> the source and were kept deliberately — before/after imagery in aesthetics
> conventionally carries them.

Ported from the Atlas Studio design system in Claude Design (project
`5b78c5e0-3edd-4692-abc2-b097220f4fd1`). See
`atlas-studio-internal/guides/mockup-workflow.md` Stage 6 for the process.

## Stack

- **Astro 5**, static output — no server routes, no framework islands
- Plain CSS: [`src/styles/tokens.css`](src/styles/tokens.css) (Atlas design
  tokens) + [`src/styles/lumen.css`](src/styles/lumen.css) (the seafoam-spa
  brand theme). Everything else reads `var(--token)`.
- One shared TypeScript module for all interactive behavior
- Deploys to Cloudflare Pages

## Commands

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run preview   # serve the built output
npm run deploy    # wrangler pages deploy dist
```

## Deploying

Cloudflare Pages. Connect this repo in the dashboard (**Workers & Pages** →
**Create** → **Pages** → **Connect to Git**) with framework preset **Astro**,
build command `npm run build`, output directory `dist` — then pushes to `main`
auto-deploy.

For a one-off CLI deploy instead: `wrangler login`, then `npm run deploy`.

## Pages

| Route | Sections |
|-------|----------|
| `/` | Full-bleed hero · 3 pillars · 4 service cards · before/after slider · stats · testimonial cards · CTA |
| `/treatments/` | Crumb bar · 14-item price list in 4 groups · 2 alternating rows · FAQ accordion · CTA |
| `/results/` | Crumb bar · 3 side-by-side comparisons · wide before/after slider · testimonial slider · CTA |
| `/memberships/` | Split hero + perks · 3 pricing tiers · comparison table · FAQ cards · CTA |
| `/about/` | Crumb bar · founder spotlight · 4-person team grid · 2 philosophy rows · CTA |
| `/contact/` | Crumb bar · consultation form + details · CSS map · live hours card · footer CTA |

## Images

The Claude Design source used `<image-slot>` — a drag-and-drop authoring
element backed by a sidecar file and the `window.omelette` bridge. That runtime
doesn't exist outside the design canvas, so every slot was replaced with
[`ImageSlot.astro`](src/components/ImageSlot.astro): a plain div rendering a
textured placeholder captioned with the photo that belongs there.

There are **25 slots** across the six pages (Contact uses none). To drop in a
real photo, pass `src` (and `alt`):

```astro
<ImageSlot src="/photos/treatment-room.jpg" alt="The treatment room" />
```

The placeholder styling falls away automatically once `src` is set. Put files
in `public/` and reference them by absolute path.

## Interactive pieces

All in [`src/scripts/lumen.ts`](src/scripts/lumen.ts), loaded once from the
layout. Each block no-ops on pages that lack its markup:

- **Header** — transparent over the hero, solid white on scroll; hamburger
  drawer under 720px
- **Before/after sliders** — drag or touch to wipe. Binds every `[data-ba]`, so
  a page can hold more than one
  ([`BeforeAfter.astro`](src/components/BeforeAfter.astro))
- **Testimonial slider** — crossfade, auto-advances every 7s, pauses on hover
- **Live hours card** — computes open/closed from the visitor's clock against
  Tue–Sat 9am–6pm, and highlights today's row

The consultation form is **visual only** — it carries `data-visual` and the
script blocks its submit. There's no backend.

## Notes

- Content lives in frontmatter arrays at the top of each page, so copy edits
  don't mean touching markup.
- Nav and clinic details are shared via [`src/data/site.ts`](src/data/site.ts).
- Fonts are Cormorant Garamond + Nunito Sans, loaded from Google Fonts by an
  `@import` in `lumen.css`.
- The map on `/contact/` is drawn in CSS — no Maps embed, no API key.
- Testimonial auto-advance is skipped under `prefers-reduced-motion`; the dots
  still work.
