// Renders Lumen Skin & Wellness brand assets from the cropped icon.
// Run from the repo root. sharp isn't installed here — borrow the vault's:
//   NODE_PATH="…/atlas-studio-internal/node_modules" node .brand/build-assets.mjs
//
// Source: .brand/_emblem-crop.png — the sun+drop ICON cropped out of the
// bottom-right "illustrative" cell (the LUMEN wordmark below it is NOT included:
// the header already renders the name in text beside the mark, and the crop also
// sidesteps the Gemini watermark that sits by the wordmark).
//
// This is a single-colour line-art mark → Case A in mockup-logo-workflow.md:
// flatten to a brand ink via a luminance mask. But unlike the earlier mockups,
// Lumen's scrolled header is WHITE (footer is dark), so the on-site mark must
// read on light. We render it in the primary teal, which holds on white, on the
// dark footer, and over the hero.
import sharp from "sharp";

const SRC     = ".brand/_emblem-crop.png";
const CREAM    = "#f0faf8";                    // pale seafoam (source bg)
const TEAL     = { r: 0x4c, g: 0xb5, b: 0xab }; // #4cb5ab primary — the on-site ink
const DARKINK  = { r: 0x0d, g: 0x1c, b: 0x1b }; // deep teal-black — for the OG (on cream)
const DARK     = "#0d1c1b";
const AQUA     = "#a9ddd6";
const PRIMARY  = "#4cb5ab";

// Case A: alpha from luminance (dark line-art → opaque), flood with any ink.
async function icon(px, ink) {
  const base = await sharp(SRC).resize(px, px, { fit: "contain", background: CREAM }).toBuffer();
  const alpha = await sharp(base)
    .greyscale()
    .threshold(210)   // the teal line-art is darker than the pale-seafoam bg
    .negate()         // line-art → 255 (opaque), bg → 0 (transparent)
    .raw()
    .toBuffer();
  return sharp({ create: { width: px, height: px, channels: 3, background: ink } })
    .joinChannel(alpha, { raw: { width: px, height: px, channels: 1 } })
    .png()
    .toBuffer();
}

const tealIcon = (px) => icon(px, TEAL);
const darkIcon = (px) => icon(px, DARKINK);

// Opaque tile for apple-touch (dark teal disc, teal→light mark on it).
async function tile(px) {
  const inner = Math.round(px * 0.62);
  const pad = Math.round((px - inner) / 2);
  const mark = await icon(inner, { r: 0xf0, g: 0xfa, b: 0xf8 }); // pale mark on teal tile
  return sharp({ create: { width: px, height: px, channels: 4, background: PRIMARY } })
    .composite([{ input: mark, left: pad, top: pad }])
    .png()
    .toBuffer();
}

const out = [];

// ── Favicons / PWA / Apple touch ──────────────────────────────────────────
// Teal mark on transparency for the tab; a teal tile for apple-touch.
await sharp(await tealIcon(64)).resize(32, 32).webp({ quality: 92 }).toFile("public/favicon-32.webp"); out.push("favicon-32.webp");
await sharp(await tealIcon(192)).webp({ quality: 90 }).toFile("public/icon-192.webp"); out.push("icon-192.webp");
await sharp(await tealIcon(512)).webp({ quality: 90 }).toFile("public/icon-512.webp"); out.push("icon-512.webp");
await sharp(await tealIcon(512)).png().toFile("public/icon-512.png"); out.push("icon-512.png");
await sharp(await tile(180)).png().toFile("public/apple-touch-icon.png"); out.push("apple-touch-icon.png");

// ── On-site marks. The header is transparent over the hero and turns WHITE on
//    scroll, so the mark needs two states (like the text mark it replaces,
//    which re-colours on .solid): a PALE mark over the hero, a TEAL mark on the
//    white scrolled header. The footer is dark, so it uses the pale one too.
await sharp(await icon(512, { r: 0xf0, g: 0xfa, b: 0xf8 })).png().toFile("public/emblem-light.png"); out.push("public/emblem-light.png");
await sharp(await tealIcon(512)).png().toFile("public/emblem-teal.png"); out.push("public/emblem-teal.png");
// Default emblem.png = teal (used anywhere a single mark is wanted).
await sharp(await tealIcon(512)).png().toFile("public/emblem.png"); out.push("public/emblem.png");
await sharp(await tealIcon(512)).png().toFile(".brand/emblem.png"); out.push(".brand/emblem.png");

// ── OG / social share card, 1200x630 (cream bg → dark-ink icon + wordmark) ──
const emblemForOg = await darkIcon(200);
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${CREAM}"/>
  <text x="360" y="212" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="600" fill="${DARK}">Lumen</text>
  <text x="364" y="256" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="6" fill="${PRIMARY}">SKIN &amp; WELLNESS · SCOTTSDALE</text>
  <text x="100" y="430" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="${DARK}">Medical-grade skincare, results you can see.</text>
  <rect x="100" y="500" width="1000" height="1.6" fill="${PRIMARY}" opacity=".4"/>
  <text x="100" y="546" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="600" letter-spacing="3.2" fill="${PRIMARY}">SCOTTSDALE, AZ · MEMBERSHIPS AVAILABLE</text>
  <text x="1100" y="546" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="600" letter-spacing="3.2" fill="${AQUA}">CONCEPT BUILD</text>
</svg>`;
const cardBuf = await sharp(Buffer.from(card), { density: 150 }).resize(1200, 630).png().toBuffer();
const ogComposed = await sharp(cardBuf).composite([{ input: emblemForOg, left: 120, top: 120 }]).toBuffer();
await sharp(ogComposed).png().toFile("public/og-image.png"); out.push("og-image.png");
await sharp(ogComposed).webp({ quality: 88 }).toFile("public/og-image.webp"); out.push("og-image.webp");

console.log("wrote:", out.join(", "));
