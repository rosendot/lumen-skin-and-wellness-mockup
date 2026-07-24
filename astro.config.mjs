// @ts-check
import { defineConfig } from "astro/config";

// Static output — the mockup is a plain marketing site with no server routes.
// Deploys to Cloudflare Pages as a folder of HTML/CSS/JS.
export default defineConfig({
  site: "https://lumen-skin-and-wellness-mockup.pages.dev",
  output: "static",
  build: {
    // Emit /treatments/index.html rather than /treatments.html so the preview
    // URL reads like a real site.
    format: "directory",
  },
});
