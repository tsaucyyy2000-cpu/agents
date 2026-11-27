import type { QuizDefinition, QuizStepDef } from "./quizEngine";
import type { CareArea } from "./types";

/** @deprecated Prefer QuizStepDef from quizEngine — kept for gradual import updates. */
export type QuizQuestion = QuizStepDef;
/** @deprecated Prefer QuizDefinition from quizEngine. */
export type QuizTreatment = QuizDefinition;

/**
 * Default per-category questionnaires for the shared quiz engine.
 * Stored in site content so admin can edit without a code deploy.
 * Branching uses showIf — never auto-diagnoses or recommends drugs.
 */
export const defaultQuestionnaires: QuizDefinition[] = [
  {
    slug: "weight-loss",
    name: "Weight care",
    careArea: "weight",
    blurb:
      "Short intake before the shared visit. Sample answers only — no dosing, diagnosis, or eligibility decision.",
    steps: [
      {
        id: "height",
        label: "Height",
        type: "number",
        unit: "in",
        help: "Sample number only — not used for clinical dosing.",
        min: 36,
        max: 96,
      },
      {
        id: "weight",
        label: "Current weight",
        type: "number",
        unit: "lb",
        min: 50,
        max: 700,
      },
      {
        id: "goal",
        label: "Goal weight",
        type: "number",
        unit: "lb",
        help: "Outcomes are not projected on this site.",
        min: 50,
        max: 700,
      },
      {
        id: "conditions",
        label: "Any of these apply?",
        type: "choice",
        options: ["Type 2 diabetes", "High blood pressure", "Thyroid condition", "None of these"],
      },
      {
        id: "conditions_notes",
        label: "Anything else you want a future clinician story to know?",
        type: "text",
        required: false,
        help: "Optional. Do not enter real health data in this demo.",
        showIf: { fieldId: "conditions", notEquals: "None of these" },
      },
      {
        id: "prior",
        label: "Have you used a GLP-1 medication before?",
        type: "choice",
        options: ["No, never", "Yes, currently", "Yes, in the past"],
      },
      {
        id: "prior_notes",
        label: "Optional notes about prior medication experience",
        type: "text",
        required: false,
        help: "Not used to approve or deny care automatically.",
        showIf: { fieldId: "prior", anyOf: ["Yes, currently", "Yes, in the past"] },
      },
    ],
  },
  {
    slug: "hair",
    name: "Hair care",
    careArea: "hair",
    blurb: "Density goals intake. Continues into the shared visit — no treatment recommendation.",
    steps: [
      {
        id: "duration",
        label: "How long have you noticed thinning?",
        type: "choice",
        options: ["Under 6 months", "6–12 months", "Over a year"],
      },
      {
        id: "pattern",
        label: "Where do you notice change most?",
        type: "choice",
        options: ["Temples / hairline", "Crown", "All over", "Patchy"],
      },
      {
        id: "prior",
        label: "Have you used minoxidil before?",
        type: "choice",
        options: ["No", "Yes, still using", "Yes, stopped"],
      },
      {
        id: "why_stopped",
        label: "Why did you stop? (optional)",
        type: "text",
        required: false,
        showIf: { fieldId: "prior", equals: "Yes, stopped" },
      },
    ],
  },
  {
    slug: "sexual-health",
    name: "Sexual health",
    careArea: "sexual-health",
    blurb: "Intake only — no medication-specific ISI and no automatic eligibility outcome.",
    steps: [
      {
        id: "goal",
        label: "What are you hoping to explore?",
        type: "choice",
        options: ["On-demand support", "Daily readiness", "Not sure yet"],
      },
      {
        id: "timing",
        label: "How often is this a priority?",
        type: "choice",
        options: ["Occasionally", "A few times a month", "Most weeks"],
      },
      {
        id: "meds",
        label: "Any medications you want a clinician story to know about?",
        type: "choice",
        options: ["None", "Blood pressure meds", "Other (discuss in visit)", "Prefer not to say"],
        help: "Sample choices only. Do not enter real health data.",
      },
      {
        id: "meds_notes",
        label: "Optional note for the visit (demo storage only)",
        type: "text",
        required: false,
        showIf: { fieldId: "meds", equals: "Other (discuss in visit)" },
      },
    ],
  },
  {
    slug: "skin",
    name: "Skin care",
    careArea: "skin",
    blurb: "Skin intake. Links to the general safety hub — not a drug ISI or diagnosis.",
    steps: [
      {
        id: "focus",
        label: "Primary skin goal?",
        type: "choice",
        options: ["Texture", "Tone", "Breakouts", "Redness / calm"],
      },
      {
        id: "routine",
        label: "Current routine complexity?",
        type: "choice",
        options: ["Bare minimum", "A few steps", "Full routine"],
      },
      {
        id: "sensitivity",
        label: "Sensitive or reactive skin?",
        type: "choice",
        options: ["Yes", "Sometimes", "No"],
      },
      {
        id: "sensitivity_detail",
        label: "What tends to trigger a reaction? (optional)",
        type: "text",
        required: false,
        showIf: { fieldId: "sensitivity", anyOf: ["Yes", "Sometimes"] },
      },
    ],
  },
];

