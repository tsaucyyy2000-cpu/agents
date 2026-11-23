import type { CareArea } from "./types";

export type QuizQuestion = {
  id: string;
  label: string;
  help?: string;
  type: "choice" | "number" | "text";
  options?: string[];
  unit?: string;
};

export type QuizTreatment = {
  slug: string;
  name: string;
  careArea: CareArea;
  blurb: string;
  questions: QuizQuestion[];
};

export const quizTreatments: QuizTreatment[] = [
  {
    slug: "weight-loss",
    name: "Weight care",
    careArea: "weight",
    blurb: "Short intake questions before the existing visit flow. Fictional answers only.",
    questions: [
      {
        id: "height",
        label: "Height",
        type: "number",
        unit: "in",
        help: "Sample number only — not used for clinical dosing.",
      },
      {
        id: "weight",
        label: "Current weight",
        type: "number",
        unit: "lb",
      },
      {
        id: "goal",
        label: "Goal weight",
        type: "number",
        unit: "lb",
        help: "Outcomes are not projected in this site.",
      },
      {
        id: "conditions",
        label: "Any of these apply?",
        type: "choice",
        options: ["Type 2 diabetes", "High blood pressure", "Thyroid condition", "None of these"],
      },
      {
        id: "prior",
        label: "Have you used a GLP-1 medication before?",
        type: "choice",
        options: ["No, never", "Yes, currently", "Yes, in the past"],
      },
    ],
  },
  {
    slug: "hair",
    name: "Hair care",
    careArea: "hair",
    blurb: "Questions for density goals. Continues into the shared visit flow.",
    questions: [
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
    ],
  },
  {
    slug: "sexual-health",
    name: "Sexual health",
    careArea: "sexual-health",
    blurb: "Intake only — no medication-specific ISI is attached to this quiz.",
    questions: [
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
    ],
  },
  {
    slug: "skin",
    name: "Skin care",
    careArea: "skin",
    blurb: "Skin intake. Links to the general safety hub — not a drug ISI.",
    questions: [
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
    ],
  },
];

export function getQuizTreatment(slug: string): QuizTreatment | undefined {
  return quizTreatments.find((item) => item.slug === slug);
}

export function quizSlugForCareArea(area: CareArea): string {
  if (area === "weight") return "weight-loss";
  return area;
}
