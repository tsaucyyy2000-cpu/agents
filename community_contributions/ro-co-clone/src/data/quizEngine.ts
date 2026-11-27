import type { CareArea } from "./types";

export type QuizFieldType = "choice" | "number" | "text";

export type QuizCondition = {
  fieldId: string;
  equals?: string;
  notEquals?: string;
  anyOf?: string[];
};

export type QuizStepDef = {
  id: string;
  label: string;
  help?: string;
  type: QuizFieldType;
  options?: string[];
  unit?: string;
  required?: boolean;
  min?: number;
  max?: number;
  /** Show only when the condition matches current answers. */
  showIf?: QuizCondition;
};

export type QuizDefinition = {
  slug: string;
  name: string;
  careArea: CareArea;
  blurb: string;
  steps: QuizStepDef[];
};

export type QuizAnswers = Record<string, string>;

export function conditionMatches(condition: QuizCondition, answers: QuizAnswers): boolean {
  const value = (answers[condition.fieldId] ?? "").trim();
  // Hide branched steps until the dependency field has an answer.
  if (!value) return false;
  if (condition.equals !== undefined) return value === condition.equals;
  if (condition.notEquals !== undefined) return value !== condition.notEquals;
  if (condition.anyOf) return condition.anyOf.includes(value);
  return true;
}

export function isStepVisible(step: QuizStepDef, answers: QuizAnswers): boolean {
  if (!step.showIf) return true;
  return conditionMatches(step.showIf, answers);
}

export function getVisibleSteps(definition: QuizDefinition, answers: QuizAnswers): QuizStepDef[] {
  return definition.steps.filter((step) => isStepVisible(step, answers));
}

export function validateStep(
  step: QuizStepDef,
  answers: QuizAnswers,
): { ok: true } | { ok: false; message: string } {
  const raw = (answers[step.id] ?? "").trim();
  const required = step.required !== false;

  if (!raw) {
    if (!required) return { ok: true };
    return { ok: false, message: "An answer is needed to continue." };
  }

  if (step.type === "number") {
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      return { ok: false, message: "Enter a valid number." };
    }
    if (num <= 0 && (step.min === undefined || step.min > 0)) {
      return { ok: false, message: "Enter a number greater than zero." };
    }
    if (step.min !== undefined && num < step.min) {
      return { ok: false, message: `Enter at least ${step.min}.` };
    }
    if (step.max !== undefined && num > step.max) {
      return { ok: false, message: `Enter at most ${step.max}.` };
    }
  }

  if (step.type === "choice" && step.options?.length) {
    if (!step.options.includes(raw)) {
      return { ok: false, message: "Choose one of the listed options." };
    }
  }

  return { ok: true };
}

export function validateVisibleAnswers(
  definition: QuizDefinition,
  answers: QuizAnswers,
): { ok: true } | { ok: false; stepId: string; message: string } {
  for (const step of getVisibleSteps(definition, answers)) {
    const result = validateStep(step, answers);
    if (!result.ok) return { ok: false, stepId: step.id, message: result.message };
  }
  return { ok: true };
}

/** Non-PHI demo storage key — answers stay in this browser only. */
export const QUIZ_RESUME_KEY = "ro-clone-quiz-engine-v1";

export type QuizResumeState = {
  answers: QuizAnswers;
  stepId: string | null;
  phase: "questions" | "review";
  updatedAt: string;
};

export function readQuizResume(slug: string): QuizResumeState | null {
  try {
    const raw = window.localStorage.getItem(QUIZ_RESUME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, QuizResumeState>;
    const entry = parsed[slug];
    if (!entry || typeof entry !== "object") return null;
    return {
      answers: entry.answers && typeof entry.answers === "object" ? entry.answers : {},
      stepId: typeof entry.stepId === "string" ? entry.stepId : null,
      phase: entry.phase === "review" ? "review" : "questions",
      updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function writeQuizResume(slug: string, state: Omit<QuizResumeState, "updatedAt">) {
  try {
    const raw = window.localStorage.getItem(QUIZ_RESUME_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, QuizResumeState>) : {};
    parsed[slug] = { ...state, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(QUIZ_RESUME_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore quota */
  }
}

export function clearQuizResume(slug: string) {
  try {
    const raw = window.localStorage.getItem(QUIZ_RESUME_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, QuizResumeState>;
    delete parsed[slug];
    window.localStorage.setItem(QUIZ_RESUME_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}