/** Alias used by older call sites. */
export const quizTreatments = defaultQuestionnaires;

export function getQuizTreatment(
  slug: string,
  questionnaires: QuizDefinition[] = defaultQuestionnaires,
): QuizDefinition | undefined {
  return questionnaires.find((item) => item.slug === slug);
}

export function quizSlugForCareArea(area: CareArea): string {
  if (area === "weight") return "weight-loss";
  return area;
}

export function normalizeQuestionnaires(raw: unknown): QuizDefinition[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return structuredClone(defaultQuestionnaires);
  }

  const bySlug = new Map<string, QuizDefinition>();
  for (const item of defaultQuestionnaires) {
    bySlug.set(item.slug, structuredClone(item));
  }

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Partial<QuizDefinition>;
    if (typeof row.slug !== "string" || !row.slug.trim()) continue;
    const base = bySlug.get(row.slug) ?? {
      slug: row.slug,
      name: row.slug,
      careArea: "weight" as CareArea,
      blurb: "",
      steps: [],
    };
    const steps: QuizStepDef[] = Array.isArray(row.steps)
      ? row.steps
          .filter((step): step is QuizStepDef => Boolean(step && typeof step === "object" && step.id))
          .map((step): QuizStepDef => {
            const type: QuizStepDef["type"] =
              step.type === "number" || step.type === "text" ? step.type : "choice";
            return {
              id: String(step.id),
              label: String(step.label ?? step.id),
              help: step.help ? String(step.help) : undefined,
              type,
              options: Array.isArray(step.options)
                ? step.options.map(String).filter(Boolean)
                : undefined,
              unit: step.unit ? String(step.unit) : undefined,
              required: step.required,
              min: typeof step.min === "number" ? step.min : undefined,
              max: typeof step.max === "number" ? step.max : undefined,
              showIf: step.showIf && typeof step.showIf === "object"
                ? {
                    fieldId: String(step.showIf.fieldId ?? ""),
                    equals:
                      step.showIf.equals !== undefined ? String(step.showIf.equals) : undefined,
                    notEquals:
                      step.showIf.notEquals !== undefined
                        ? String(step.showIf.notEquals)
                        : undefined,
                    anyOf: Array.isArray(step.showIf.anyOf)
                      ? step.showIf.anyOf.map(String)
                      : undefined,
                  }
                : undefined,
            };
          })
      : base.steps;

    bySlug.set(row.slug, {
      slug: row.slug,
      name: typeof row.name === "string" && row.name.trim() ? row.name : base.name,
      careArea:
        row.careArea === "sexual-health" ||
        row.careArea === "hair" ||
        row.careArea === "skin" ||
        row.careArea === "weight"
          ? row.careArea
          : base.careArea,
      blurb: typeof row.blurb === "string" ? row.blurb : base.blurb,
      steps: steps.length ? steps : base.steps,
    });
  }

  const ordered: QuizDefinition[] = [];
  for (const item of defaultQuestionnaires) {
    const merged = bySlug.get(item.slug);
    if (merged) {
      ordered.push(merged);
      bySlug.delete(item.slug);
    }
  }
  for (const remaining of bySlug.values()) ordered.push(remaining);
  return ordered;
}
