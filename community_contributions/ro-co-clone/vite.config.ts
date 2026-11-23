import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * When VITE_SITE_ORIGIN is a real public host, rewrite dist robots/sitemap
 * so deep crawls do not keep the local 127.0.0.1 preview origin.
 * Local / unset builds leave public/ copies unchanged.
 */
function resolvePublicBuildOrigin(): string | null {
  const raw = process.env.VITE_SITE_ORIGIN;
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      host.endsWith(".localhost")
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function hostSeoRewritePlugin(): Plugin {
  return {
    name: "host-seo-rewrite",
    writeBundle(outputOptions) {
      const outDir = outputOptions.dir;
      if (!outDir) return;
      const origin = resolvePublicBuildOrigin();
      if (!origin) return;

      const robotsPath = path.join(outDir, "robots.txt");
      if (fs.existsSync(robotsPath)) {
        fs.writeFileSync(
          robotsPath,
          [
            "# Host build — origin from VITE_SITE_ORIGIN at build time.",
            "User-agent: *",
            "Disallow: /admin",
            "Disallow: /admin/",
            "Disallow: /account",
            "Disallow: /account/",
            "Disallow: /sign-in",
            "Disallow: /sign-in/",
            "Disallow: /sign-up",
            "Disallow: /sign-up/",
            "",
            `Sitemap: ${origin}/sitemap.xml`,
            "",
          ].join("\n"),
        );
      }

      const sitemapPath = path.join(outDir, "sitemap.xml");
      if (fs.existsSync(sitemapPath)) {
        const sitemap = fs.readFileSync(sitemapPath, "utf8");
        fs.writeFileSync(sitemapPath, sitemap.replaceAll("http://127.0.0.1:5173", origin));
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), hostSeoRewritePlugin()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
