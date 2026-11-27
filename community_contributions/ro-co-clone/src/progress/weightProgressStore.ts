/**
 * Weight / habits progress shell — browser localStorage only.
 * Not a clinical chart. Never recommends medication doses or invents clinician notes.
 */

export const WEIGHT_PROGRESS_STORE_KEY = "ro-clone-weight-progress-v1";
export const WEIGHT_PROGRESS_CHANGED = "ro-weight-progress-changed";

export type WeightUnit = "lb" | "kg";

/** Canonical store unit is always pounds; UI converts for display. */
export type WeightCheckIn = {
  id: string;
  /** ISO date YYYY-MM-DD (local calendar day). */
  date: string;
  /** Weight in pounds. */
  weightLb: number;
  /** Optional free-text note shown only in this UI — never in toast previews. */
  note?: string;
  /** Optional side-effect tags the patient selected at check-in. */
  sideEffects?: string[];
  createdAt: string;
};

export type HabitDayStub = {
  /** ISO date YYYY-MM-DD. */
  date: string;
  /** Glasses of water logged today (stub, 0–12). */
  hydrationGlasses: number;
  /** Activity minutes logged today (stub). */
  activityMinutes: number;
  proteinGoal: boolean;
  sleepGoal: boolean;
  movementGoal: boolean;
};

export type WeightProgressProfile = {
  /** Starting weight in pounds. */
  startingWeightLb: number | null;
  /** Goal weight in pounds. */
  goalWeightLb: number | null;
  unit: WeightUnit;
  /** ISO when profile goals were last set. */
  updatedAt: string | null;
};

export type WeightProgressStore = {
  version: 1;
  profile: WeightProgressProfile;
  checkIns: WeightCheckIn[];
  habits: HabitDayStub[];
};

/** Safe, non-PHI notification copy for toast previews. */
export const SAFE_PROGRESS_NOTIFY = {
  profileSaved: "Your weight goals were saved on this device.",
  checkInSaved: "Your weekly check-in was saved on this device.",
  habitsSaved: "Today’s habit stubs were updated on this device.",
  unitChanged: "Display units were updated.",
  cleared: "Local progress data on this device was cleared.",
  escalation:
    "If you feel unwell, message support or book a visit. This app does not change medication doses.",
} as const;

/** Side-effect options patients can flag — escalation routes to messaging / appointments only. */
export const SIDE_EFFECT_OPTIONS = [
  { id: "nausea", label: "Nausea" },
  { id: "fatigue", label: "Fatigue" },
  { id: "gi", label: "GI discomfort" },
  { id: "headache", label: "Headache" },
  { id: "injection-site", label: "Injection-site irritation" },
  { id: "other-concerning", label: "Something else concerning" },
] as const;

export type SideEffectId = (typeof SIDE_EFFECT_OPTIONS)[number]["id"];

/** Effects that surface the escalation panel (message / book — never dose advice). */
export const ESCALATION_SIDE_EFFECTS: ReadonlySet<string> = new Set([
  "nausea",
  "gi",
  "other-concerning",
]);

const LB_PER_KG = 2.2046226218;

const EMPTY_STORE: WeightProgressStore = {
  version: 1,
  profile: {
    startingWeightLb: null,
    goalWeightLb: null,
    unit: "lb",
    updatedAt: null,
  },
  checkIns: [],
  habits: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayLocalIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function lbToDisplay(lb: number, unit: WeightUnit): number {
  if (unit === "kg") return Math.round((lb / LB_PER_KG) * 10) / 10;
  return Math.round(lb * 10) / 10;
}

export function displayToLb(value: number, unit: WeightUnit): number {
  if (unit === "kg") return Math.round(value * LB_PER_KG * 10) / 10;
  return Math.round(value * 10) / 10;
}

export function formatWeight(lb: number, unit: WeightUnit): string {
  const v = lbToDisplay(lb, unit);
  return unit === "kg" ? `${v} kg` : `${v} lb`;
}

function emitChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WEIGHT_PROGRESS_CHANGED));
}

function isCheckInShape(value: unknown): value is WeightCheckIn {
  if (!value || typeof value !== "object") return false;
  const c = value as WeightCheckIn;
  return (
    typeof c.id === "string" &&
    typeof c.date === "string" &&
    typeof c.weightLb === "number" &&
    Number.isFinite(c.weightLb) &&
    typeof c.createdAt === "string"
  );
}

function isHabitShape(value: unknown): value is HabitDayStub {
  if (!value || typeof value !== "object") return false;
  const h = value as HabitDayStub;
  return (
    typeof h.date === "string" &&
    typeof h.hydrationGlasses === "number" &&
    typeof h.activityMinutes === "number" &&
    typeof h.proteinGoal === "boolean" &&
    typeof h.sleepGoal === "boolean" &&
    typeof h.movementGoal === "boolean"
  );
}

