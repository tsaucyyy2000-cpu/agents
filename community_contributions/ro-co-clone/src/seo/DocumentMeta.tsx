import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import {
  absoluteUrl,
  DEFAULT_ROBOTS,
  metaForPathname,
  SITE_NAME,
  siteOrigin,
} from "./routeMeta";

const LD_ID = "ro-clone-jsonld";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(data: Record<string, unknown>) {
  let el = document.getElementById(LD_ID);
  if (!el) {
    el = document.createElement("script");
    el.id = LD_ID;
    el.setAttribute("type", "application/ld+json");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function DocumentMeta() {
  const { pathname, search } = useLocation();
  const { content } = useContent();

  useEffect(() => {
    const meta = metaForPathname(pathname);
    const brand = content.settings.brandName || SITE_NAME;
    let titleBase = meta.title;
    let description = meta.description;

    const guideMatch = pathname.match(/^\/guides\/([^/]+)\/?$/);
    if (guideMatch) {
      const guide = content.guides.find((item) => item.id === guideMatch[1]);
      if (guide) {
        titleBase = guide.title;
        description = guide.summary || description;
      }
    }

    const productMatch = pathname.match(/^\/products\/([^/]+)\/?$/);
    if (productMatch) {
      const product = content.products.find((item) => item.id === productMatch[1]);
      if (product) {
        titleBase = product.name;
        description = product.description || product.meta || description;
      }
    }

    const title = `${titleBase} · ${brand}`;
    const canonicalPath = meta.path === "/" ? "/" : meta.path;
    const canonical = absoluteUrl(canonicalPath);
    const robots = meta.robots ?? DEFAULT_ROBOTS;
    const ogImage = absoluteUrl("/media/hero-home.jpg");

    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[name="theme-color"]', { name: "theme-color", content: "#0f766e" });

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: brand,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });

    upsertLink("canonical", canonical);

    const schemaType = meta.schemaType ?? "WebPage";
    setJsonLd({
      "@context": "https://schema.org",
      "@type": schemaType,
      name: title,
      description,
      url: canonical,
      isPartOf: {
        "@type": "WebSite",
        name: brand,
        url: `${siteOrigin()}/`,
      },
      about: {
        "@type": "Thing",
        name: "Telehealth marketing site",
      },
      disclaimer:
        "Not medical advice. Not affiliated with Ro. No verified prices or clinician credentials until supplied.",
    });

    void search;
  }, [
    pathname,
    search,
    content.settings.brandName,
    content.guides,
    content.products,
  ]);

  return null;
}
