import type { CareArea } from "./types";

/** Extra care-landing storytelling — original copy, no prices/outcomes/clinical claims. */
export type PathwayCard = {
  id: string;
  title: string;
  copy: string;
};

export type ExpectCard = {
  id: string;
  title: string;
  copy: string;
};

export type DepthFaq = {
  id: string;
  question: string;
  answer: string;
};

export type CareLandingDepth = {
  pathwayKicker: string;
  pathwayTitle: string;
  pathwayDek: string;
  pathways: PathwayCard[];
  expectKicker: string;
  expectTitle: string;
  expectDek: string;
  expectations: ExpectCard[];
  membershipNote: string;
  safetyLead: string;
  faqs: DepthFaq[];
};

export const careLandingDepth: Record<CareArea, CareLandingDepth> = {
  weight: {
    pathwayKicker: "Pathways",
    pathwayTitle: "Formats people explore here",
    pathwayDek:
      "Informational cards only. A licensed clinician decides what is appropriate — this page does not prescribe or quote outcomes.",
    pathways: [
      {
        id: "w-injectable",
        title: "Weekly injectable-style path",
        copy: "Membership storytelling around a once-weekly format with check-in metaphors. Details stay on the product cards below.",
      },
      {
        id: "w-oral",
        title: "Daily oral path",
        copy: "An oral pathway card for people who prefer a non-injectable routine. Eligibility is not determined on this page.",
      },
      {
        id: "w-coverage",
        title: "Coverage vs cash-pay framing",
        copy: "Optional insurance-check UI later in the funnel. No payer APIs and no verified dollar amounts on this site.",
      },
    ],
    expectKicker: "What to expect",
    expectTitle: "A calm path from quiz to plan review",
    expectDek:
      "Same four-beat funnel as the rest of the site. Answers stay in this browser until a real clinic backend is connected.",
    expectations: [
      {
        id: "w-e1",
        title: "Short quiz first",
        copy: "Capture goals and basics for this aisle before the shared visit.",
      },
      {
        id: "w-e2",
        title: "Shared visit intake",
        copy: "Care goal, state, option, and confirm — sample data only on this preview.",
      },
      {
        id: "w-e3",
        title: "Safety context nearby",
        copy: "GLP-1 ISI stubs link from this landing. They are layout placeholders, not FDA labeling.",
      },
    ],
    membershipNote:
      "Membership language here describes support metaphors (messaging, check-ins, refill cadence). Verified prices are not published — PriceTag stays pending.",
    safetyLead:
      "Weight pathways on this site link to illustrative GLP-1 safety stubs. Re-verify with counsel before any real launch. Not medical advice.",
    faqs: [
      {
        id: "wd-f1",
        question: "Will this page tell me how much weight I will lose?",
        answer:
          "No. Outcome projections and clinical claims are intentionally omitted. The weight slider is a layout control only.",
      },
      {
        id: "wd-f2",
        question: "Are medication prices listed here?",
        answer:
          "No. Cost stays pending until Trey supplies a verified schedule. Checkout is a no-charge plan review stub.",
      },
      {
        id: "wd-f3",
        question: "Where do I read safety information?",
        answer:
          "Use the safety band on this page, the GLP-1 ISI stub, or the safety hub. Those pages are illustrative stubs.",
      },
    ],
  },
  "sexual-health": {
    pathwayKicker: "Pathways",
    pathwayTitle: "Compare formats without pressure",
    pathwayDek:
      "Onset, duration, and daily vs on-demand framing — education for browsing this aisle. Original copy only; no branded efficacy claims.",
    pathways: [
      {
        id: "s-ondemand",
        title: "On-demand timing",
        copy: "Cards that emphasize planning around a specific window. Useful for comparing onset tradeoffs in the catalog.",
      },
      {
        id: "s-daily",
        title: "Daily readiness",
        copy: "A daily-format pathway for people who prefer routine over timing. Selection happens later in quiz → visit.",
      },
      {
        id: "s-discreet",
        title: "Discreet delivery storytelling",
        copy: "Packaging and messaging metaphors stay low-key. No pharmacy fulfillment runs from this marketing shell.",
      },
    ],
    expectKicker: "What to expect",
    expectTitle: "Private browsing, then a clear next step",
    expectDek:
      "Start with the sexual-health quiz when you are ready. Help and how-care-works stay linked from every beat.",
    expectations: [
      {
        id: "s-e1",
        title: "Format-first exploration",
        copy: "Scan pathway cards and product options before committing to the quiz.",
      },
      {
        id: "s-e2",
        title: "Quiz → shared visit",
        copy: "One intake funnel shared with other care areas. Browser-local answers only.",
      },
      {
        id: "s-e3",
        title: "No invented drug ISI",
        copy: "This aisle does not attach a GLP-1 safety stub. Use the general safety hub until counsel-approved copy exists.",
      },
    ],
    membershipNote:
      "Membership copy covers discreet support metaphors and refill cadence stubs. Dollar amounts stay unpublished.",
    safetyLead:
      "Sexual-health pages do not reuse weight-care ISI. Open the safety hub for the general notice until aisle-specific stubs are approved.",
    faqs: [
      {
        id: "sd-f1",
        question: "Can I compare onset and duration here?",
        answer:
          "Yes — pathway cards and product metas are structured for that comparison. They are not prescribing guidance.",
      },
      {
        id: "sd-f2",
        question: "Is packaging discreet in this preview?",
        answer:
          "The site tells a discreet-delivery story. Real fulfillment partners are out of scope for this SPA.",
      },
      {
        id: "sd-f3",
        question: "Why is there no drug-specific ISI block?",
        answer:
          "We avoid fabricating FDA labeling. Link through the safety hub until counsel supplies aisle-specific stubs.",
      },
    ],
  },
  hair: {
    pathwayKicker: "Pathways",
    pathwayTitle: "Topical, oral, and combo framing",
    pathwayDek:
      "Soft clinical tone for thinning and density goals. Informational pathways only — no regrowth guarantees or invented timelines.",
    pathways: [
      {
        id: "h-topical",
        title: "Topical-only start",
        copy: "Foam or liquid storytelling for people who want a simpler routine before considering oral support.",
      },
      {
        id: "h-combo",
        title: "Topical + oral combo",
        copy: "Density-kit style cards that describe a combined routine metaphor. Clinician judgment is required in any real program.",
      },
      {
        id: "h-photos",
        title: "Progress photos (optional pattern)",
        copy: "Check-in photography is shown as optional storytelling. This clone does not store clinical images.",
      },
    ],
    expectKicker: "What to expect",
    expectTitle: "Steady routines, honest disclaimers",
    expectDek:
      "Hair care on this site is a marketing shell: quiz, visit funnel, and minoxidil-pathway ISI stubs — not a treatment promise.",
    expectations: [
      {
        id: "h-e1",
        title: "Choose a starting format",
        copy: "Browse topical vs combo cards, then open details or start the hair quiz.",
      },
      {
        id: "h-e2",
        title: "Shared visit next",
        copy: "Hand off into the same visit → coverage → plan review path as other aisles.",
      },
      {
        id: "h-e3",
        title: "Safety stubs nearby",
        copy: "Minoxidil / density ISI stubs are illustrative. Oral and topical forms are not interchangeable in real care.",
      },
    ],
    membershipNote:
      "Membership language covers routine reminders and check-in metaphors. No verified kit pricing on this page.",
    safetyLead:
      "Hair pathways link to illustrative minoxidil / density safety stubs. Incomplete placeholders — not labeling.",
    faqs: [
      {
        id: "hd-f1",
        question: "Do I need progress photos to continue?",
        answer:
          "Not in this clone. Progress photos appear only as optional storytelling for a live product pattern.",
      },
      {
        id: "hd-f2",
        question: "Are oral and topical the same?",
        answer:
          "No. The ISI stub notes they are not interchangeable. This site does not prescribe either form.",
      },
      {
        id: "hd-f3",
        question: "Is women’s hair a separate vertical here?",
        answer:
          "Not yet. Fertility / Daily Health / women’s hair hubs are out of scope for this deepening pass.",
      },
    ],
  },
  skin: {
    pathwayKicker: "Pathways",
    pathwayTitle: "Routines for everyday skin goals",
    pathwayDek:
      "Texture, tone, breakouts, and calm-skin framing with soft peach layouts. Education for browsing — not a dermatology diagnosis.",
    pathways: [
      {
        id: "sk-routine",
        title: "Guided routine builder",
        copy: "A routine-style card for mixing Rx/OTC metaphors. Final plans would require a real clinician later.",
      },
      {
        id: "sk-calm",
        title: "Calm + clarify focus",
        copy: "Kits aimed at redness and texture goals with check-in storytelling. No invented before/after stats.",
      },
      {
        id: "sk-goals",
        title: "Goal-led browsing",
        copy: "Pick texture, tone, or breakout framing, then continue into the skin quiz when ready.",
      },
    ],
    expectKicker: "What to expect",
    expectTitle: "Soft guidance, clear next steps",
    expectDek:
      "Skin landing mirrors public derm-style IA (hero → pathways → options → FAQ → safety → CTA) with original copy.",
    expectations: [
      {
        id: "sk-e1",
        title: "Browse goals first",
        copy: "Pathway cards keep the first scroll educational before product options.",
      },
      {
        id: "sk-e2",
        title: "Quiz when ready",
        copy: "Matching skin quiz hands off into the shared visit funnel.",
      },
      {
        id: "sk-e3",
        title: "General safety hub",
        copy: "No fabricated derm drug ISI yet. Use the safety hub and Help center for notices.",
      },
    ],
    membershipNote:
      "Membership covers routine coaching metaphors and refill stubs. Prices remain pending verification.",
    safetyLead:
      "Skin pages avoid inventing prescription labeling. Link to the safety hub until counsel-approved derm stubs exist.",
    faqs: [
      {
        id: "skd-f1",
        question: "Is this a dermatology diagnosis tool?",
        answer:
          "No. It is a marketing landing with quiz and visit metaphors. Seek a licensed clinician for real skin concerns.",
      },
      {
        id: "skd-f2",
        question: "Are ingredient lists clinical-grade here?",
        answer:
          "Product cards use placeholder education copy. Do not treat them as a full formulary or label.",
      },
      {
        id: "skd-f3",
        question: "Where can I learn more without starting a visit?",
        answer:
          "Open Health guides from the bridge below, or use How care works and the Help center.",
      },
    ],
  },
};

export function getCareLandingDepth(slug: CareArea): CareLandingDepth {
  return careLandingDepth[slug];
}