export function loadWeightProgressStore(): WeightProgressStore {
  try {
    const raw = localStorage.getItem(WEIGHT_PROGRESS_STORE_KEY);
    if (!raw) return structuredClone(EMPTY_STORE);
    const parsed = JSON.parse(raw) as Partial<WeightProgressStore>;
    if (!parsed || parsed.version !== 1) return structuredClone(EMPTY_STORE);
    const profile = parsed.profile;
    return {
      version: 1,
      profile: {
        startingWeightLb:
          typeof profile?.startingWeightLb === "number" ? profile.startingWeightLb : null,
        goalWeightLb: typeof profile?.goalWeightLb === "number" ? profile.goalWeightLb : null,
        unit: profile?.unit === "kg" ? "kg" : "lb",
        updatedAt: typeof profile?.updatedAt === "string" ? profile.updatedAt : null,
      },
      checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns.filter(isCheckInShape) : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits.filter(isHabitShape) : [],
    };
  } catch {
    return structuredClone(EMPTY_STORE);
  }
}

function saveStore(store: WeightProgressStore): WeightProgressStore {
  localStorage.setItem(WEIGHT_PROGRESS_STORE_KEY, JSON.stringify(store));
  emitChanged();
  return store;
}

export function subscribeWeightProgressStore(onChange: () => void): () => void {
  const handler = () => onChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key === WEIGHT_PROGRESS_STORE_KEY) onChange();
  };
  window.addEventListener(WEIGHT_PROGRESS_CHANGED, handler);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(WEIGHT_PROGRESS_CHANGED, handler);
    window.removeEventListener("storage", onStorage);
  };
}

export function setWeightUnit(unit: WeightUnit): WeightProgressStore {
  const store = loadWeightProgressStore();
  store.profile.unit = unit;
  return saveStore(store);
}

export function saveWeightGoals(input: {
  startingWeight: number;
  goalWeight: number;
  unit: WeightUnit;
}): WeightProgressStore {
  const store = loadWeightProgressStore();
  store.profile = {
    startingWeightLb: displayToLb(input.startingWeight, input.unit),
    goalWeightLb: displayToLb(input.goalWeight, input.unit),
    unit: input.unit,
    updatedAt: nowIso(),
  };
  return saveStore(store);
}

export function addWeightCheckIn(input: {
  weight: number;
  unit: WeightUnit;
  date?: string;
  note?: string;
  sideEffects?: string[];
}): WeightProgressStore {
  const store = loadWeightProgressStore();
  const date = input.date ?? todayLocalIso();
  const weightLb = displayToLb(input.weight, input.unit);
  const note = input.note?.trim() || undefined;
  const sideEffects = (input.sideEffects ?? []).filter(Boolean);

  const existingIdx = store.checkIns.findIndex((c) => c.date === date);
  const entry: WeightCheckIn = {
    id: existingIdx >= 0 ? store.checkIns[existingIdx].id : newId("checkin"),
    date,
    weightLb,
    note,
    sideEffects: sideEffects.length ? sideEffects : undefined,
    createdAt: nowIso(),
  };

  if (existingIdx >= 0) {
    store.checkIns[existingIdx] = entry;
  } else {
    store.checkIns.push(entry);
  }
  store.checkIns.sort((a, b) => a.date.localeCompare(b.date));
  return saveStore(store);
}

export function getHabitsForDate(date: string = todayLocalIso()): HabitDayStub {
  const store = loadWeightProgressStore();
  const found = store.habits.find((h) => h.date === date);
  if (found) return { ...found };
  return {
    date,
    hydrationGlasses: 0,
    activityMinutes: 0,
    proteinGoal: false,
    sleepGoal: false,
    movementGoal: false,
  };
}

export function saveHabitsForDate(habits: HabitDayStub): WeightProgressStore {
  const store = loadWeightProgressStore();
  const idx = store.habits.findIndex((h) => h.date === habits.date);
  const next: HabitDayStub = {
    date: habits.date,
    hydrationGlasses: Math.max(0, Math.min(12, Math.round(habits.hydrationGlasses))),
    activityMinutes: Math.max(0, Math.min(600, Math.round(habits.activityMinutes))),
    proteinGoal: Boolean(habits.proteinGoal),
    sleepGoal: Boolean(habits.sleepGoal),
    movementGoal: Boolean(habits.movementGoal),
  };
  if (idx >= 0) store.habits[idx] = next;
  else store.habits.push(next);
  return saveStore(store);
}

export function clearWeightProgressStore(): WeightProgressStore {
  localStorage.removeItem(WEIGHT_PROGRESS_STORE_KEY);
  emitChanged();
  return structuredClone(EMPTY_STORE);
}

export function currentWeightLb(store: WeightProgressStore = loadWeightProgressStore()): number | null {
  if (store.checkIns.length === 0) return store.profile.startingWeightLb;
  return store.checkIns[store.checkIns.length - 1].weightLb;
}

export function weightDeltaLb(store: WeightProgressStore = loadWeightProgressStore()): number | null {
  const start = store.profile.startingWeightLb;
  const current = currentWeightLb(store);
  if (start == null || current == null) return null;
  return Math.round((current - start) * 10) / 10;
}

export function remainingToGoalLb(
  store: WeightProgressStore = loadWeightProgressStore(),
): number | null {
  const goal = store.profile.goalWeightLb;
  const current = currentWeightLb(store);
  if (goal == null || current == null) return null;
  return Math.round((current - goal) * 10) / 10;
}

export function needsEscalation(sideEffects: string[]): boolean {
  return sideEffects.some((id) => ESCALATION_SIDE_EFFECTS.has(id));
}

export function sortedCheckIns(
  store: WeightProgressStore = loadWeightProgressStore(),
): WeightCheckIn[] {
  return [...store.checkIns].sort((a, b) => a.date.localeCompare(b.date));
}
