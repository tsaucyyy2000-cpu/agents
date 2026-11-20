import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultContent, STORAGE_KEY } from "./defaultContent";
import type { Lead, MediaAsset, Product, SiteContent, SiteSettings } from "./types";

interface ContentContextValue {
  content: SiteContent;
  mediaById: Record<string, MediaAsset>;
  resetToDefaults: () => void;
  exportJson: () => string;
  importJson: (raw: string) => { ok: true } | { ok: false; error: string };
  updateSettings: (patch: Partial<SiteSettings>) => void;
  updateHome: (patch: { homeSupport?: string; heroGoals?: string[] }) => void;
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  upsertMedia: (asset: MediaAsset) => void;
  removeMedia: (id: string) => void;
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "status"> & { status?: Lead["status"] }) => void;
  updateLeadStatus: (id: string, status: Lead["status"]) => void;
  updateCategory: (
    slug: SiteContent["categories"][number]["slug"],
    patch: Partial<SiteContent["categories"][number]>,
  ) => void;
  setNav: (nav: SiteContent["nav"]) => void;
  setTestimonials: (testimonials: SiteContent["testimonials"]) => void;
  setGuides: (guides: SiteContent["guides"]) => void;
  setExperts: (experts: SiteContent["experts"]) => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

function mergeProducts(stored: Product[] | undefined, defaults: Product[]): Product[] {
  const byId = new Map<string, Product>();
  for (const product of defaults) {
    byId.set(product.id, { ...product });
  }
  for (const product of stored ?? []) {
    const base = byId.get(product.id);
    byId.set(product.id, {
      ...(base ?? product),
      ...product,
      priceLabel: product.priceLabel || base?.priceLabel,
      description: product.description || base?.description,
    });
  }
  const ordered: Product[] = [];
  for (const product of defaults) {
    const merged = byId.get(product.id);
    if (merged) {
      ordered.push(merged);
      byId.delete(product.id);
    }
  }
  for (const remaining of byId.values()) {
    ordered.push(remaining);
  }
  return ordered;
}

function mergeMedia(stored: MediaAsset[] | undefined, defaults: MediaAsset[]): MediaAsset[] {
  const byId = new Map<string, MediaAsset>();
  for (const asset of defaults) {
    byId.set(asset.id, { ...asset });
  }
  for (const asset of stored ?? []) {
    const base = byId.get(asset.id);
    const prefersDefaultSrc =
      Boolean(base) &&
      (asset.src.endsWith(".svg") || asset.src === base?.src || !asset.src.trim());
    byId.set(asset.id, {
      ...(base ?? asset),
      ...asset,
      src: prefersDefaultSrc && base ? base.src : asset.src || base?.src || asset.src,
      alt: asset.alt || base?.alt || asset.alt,
      label: asset.label || base?.label || asset.label,
    });
  }
  const ordered: MediaAsset[] = [];
  for (const asset of defaults) {
    const merged = byId.get(asset.id);
    if (merged) {
      ordered.push(merged);
      byId.delete(asset.id);
    }
  }
  for (const remaining of byId.values()) {
    ordered.push(remaining);
  }
  return ordered;
}

function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultContent);
    const parsed = JSON.parse(raw) as SiteContent;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.products)) {
      return structuredClone(defaultContent);
    }
    return {
      ...structuredClone(defaultContent),
      ...parsed,
      version: defaultContent.version,
      settings: { ...defaultContent.settings, ...parsed.settings },
      media: mergeMedia(parsed.media, defaultContent.media),
      howItWorks: parsed.howItWorks?.length ? parsed.howItWorks : defaultContent.howItWorks,
      faqs: parsed.faqs?.length ? parsed.faqs : defaultContent.faqs,
      moreCare: parsed.moreCare?.length ? parsed.moreCare : defaultContent.moreCare,
      guides: parsed.guides?.length ? parsed.guides : defaultContent.guides,
      products: mergeProducts(parsed.products, defaultContent.products),
    };
  } catch {
    return structuredClone(defaultContent);
  }
}

function persist(content: SiteContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => loadContent());

  useEffect(() => {
    persist(content);
  }, [content]);

  const mediaById = useMemo(() => {
    const map: Record<string, MediaAsset> = {};
    for (const asset of content.media) map[asset.id] = asset;
    return map;
  }, [content.media]);

  const value = useMemo<ContentContextValue>(
    () => ({
      content,
      mediaById,
      resetToDefaults: () => setContent(structuredClone(defaultContent)),
      exportJson: () => JSON.stringify(content, null, 2),
      importJson: (raw) => {
        try {
          const parsed = JSON.parse(raw) as SiteContent;
          if (!parsed.products || !parsed.settings) {
            return { ok: false, error: "Missing required site fields." };
          }
          setContent({
            ...structuredClone(defaultContent),
            ...parsed,
            updatedAt: new Date().toISOString(),
          });
          return { ok: true };
        } catch {
          return { ok: false, error: "Invalid JSON." };
        }
      },
      updateSettings: (patch) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          settings: { ...current.settings, ...patch },
        })),
      updateHome: (patch) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          homeSupport: patch.homeSupport ?? current.homeSupport,
          heroGoals: patch.heroGoals ?? current.heroGoals,
        })),
      upsertProduct: (product) =>
        setContent((current) => {
          const exists = current.products.some((item) => item.id === product.id);
          return {
            ...current,
            updatedAt: new Date().toISOString(),
            products: exists
              ? current.products.map((item) => (item.id === product.id ? product : item))
              : [...current.products, product],
          };
        }),
      removeProduct: (id) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          products: current.products.filter((item) => item.id !== id),
        })),
      upsertMedia: (asset) =>
        setContent((current) => {
          const exists = current.media.some((item) => item.id === asset.id);
          return {
            ...current,
            updatedAt: new Date().toISOString(),
            media: exists
              ? current.media.map((item) => (item.id === asset.id ? asset : item))
              : [...current.media, asset],
          };
        }),
      removeMedia: (id) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          media: current.media.filter((item) => item.id !== id),
        })),
      addLead: (lead) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          leads: [
            {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              status: lead.status ?? "new",
              goal: lead.goal,
              state: lead.state,
              notes: lead.notes,
            },
            ...current.leads,
          ],
        })),
      updateLeadStatus: (id, status) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          leads: current.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
        })),
      updateCategory: (slug, patch) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          categories: current.categories.map((category) =>
            category.slug === slug ? { ...category, ...patch } : category,
          ),
        })),
      setNav: (nav) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          nav,
        })),
      setTestimonials: (testimonials) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          testimonials,
        })),
      setGuides: (guides) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          guides,
        })),
      setExperts: (experts) =>
        setContent((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          experts,
        })),
    }),
    [content, mediaById],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
