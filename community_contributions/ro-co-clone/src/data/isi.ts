/**
 * Illustrative ISI stubs for layout review only.
 * Re-verify with counsel/clinicians before any real launch — not FDA labeling.
 */

export type IsiSection = {
  id: string;
  heading: string;
  body: string[];
  bullets?: string[];
};

export type IsiDocument = {
  slug: string;
  title: string;
  appliesTo: string;
  sections: IsiSection[];
};

export const isiDocuments: IsiDocument[] = [
  {
    slug: "glp1",
    title: "GLP-1 pathway — important safety information ",
    appliesTo: "Weekly GLP-1 and related weight-care products",
    sections: [
      {
        id: "boxed",
        heading: "Boxed warning (illustrative)",
        body: [
          "Placeholder: real GLP-1 labels may include a boxed warning about thyroid C-cell tumors observed in rodents. This text is incomplete and is not labeling.",
        ],
        bullets: [
          "Do not use this preview to decide whether a medication is appropriate.",
          "A licensed clinician reviews contraindications for every real patient.",
        ],
      },
      {
        id: "who",
        heading: "Who should not use (stub)",
        body: [
          "Illustrative list only — replace with reviewed content before launch.",
        ],
        bullets: [
          "Personal or family history of medullary thyroid carcinoma (placeholder)",
          "Multiple Endocrine Neoplasia syndrome type 2 (placeholder)",
          "Known serious hypersensitivity to the medication (placeholder)",
        ],
      },
      {
        id: "warnings",
        heading: "Warnings and precautions (stub)",
        body: [
          "Live labels discuss pancreatitis, gallbladder disease, hypoglycemia risk with certain other drugs, acute kidney injury, diabetic retinopathy complications, increased heart rate, suicidal ideation monitoring, and aspiration risk with anesthesia — among other topics.",
        ],
        bullets: [
          "Seek emergency care for severe allergic reactions or thoughts of self-harm.",
          "Tell a clinician about pregnancy plans, thyroid history, pancreatitis history, and other medications.",
        ],
      },
      {
        id: "pregnancy",
        heading: "Pregnancy and breastfeeding (stub)",
        body: [
          "Placeholder: discuss pregnancy, planning pregnancy, and breastfeeding with a clinician. This site does not give reproductive guidance.",
        ],
      },
      {
        id: "effects",
        heading: "Common side effects (stub)",
        body: [
          "Illustrative examples often discussed for this class include nausea, vomiting, diarrhea, constipation, and decreased appetite. Frequency and severity vary; this list is incomplete.",
        ],
      },
      {
        id: "compounded",
        heading: "Compounded formulations (stub)",
        body: [
          "Some marketing sites discuss compounded products. This site does not endorse compounding. Official labeling and pharmacy sourcing rules are out of scope here.",
        ],
      },
    ],
  },
  {
    slug: "minoxidil",
    title: "Minoxidil / density pathway — important safety information ",
    appliesTo: "Hair density kit and topical foam products",
    sections: [
      {
        id: "who",
        heading: "Who should not use (stub)",
        body: [
          "Illustrative only. Real topical and oral minoxidil products have distinct labels. Replace before launch.",
        ],
        bullets: [
          "Known allergy to minoxidil or inactive ingredients (placeholder)",
          "Certain scalp conditions — clinician judgment required (placeholder)",
        ],
      },
      {
        id: "warnings",
        heading: "Warnings (stub)",
        body: [
          "Live labeling may discuss unwanted facial/body hair, scalp irritation, chest pain, rapid heartbeat, dizziness, sudden weight gain, or swelling of hands/feet. This stub is incomplete.",
        ],
      },
      {
        id: "oral",
        heading: "Oral vs topical (stub)",
        body: [
          "Oral and topical forms are not interchangeable. Dosing, monitoring, and contraindications differ. This site does not prescribe either form.",
        ],
      },
      {
        id: "pregnancy",
        heading: "Pregnancy and breastfeeding (stub)",
        body: [
          "Placeholder reproductive guidance only — discuss with a clinician before any real use.",
        ],
      },
      {
        id: "effects",
        heading: "Common effects (stub)",
        body: [
          "Illustrative: scalp itching or dryness (topical), initial shedding for some users. Incomplete list for layout review.",
        ],
      },
    ],
  },
];

export function getIsi(slug: string): IsiDocument | undefined {
  return isiDocuments.find((doc) => doc.slug === slug);
}

/** Map product / care area → ISI slug. Omit when no reviewed stub exists. */
export function isiSlugForProduct(productId: string, category: string): string | null {
  if (productId === "weekly-glp1" || productId === "oral-option" || category === "weight") {
    return "glp1";
  }
  if (productId === "density-kit" || productId === "topical-foam" || category === "hair") {
    return "minoxidil";
  }
  // Do not reuse GLP-1 ISI for sexual-health / skin / mental-health.
  return null;
}

export function isiSlugForQuiz(quizSlug: string): string | null {
  if (quizSlug === "weight-loss") return "glp1";
  if (quizSlug === "hair") return "minoxidil";
  return null;
}
