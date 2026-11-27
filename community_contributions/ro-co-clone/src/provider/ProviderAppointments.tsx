import { Link } from "react-router-dom";

/**
 * Appointment list stub — no real video / calendar provider.
 * Separate appointment booking shell (DB-42) owns scheduling UI.
 */
export function ProviderAppointments() {
  return (
    <div data-testid="provider-appointments" className="provider-appointments-stub">
      <div className="admin-header">
        <div>
          <h1>Appointments</h1>
          <p>
            Stub list only. No video visits, calendar sync, or clinician impersonation. Real booking
            belongs to the separate appointment shell when it ships.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Upcoming (empty)</h2>
        <p className="provider-empty">
          No appointments are stored here on purpose. This portal will not invent visit slots or
          clinician calendars. When the booking shell is available, link patients there from care
          flows — not from a fake provider schedule.
        </p>
        <div className="admin-actions" style={{ marginTop: "1rem" }}>
          <Link className="btn btn-secondary" to="/visit">
            Patient visit intake
          </Link>
          <Link className="btn btn-secondary" to="/how-it-works">
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}
