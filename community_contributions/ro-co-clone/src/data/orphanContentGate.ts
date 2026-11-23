import type {
  Expert,
  MoreCareItem,
  OrphanPublishFlags,
  SiteContent,
  Testimonial,
} from "./types";

/** Keys that must stay off customer UI until approved assets exist. */
export type OrphanKey = keyof OrphanPublishFlags;

export const DEFAULT_ORPHAN_PUBLISH: OrphanPublishFlags = {
  testimonials: false,
  experts: false,
  moreCare: false,
  vanityStats: false,
};

export function normalizeOrphanPublish(
  flags: Partial<OrphanPublishFlags> | undefined,
): OrphanPublishFlags {
  return {
    testimonials: Boolean(flags?.testimonials),
    experts: Boolean(flags?.experts),
    moreCare: Boolean(flags?.moreCare),
    vanityStats: Boolean(flags?.vanityStats),
  };
}

/**
 * Customer-facing gate: orphan fields never reach public UI unless the
 * matching publish flag is explicitly true. Defaults and stale localStorage
 * stay unpublished (P1-03 / preferences: no invented bios, testimonials, or vanity stats).
 */
export function isOrphanPublished(content: SiteContent, key: OrphanKey): boolean {
  return normalizeOrphanPublish(content.orphanPublish)[key] === true;
}

export function customerTestimonials(content: SiteContent): Testimonial[] {
  if (!isOrphanPublished(content, "testimonials")) return [];
  return content.testimonials.filter((item) => item.quote.trim() && item.name.trim());
}

export function customerExperts(content: SiteContent): Expert[] {
  if (!isOrphanPublished(content, "experts")) return [];
  return content.experts.filter(
    (item) => item.name.trim() && item.role.trim() && item.imageId.trim(),
  );
}

export function customerMoreCare(content: SiteContent): MoreCareItem[] {
  if (!isOrphanPublished(content, "moreCare")) return [];
  return content.moreCare.filter(
    (item) => item.title.trim() && item.copy.trim() && item.to.trim() && item.imageId.trim(),
  );
}

export function customerVanityStats(content: SiteContent): {
  memberCountLabel: string;
  satisfactionLabel: string;
} | null {
  if (!isOrphanPublished(content, "vanityStats")) return null;
  const memberCountLabel = content.settings.memberCountLabel.trim();
  const satisfactionLabel = content.settings.satisfactionLabel.trim();
  if (!memberCountLabel && !satisfactionLabel) return null;
  return { memberCountLabel, satisfactionLabel };
}

/** Strip orphan fields from a content snapshot before any customer render path. */
export function stripUnpublishedOrphans(content: SiteContent): SiteContent {
  return {
    ...content,
    orphanPublish: normalizeOrphanPublish(content.orphanPublish),
    testimonials: customerTestimonials(content),
    experts: customerExperts(content),
    moreCare: customerMoreCare(content),
    settings: {
      ...content.settings,
      memberCountLabel: customerVanityStats(content)?.memberCountLabel ?? "",
      satisfactionLabel: customerVanityStats(content)?.satisfactionLabel ?? "",
    },
  };
}
