/**
 * Appointment booking shell — browser localStorage only.
 * Fake availability + book/reschedule/cancel. No Zoom/Twilio, no real calendar,
 * no invented licensed clinician names. Toast previews never include PHI.
 */

export const APPOINTMENT_STORE_KEY = "ro-clone-appointments-v1";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export type AppointmentCategory =
  | "weight"
  | "sexual-health"
  | "hair"
  | "skin"
  | "general";

export type AppointmentModality = "video";

export type Appointment = {
  id: string;
  patientKey: string;
  patientLabel: string;
  category: AppointmentCategory;
  /** ISO datetime of slot start (UTC). */
  slotStart: string;
  durationMin: number;
  /** Placeholder care-team label — never a real clinician name. */
  careTeamLabel: string;
  /** Placeholder slot label (e.g. "Slot A"). */
  slotLabel: string;
  status: AppointmentStatus;
  modality: AppointmentModality;
  /** Local reminder stub — does not send email/SMS/push. */
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentStore = {
  version: 1;
  appointments: Appointment[];
};

export type AvailabilitySlot = {
  /** ISO datetime start. */
  start: string;
  durationMin: number;
  slotLabel: string;
  careTeamLabel: string;
};

/** Safe, non-PHI notification copy for toast / email-style previews. */
export const SAFE_APPT_NOTIFY = {
  booked: "Your visit was booked.",
  rescheduled: "Your visit was rescheduled.",
  cancelled: "Your visit was cancelled.",
  reminderOn: "Visit reminder preference saved on this device.",
  reminderOff: "Visit reminder preference cleared on this device.",
  videoPending: "Video consult integration is pending.",
} as const;

export const CATEGORY_OPTIONS: {
  id: AppointmentCategory;
  label: string;
  hint: string;
}[] = [
  { id: "general", label: "General check-in", hint: "Care team placeholder slot" },
  { id: "weight", label: "Weight care", hint: "Pathway follow-up metaphor" },
  { id: "sexual-health", label: "Sexual health", hint: "Pathway follow-up metaphor" },
  { id: "hair", label: "Hair care", hint: "Pathway follow-up metaphor" },
  { id: "skin", label: "Skin care", hint: "Pathway follow-up metaphor" },
];

export const CATEGORY_LABEL: Record<AppointmentCategory, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.id, c.label]),
) as Record<AppointmentCategory, string>;

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const EMPTY_STORE: AppointmentStore = { version: 1, appointments: [] };

const SLOT_HOURS = [9, 10, 11, 13, 14, 15, 16];
const SLOT_LABELS = ["Slot A", "Slot B", "Slot C", "Slot D", "Slot E", "Slot F", "Slot G"];
const DURATION_MIN = 20;

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isAppointmentShape(value: unknown): value is Appointment {
  if (!value || typeof value !== "object") return false;
  const a = value as Appointment;
  return (
    typeof a.id === "string" &&
    typeof a.patientKey === "string" &&
    typeof a.patientLabel === "string" &&
    typeof a.category === "string" &&
    typeof a.slotStart === "string" &&
    typeof a.durationMin === "number" &&
    typeof a.careTeamLabel === "string" &&
    typeof a.slotLabel === "string" &&
    (a.status === "scheduled" || a.status === "completed" || a.status === "cancelled") &&
    a.modality === "video" &&
    typeof a.reminderEnabled === "boolean" &&
    typeof a.createdAt === "string" &&
    typeof a.updatedAt === "string"
  );
}

export function loadAppointmentStore(): AppointmentStore {
  try {
    const raw = localStorage.getItem(APPOINTMENT_STORE_KEY);
    if (!raw) return { ...EMPTY_STORE, appointments: [] };
    const parsed = JSON.parse(raw) as Partial<AppointmentStore>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.appointments)) {
      return { ...EMPTY_STORE, appointments: [] };
    }
    return {
      version: 1,
      appointments: parsed.appointments.filter(isAppointmentShape),
    };
  } catch {
    return { ...EMPTY_STORE, appointments: [] };
  }
}

export function saveAppointmentStore(store: AppointmentStore): void {
  localStorage.setItem(APPOINTMENT_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("ro-appointment-store-changed"));
}

export function subscribeAppointmentStore(onChange: () => void): () => void {
  const handler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === APPOINTMENT_STORE_KEY || e.key === null) onChange();
  };
  window.addEventListener("ro-appointment-store-changed", handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("ro-appointment-store-changed", handler);
    window.removeEventListener("storage", storageHandler);
  };
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Deterministic fake availability for a care category over the next `dayCount` weekdays.
 * Skips weekends. Excludes slots already held by scheduled appointments (any patient).
 * Care team labels stay generic — never invent licensed clinician names.
 */
