import { useEffect, useMemo, useState } from "react";
import {
  APPOINTMENT_STORE_KEY,
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  SAFE_APPT_NOTIFY,
  STATUS_LABEL,
  bookAppointment,
  cancelAppointment,
  formatSlotRange,
  formatSlotTime,
  generateAvailability,
  groupSlotsByDay,
  listAppointmentsForPatient,
  partitionAppointments,
  rescheduleAppointment,
  setAppointmentReminder,
  subscribeAppointmentStore,
  type Appointment,
  type AppointmentCategory,
  type AvailabilitySlot,
} from "../appointments/appointmentStore";

type AccountAppointmentsProps = {
  patientKey: string;
  patientLabel: string;
  preview?: boolean;
};

type Mode = "list" | "book" | "reschedule";

function statusChipClass(status: Appointment["status"]): string {
  if (status === "cancelled") return "account-chip account-chip-warn";
  if (status === "completed") return "account-chip account-chip-peach";
  return "account-chip account-chip-mint";
}

export function AccountAppointments({
  patientKey,
  patientLabel,
  preview = false,
}: AccountAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mode, setMode] = useState<Mode>("list");
  const [category, setCategory] = useState<AppointmentCategory>("general");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [reminderOnBook, setReminderOnBook] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  function refresh() {
    setAppointments(listAppointmentsForPatient(patientKey));
  }

  useEffect(() => {
    refresh();
    return subscribeAppointmentStore(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh closes over patientKey
  }, [patientKey]);

  function flash(safeCopy: string) {
    setToast(safeCopy);
    window.setTimeout(() => setToast(null), 2800);
  }

  const { upcoming, past } = useMemo(
    () => partitionAppointments(appointments),
    [appointments],
  );

  const availability = useMemo(
    () => (mode === "list" ? [] : generateAvailability({ category })),
    [mode, category, appointments],
  );

  const byDay = useMemo(() => groupSlotsByDay(availability), [availability]);

  function openBook() {
    setMode("book");
    setCategory("general");
    setSelectedSlot(null);
    setReminderOnBook(false);
    setRescheduleId(null);
    setConfirmCancelId(null);
  }

  function openReschedule(appt: Appointment) {
    setMode("reschedule");
    setCategory(appt.category);
    setSelectedSlot(null);
    setRescheduleId(appt.id);
    setConfirmCancelId(null);
  }

  function backToList() {
    setMode("list");
    setSelectedSlot(null);
    setRescheduleId(null);
  }

  function handleConfirmBook() {
    if (!selectedSlot) return;
    bookAppointment({
      patientKey,
      patientLabel,
      category,
      slot: selectedSlot,
      reminderEnabled: reminderOnBook,
    });
    backToList();
    refresh();
    flash(SAFE_APPT_NOTIFY.booked);
  }

  function handleConfirmReschedule() {
    if (!selectedSlot || !rescheduleId) return;
    rescheduleAppointment(rescheduleId, selectedSlot);
    backToList();
    refresh();
    flash(SAFE_APPT_NOTIFY.rescheduled);
  }

  function handleCancel(id: string) {
    cancelAppointment(id);
    setConfirmCancelId(null);
    refresh();
    flash(SAFE_APPT_NOTIFY.cancelled);
  }

  function handleReminderToggle(appt: Appointment) {
    const next = !appt.reminderEnabled;
    setAppointmentReminder(appt.id, next);
    refresh();
    flash(next ? SAFE_APPT_NOTIFY.reminderOn : SAFE_APPT_NOTIFY.reminderOff);
  }

  function handleVideoCta() {
    flash(SAFE_APPT_NOTIFY.videoPending);
  }

  return (
    <div className="account-section" data-testid="account-appointments">
      <header className="account-section-head">
        <p className="section-kicker">Appointments</p>
        <h2>Visit scheduling</h2>
        <p>
          Book, reschedule, or cancel a placeholder care-team visit. Availability is a{" "}
          <strong>local fake calendar</strong> stored in <code>{APPOINTMENT_STORE_KEY}</code> — not
          a real clinician schedule, Zoom, or Twilio. Slot labels stay generic (“Care team · Slot
          A”). Toast previews never include medical detail.
          {preview ? " Preview mode writes to this browser only." : null}
        </p>
      </header>

      <div className="account-chip-row" aria-label="Appointments shell labels">
        <span className="account-chip account-chip-mint">localStorage · sandbox</span>
        <span className="account-chip account-chip-peach">No PHI in notifications</span>
        <span className="account-chip account-chip-warn">Video integration pending</span>
      </div>

      {toast ? (
        <p className="msg-toast" role="status" data-testid="appointments-toast">
          {toast}
        </p>
      ) : null}

      {mode === "list" ? (
        <>
          <div className="appt-list-toolbar">
            <button
              type="button"
              className="btn btn-primary"
              data-testid="appointments-book-open"
              onClick={openBook}
            >
              Book a visit
            </button>
          </div>

          <section className="account-card" data-testid="appointments-upcoming">
            <h3>Upcoming</h3>
            {upcoming.length === 0 ? (
              <div className="account-activity-empty" data-testid="appointments-upcoming-empty">
                <p className="account-empty-kicker">No upcoming visits</p>
                <p>
                  Pick a care category and a Care team placeholder slot when you are ready. Nothing
                  here syncs to a clinic calendar yet.
                </p>
              </div>
            ) : (
              <ul className="appt-card-list">
                {upcoming.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appt={appt}
                    confirmCancelId={confirmCancelId}
                    onReschedule={() => openReschedule(appt)}
                    onAskCancel={() => setConfirmCancelId(appt.id)}
                    onConfirmCancel={() => handleCancel(appt.id)}
                    onDismissCancel={() => setConfirmCancelId(null)}
                    onReminder={() => handleReminderToggle(appt)}
                    onVideo={handleVideoCta}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="account-card" data-testid="appointments-past">
            <h3>Past & cancelled</h3>
            {past.length === 0 ? (
              <p className="account-card-lede" data-testid="appointments-past-empty">
                Completed and cancelled visits will list here after you book and change status in
                this browser.
              </p>
            ) : (
              <ul className="appt-card-list">
                {past.map((appt) => (
                  <li key={appt.id} className="appt-card appt-card-past" data-testid="appointments-past-item">
                    <div className="appt-card-main">
                      <strong>{CATEGORY_LABEL[appt.category]}</strong>
                      <span>{formatSlotRange(appt.slotStart, appt.durationMin)}</span>
                      <span>
                        {appt.careTeamLabel} · {appt.slotLabel}
                      </span>
                    </div>
                    <span className={statusChipClass(appt.status)}>{STATUS_LABEL[appt.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <BookingPanel
          mode={mode}
          category={category}
          onCategory={setCategory}
          byDay={byDay}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          reminderOnBook={reminderOnBook}
          onReminderOnBook={setReminderOnBook}
          onBack={backToList}
          onConfirm={mode === "book" ? handleConfirmBook : handleConfirmReschedule}
        />
      )}

      <div className="callout">
        <p>
          <strong>Sandbox note:</strong> Reminders are preference stubs only — no email, SMS, or
          push. Video consult stays gated with an “Integration pending” CTA. Do not invent licensed
          provider names; durable scheduling needs a future backend.
        </p>
      </div>
    </div>
  );
}

function AppointmentRow({
  appt,
  confirmCancelId,
  onReschedule,
  onAskCancel,
  onConfirmCancel,
  onDismissCancel,
  onReminder,
  onVideo,
}: {
  appt: Appointment;
  confirmCancelId: string | null;
  onReschedule: () => void;
  onAskCancel: () => void;
  onConfirmCancel: () => void;
  onDismissCancel: () => void;
  onReminder: () => void;
  onVideo: () => void;
}) {
  const cancelling = confirmCancelId === appt.id;
  return (
    <li className="appt-card" data-testid="appointments-upcoming-item">
      <div className="appt-card-main">
        <strong>{CATEGORY_LABEL[appt.category]}</strong>
        <span>{formatSlotRange(appt.slotStart, appt.durationMin)}</span>
        <span>
          {appt.careTeamLabel} · {appt.slotLabel} · Video
        </span>
      </div>
      <div className="appt-card-actions">
        <span className={statusChipClass(appt.status)}>{STATUS_LABEL[appt.status]}</span>
        <button
          type="button"
          className="btn btn-ghost"
          data-testid="appointments-video-cta"
          onClick={onVideo}
        >
          Join video · Integration pending
        </button>
        <label className="appt-reminder-toggle">
          <input
            type="checkbox"
            checked={appt.reminderEnabled}
            data-testid="appointments-reminder-toggle"
            onChange={onReminder}
          />
          Reminder stub
        </label>
        <button
          type="button"
          className="btn btn-ghost"
          data-testid="appointments-reschedule"
          onClick={onReschedule}
        >
          Reschedule
        </button>
        {cancelling ? (
          <div className="appt-cancel-confirm" data-testid="appointments-cancel-confirm">
            <span>Cancel this visit?</span>
            <button
              type="button"
              className="btn btn-primary"
              data-testid="appointments-cancel-yes"
              onClick={onConfirmCancel}
            >
              Yes, cancel
            </button>
            <button type="button" className="btn btn-ghost" onClick={onDismissCancel}>
              Keep
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-ghost"
            data-testid="appointments-cancel"
            onClick={onAskCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </li>
  );
}

function BookingPanel({
  mode,
  category,
  onCategory,
  byDay,
  selectedSlot,
  onSelectSlot,
  reminderOnBook,
  onReminderOnBook,
  onBack,
  onConfirm,
}: {
  mode: "book" | "reschedule";
  category: AppointmentCategory;
  onCategory: (c: AppointmentCategory) => void;
  byDay: Map<string, AvailabilitySlot[]>;
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (s: AvailabilitySlot | null) => void;
  reminderOnBook: boolean;
  onReminderOnBook: (v: boolean) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const days = [...byDay.entries()];

  return (
    <section
      className="account-card appt-booking"
      data-testid={mode === "book" ? "appointments-book-panel" : "appointments-reschedule-panel"}
    >
      <div className="appt-booking-head">
        <h3>{mode === "book" ? "Book a visit" : "Reschedule visit"}</h3>
        <button type="button" className="btn btn-ghost" data-testid="appointments-book-back" onClick={onBack}>
          Back to list
        </button>
      </div>

      <fieldset className="appt-category-fieldset">
        <legend>Care category</legend>
        <div className="appt-category-grid" role="list">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="listitem"
              className={
                category === opt.id ? "appt-category-btn is-active" : "appt-category-btn"
              }
              data-testid={`appointments-category-${opt.id}`}
              aria-pressed={category === opt.id}
              onClick={() => {
                onCategory(opt.id);
                onSelectSlot(null);
              }}
            >
              <strong>{opt.label}</strong>
              <span>{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="appt-calendar" data-testid="appointments-calendar">
        <p className="appt-calendar-lede">
          Availability calendar (fake) · Care team placeholder slots · {days.length} weekdays ahead
        </p>
        {days.length === 0 ? (
          <p className="account-card-lede">No open slots for this category right now.</p>
        ) : (
          <div className="appt-day-grid">
            {days.map(([dayKey, slots]) => (
              <div key={dayKey} className="appt-day-col" data-testid="appointments-day-col">
                <h4>
                  {new Date(slots[0].start).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </h4>
                <ul>
                  {slots.map((slot) => {
                    const active = selectedSlot?.start === slot.start;
                    return (
                      <li key={slot.start}>
                        <button
                          type="button"
                          className={active ? "appt-slot-btn is-active" : "appt-slot-btn"}
                          data-testid="appointments-slot"
                          aria-pressed={active}
                          onClick={() => onSelectSlot(slot)}
                        >
                          <span>{formatSlotTime(slot.start)}</span>
                          <em>
                            {slot.careTeamLabel} · {slot.slotLabel}
                          </em>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSlot ? (
        <div className="appt-confirm" data-testid="appointments-confirm">
          <p>
            <strong>Selected:</strong> {CATEGORY_LABEL[category]} ·{" "}
            {formatSlotRange(selectedSlot.start, selectedSlot.durationMin)} ·{" "}
            {selectedSlot.careTeamLabel} · {selectedSlot.slotLabel}
          </p>
          {mode === "book" ? (
            <label className="appt-reminder-toggle">
              <input
                type="checkbox"
                checked={reminderOnBook}
                data-testid="appointments-book-reminder"
                onChange={(e) => onReminderOnBook(e.target.checked)}
              />
              Enable reminder stub (local only — no email/SMS)
            </label>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            data-testid="appointments-confirm-btn"
            onClick={onConfirm}
          >
            {mode === "book" ? "Confirm booking" : "Confirm reschedule"}
          </button>
        </div>
      ) : (
        <p className="account-card-lede">Select a Care team slot to continue.</p>
      )}
    </section>
  );
}
