import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  APPOINTMENT_STORE_KEY,
  CATEGORY_LABEL,
  STATUS_LABEL,
  formatSlotRange,
  listAllAppointments,
  subscribeAppointmentStore,
  type Appointment,
} from "../appointments/appointmentStore";

/**
 * Provider-facing appointment list — reads the shared booking sandbox from DB-42.
 * No video join, no clinician impersonation; status edits stay on the admin queue.
 */
export function ProviderAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const refresh = () => setAppointments(listAllAppointments());
    refresh();
    return subscribeAppointmentStore(refresh);
  }, []);

  const scheduled = appointments.filter((a) => a.status === "scheduled");
  const other = appointments.filter((a) => a.status !== "scheduled");

  return (
    <div data-testid="provider-appointments" className="provider-appointments-stub">
      <div className="admin-header">
        <div>
          <h1>Appointments</h1>
          <p>
            Read-only view of the local booking sandbox (<code>{APPOINTMENT_STORE_KEY}</code>).
            Patients book at <Link to="/account/appointments">/account/appointments</Link>. Staff
            status tools stay on the admin queue — no video consult and no clinician names invented
            here.
          </p>
        </div>
        <Link className="btn btn-primary" to="/admin/appointments">
          Open admin appointments
        </Link>
      </div>

      <div className="admin-panel">
        <h2>Scheduled ({scheduled.length})</h2>
        {scheduled.length === 0 ? (
          <p className="provider-empty">
            No scheduled visits in this browser yet. Book a Care team slot from the patient
            appointments shell, then return here — this portal does not invent calendars.
          </p>
        ) : (
          <div className="provider-thread-list">
            {scheduled.map((appt) => (
              <Link
                key={appt.id}
                className="provider-thread-card"
                to="/admin/appointments"
                data-testid={`provider-appt-${appt.id}`}
              >
                <strong>
                  {CATEGORY_LABEL[appt.category]} · {appt.slotLabel}
                </strong>
                <span>
                  {appt.patientLabel} · {formatSlotRange(appt.slotStart, appt.durationMin)} ·{" "}
                  {STATUS_LABEL[appt.status]} · {appt.careTeamLabel}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {other.length > 0 ? (
        <div className="admin-panel">
          <h2>Other statuses ({other.length})</h2>
          <div className="provider-thread-list">
            {other.map((appt) => (
              <div key={appt.id} className="provider-thread-card">
                <strong>
                  {CATEGORY_LABEL[appt.category]} · {STATUS_LABEL[appt.status]}
                </strong>
                <span>
                  {appt.patientLabel} · {formatSlotRange(appt.slotStart, appt.durationMin)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="admin-panel">
        <h2>Video</h2>
        <p className="provider-empty">
          Video consult integration is pending. This provider shell cannot start a visit or
          impersonate a clinician.
        </p>
        <div className="admin-actions" style={{ marginTop: "1rem" }}>
          <Link className="btn btn-secondary" to="/account/appointments">
            Patient booking shell
          </Link>
          <Link className="btn btn-secondary" to="/admin/appointments">
            Admin appointments queue
          </Link>
        </div>
      </div>
    </div>
  );
}