export function generateAvailability(options: {
  category: AppointmentCategory;
  dayCount?: number;
  from?: Date;
}): AvailabilitySlot[] {
  const dayCount = options.dayCount ?? 10;
  const from = startOfLocalDay(options.from ?? new Date());
  const booked = new Set(
    loadAppointmentStore()
      .appointments.filter((a) => a.status === "scheduled")
      .map((a) => a.slotStart),
  );

  const slots: AvailabilitySlot[] = [];
  let dayOffset = 1; // start tomorrow
  let daysCollected = 0;

  while (daysCollected < dayCount && dayOffset < dayCount + 14) {
    const day = addDays(from, dayOffset);
    dayOffset += 1;
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue;
    daysCollected += 1;

    // Slight category-based stagger so calendars look different without randomness.
    const stagger = options.category.length % 3;
    SLOT_HOURS.forEach((hour, idx) => {
      if ((idx + stagger) % 4 === 0) return; // leave some gaps
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);
      const iso = start.toISOString();
      if (booked.has(iso)) return;
      slots.push({
        start: iso,
        durationMin: DURATION_MIN,
        slotLabel: SLOT_LABELS[idx % SLOT_LABELS.length],
        careTeamLabel: "Care team",
      });
    });
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

/** Group availability slots by local calendar day key (YYYY-MM-DD). */
export function groupSlotsByDay(slots: AvailabilitySlot[]): Map<string, AvailabilitySlot[]> {
  const map = new Map<string, AvailabilitySlot[]>();
  for (const slot of slots) {
    const key = localDayKey(slot.start);
    const list = map.get(key) ?? [];
    list.push(slot);
    map.set(key, list);
  }
  return map;
}

export function localDayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatSlotDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSlotRange(iso: string, durationMin: number): string {
  const start = new Date(iso);
  const end = new Date(start.getTime() + durationMin * 60_000);
  return `${formatSlotDay(iso)} · ${formatSlotTime(iso)}–${end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function listAppointmentsForPatient(patientKey: string): Appointment[] {
  const key = patientKey.trim().toLowerCase();
  return loadAppointmentStore()
    .appointments.filter((a) => a.patientKey.toLowerCase() === key)
    .sort((a, b) => a.slotStart.localeCompare(b.slotStart));
}

export function listAllAppointments(): Appointment[] {
  return [...loadAppointmentStore().appointments].sort((a, b) =>
    a.slotStart.localeCompare(b.slotStart),
  );
}

export function getAppointment(id: string): Appointment | undefined {
  return loadAppointmentStore().appointments.find((a) => a.id === id);
}

export function partitionAppointments(list: Appointment[]): {
  upcoming: Appointment[];
  past: Appointment[];
} {
  const now = Date.now();
  const upcoming: Appointment[] = [];
  const past: Appointment[] = [];
  for (const a of list) {
    const start = new Date(a.slotStart).getTime();
    if (a.status === "cancelled" || a.status === "completed" || start < now) {
      past.push(a);
    } else {
      upcoming.push(a);
    }
  }
  upcoming.sort((a, b) => a.slotStart.localeCompare(b.slotStart));
  past.sort((a, b) => b.slotStart.localeCompare(a.slotStart));
  return { upcoming, past };
}

export type BookAppointmentInput = {
  patientKey: string;
  patientLabel: string;
  category: AppointmentCategory;
  slot: AvailabilitySlot;
  reminderEnabled?: boolean;
};

export function bookAppointment(input: BookAppointmentInput): Appointment {
  const createdAt = nowIso();
  const appointment: Appointment = {
    id: newId("appt"),
    patientKey: input.patientKey.trim(),
    patientLabel: input.patientLabel.trim() || input.patientKey.trim(),
    category: input.category,
    slotStart: input.slot.start,
    durationMin: input.slot.durationMin,
    careTeamLabel: input.slot.careTeamLabel || "Care team",
    slotLabel: input.slot.slotLabel,
    status: "scheduled",
    modality: "video",
    reminderEnabled: Boolean(input.reminderEnabled),
    createdAt,
    updatedAt: createdAt,
  };
  const store = loadAppointmentStore();
  store.appointments.unshift(appointment);
  saveAppointmentStore(store);
  return appointment;
}

export function rescheduleAppointment(
  id: string,
  slot: AvailabilitySlot,
): Appointment | undefined {
  const store = loadAppointmentStore();
  const idx = store.appointments.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  const current = store.appointments[idx];
  if (current.status === "cancelled") return undefined;
  const updated: Appointment = {
    ...current,
    slotStart: slot.start,
    durationMin: slot.durationMin,
    slotLabel: slot.slotLabel,
    careTeamLabel: slot.careTeamLabel || "Care team",
    status: "scheduled",
    updatedAt: nowIso(),
  };
  store.appointments[idx] = updated;
  saveAppointmentStore(store);
  return updated;
}

export function cancelAppointment(id: string): Appointment | undefined {
  const store = loadAppointmentStore();
  const idx = store.appointments.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  const updated: Appointment = {
    ...store.appointments[idx],
    status: "cancelled",
    updatedAt: nowIso(),
  };
  store.appointments[idx] = updated;
  saveAppointmentStore(store);
  return updated;
}

export function setAppointmentReminder(
  id: string,
  reminderEnabled: boolean,
): Appointment | undefined {
  const store = loadAppointmentStore();
  const idx = store.appointments.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  const updated: Appointment = {
    ...store.appointments[idx],
    reminderEnabled,
    updatedAt: nowIso(),
  };
  store.appointments[idx] = updated;
  saveAppointmentStore(store);
  return updated;
}

export function setAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Appointment | undefined {
  const store = loadAppointmentStore();
  const idx = store.appointments.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  const updated: Appointment = {
    ...store.appointments[idx],
    status,
    updatedAt: nowIso(),
  };
  store.appointments[idx] = updated;
  saveAppointmentStore(store);
  return updated;
}
