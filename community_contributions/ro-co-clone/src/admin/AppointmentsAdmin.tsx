import { useEffect, useState } from "react";
import {
  APPOINTMENT_STORE_KEY,
  CATEGORY_LABEL,
  SAFE_APPT_NOTIFY,
  STATUS_LABEL,
  formatSlotRange,
  listAllAppointments,
  setAppointmentStatus,
  subscribeAppointmentStore,
  type Appointment,
  type AppointmentStatus,
} from "../appointments/appointmentStore";

const STATUS_OPTIONS: Array<"all" | AppointmentStatus> = [
  "all",
  "scheduled",
  "completed",
  "cancelled",
];

export function AppointmentsAdmin() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all");
  const [toast, setToast] = useState<string | null>(null);

  function refresh() {
    setAppointments(listAllAppointments());
  }

  useEffect(() => {
    refresh();
    return subscribeAppointmentStore(refresh);
  }, []);

  function flash(safeCopy: string) {
    setToast(safeCopy);
    window.setTimeout(() => setToast(null), 2800);
  }

  const filtered =
    filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;

  function handleStatus(id: string, status: AppointmentStatus) {
    setAppointmentStatus(id, status);
    refresh();
    // Safe toast — never includes patient medical detail or slot narrative beyond status.
    if (status === "cancelled") flash(SAFE_APPT_NOTIFY.cancelled);
    else if (status === "scheduled") flash(SAFE_APPT_NOTIFY.rescheduled);
    else flash(SAFE_APPT_NOTIFY.booked);
  }

  return (
    <div data-testid="admin-appointments">
      <div className="admin-header">
        <div>
          <h1>Appointments</h1>
          <p>
            Care-team visit sandbox stored in <code>{APPOINTMENT_STORE_KEY}</code> only — non-durable
            demo. Slots use placeholder “Care team” labels (no invented clinicians). Toast flashes
            never include PHI.
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <span>Scheduled</span>
          <strong>{scheduledCount}</strong>
        </div>
        <div className="admin-card">
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
        </div>
        <div className="admin-card">
          <span>Total</span>
          <strong>{appointments.length}</strong>
        </div>
      </div>

      {toast ? (
        <p className="admin-msg-toast" role="status" data-testid="admin-appointments-toast">
          {toast}
        </p>
      ) : null}

      <div className="admin-card admin-appt-shell">
        <div className="admin-msg-filters">
          <label>
            Status
            <select
              value={filter}
              data-testid="admin-appointments-filter"
              onChange={(e) => setFilter(e.target.value as "all" | AppointmentStatus)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All" : STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="admin-msg-hint" data-testid="admin-appointments-empty">
            No appointments in this filter. Patient bookings from{" "}
            <code>/account/appointments</code> appear here in the same browser.
          </p>
        ) : (
          <ul className="admin-appt-list">
            {filtered.map((appt) => (
              <li key={appt.id} className="admin-appt-row" data-testid="admin-appointments-row">
                <div className="admin-appt-main">
                  <strong>{CATEGORY_LABEL[appt.category]}</strong>
                  <span>{formatSlotRange(appt.slotStart, appt.durationMin)}</span>
                  <span className="admin-msg-patient">
                    {appt.patientLabel}
                    <span>{appt.patientKey}</span>
                  </span>
                  <span>
                    {appt.careTeamLabel} · {appt.slotLabel} · Video
                  </span>
                </div>
                <div className="admin-appt-actions">
                  <span
                    className={
                      appt.status === "cancelled"
                        ? "account-chip account-chip-warn"
                        : appt.status === "completed"
                          ? "account-chip account-chip-peach"
                          : "account-chip account-chip-mint"
                    }
                  >
                    {STATUS_LABEL[appt.status]}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    data-testid="admin-appt-mark-scheduled"
                    onClick={() => handleStatus(appt.id, "scheduled")}
                  >
                    Scheduled
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    data-testid="admin-appt-mark-completed"
                    onClick={() => handleStatus(appt.id, "completed")}
                  >
                    Completed
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    data-testid="admin-appt-mark-cancelled"
                    onClick={() => handleStatus(appt.id, "cancelled")}
                  >
                    Cancelled
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
