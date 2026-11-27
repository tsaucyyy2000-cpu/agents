import { Link, useLocation } from "react-router-dom";
import { AuthUnavailable } from "../auth/AuthUnavailable";
import { isClerkConfigured } from "../auth/clerkConfig";
import { isAccountShellPreview } from "../account/AccountLayout";
import { InsuranceAdmin } from "./InsuranceAdmin";
import "./admin.css";

/**
 * Design-only mount of the insurance queue when Clerk is not configured.
 * Used for screenshots — not an auth bypass. Live `/admin/insurance` stays allowlist-gated.
 */
export function InsuranceAdminPreview() {
  const location = useLocation();

  if (isClerkConfigured()) {
    return (
      <div className="admin-unlock">
        <div className="admin-unlock-card">
          <p className="admin-unlock-badge">Preview unavailable</p>
          <h1>Clerk is configured</h1>
          <p className="admin-unlock-lead">
            Design preview for insurance only runs when Clerk is not configured. Use the allowlisted{" "}
            <Link to="/admin/insurance">/admin/insurance</Link> route when signed in as staff.
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
    <div className="admin-shell" data-testid="admin-insurance-preview">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>ro clone</strong>
          <span>Admin · design preview</span>
        </div>
        <p className="admin-gate-note">
          Design preview only · Clerk not configured · <code>?previewShell=1</code>. Not a signed-in
          staff session. Live list stays at <code>/admin/insurance</code> behind allowlist.
        </p>
        <nav>
          <span className="admin-preview-nav-active">Insurance</span>
        </nav>
        <div className="admin-sidebar-footer">
          <Link className="admin-exit" to="/account/insurance?previewShell=1">
            Patient insurance preview
          </Link>
          <Link className="admin-exit" to="/">
            ← View site
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-design-preview-banner" role="status">
          Design preview · insurance chrome · localStorage sandbox · no fabricated coverage · not an
          auth bypass
        </div>
        <InsuranceAdmin />
      </div>
    </div>
  );
}
