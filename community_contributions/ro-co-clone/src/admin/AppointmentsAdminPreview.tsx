import { Link, useLocation } from "react-router-dom";
import { AuthUnavailable } from "../auth/AuthUnavailable";
import { isClerkConfigured } from "../auth/clerkConfig";
import { isAccountShellPreview } from "../account/AccountLayout";
import { AppointmentsAdmin } from "./AppointmentsAdmin";
import "./admin.css";

/**
 * Design-only mount of the appointments queue when Clerk is not configured.
 * Used for screenshots — not an auth bypass. Live `/admin/appointments` stays allowlist-gated.
 */
export function AppointmentsAdminPreview() {
  const location = useLocation();

  if (isClerkConfigured()) {
    return (
      <div className="admin-unlock">
        <div className="admin-unlock-card">
          <p className="admin-unlock-badge">Preview unavailable</p>
          <h1>Clerk is configured</h1>
          <p className="admin-unlock-lead">
            Design preview for appointments only runs when Clerk is not configured. Use the
            allowlisted <Link to="/admin/appointments">/admin/appointments</Link> route when signed
            in as staff.
          </p>
          <Link className="admin-unlock-exit" to="/">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isAccountShellPreview(location.search)) {
    return <AuthUnavailable />;
  }

  return (
    <div className="admin-shell" data-testid="admin-appointments-preview">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>ro clone</strong>
          <span>Admin · design preview</span>
        </div>
        <p className="admin-gate-note">
          Design preview only · Clerk not configured · <code>?previewShell=1</code>. Not a signed-in
          staff session. Live list stays at <code>/admin/appointments</code> behind allowlist.
        </p>
        <nav>
          <span className="admin-preview-nav-active">Appointments</span>
        </nav>
        <div className="admin-sidebar-footer">
          <Link className="admin-exit" to="/account/appointments?previewShell=1">
            Patient appointments preview
          </Link>
          <Link className="admin-exit" to="/">
            ← View site
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-design-preview-banner" role="status">
          Design preview · appointments chrome · localStorage sandbox · not durable · not an auth
          bypass
        </div>
        <AppointmentsAdmin />
      </div>
    </div>
  );
}
