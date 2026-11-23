import { Link } from "react-router-dom";
import { isAdminAllowlistConfigured, isClerkConfigured } from "./adminAllowlist";

/**
 * Fail-closed screen when Clerk or the email allowlist is missing.
 * Replaces the old `demo-admin` passphrase — no local unlock without real auth config.
 */
export function AdminMisconfigured() {
  const hasClerk = isClerkConfigured();
  const hasAllowlist = isAdminAllowlistConfigured();

  return (
    <div className="admin-unlock">
      <div className="admin-unlock-card">
        <p className="admin-unlock-badge admin-auth-badge-danger">Admin locked</p>
        <h1>Auth not configured</h1>
        <p className="admin-unlock-lead">
          <code>/admin</code> requires Clerk plus an email allowlist. The old{" "}
          <code>demo-admin</code> / <code>VITE_ADMIN_GATE</code> passphrase is removed.
        </p>
        <ul className="admin-auth-checklist">
          <li className={hasClerk ? "ok" : "missing"}>
            <code>VITE_CLERK_PUBLISHABLE_KEY</code>
            {hasClerk ? " — set" : " — missing"}
          </li>
          <li className={hasAllowlist ? "ok" : "missing"}>
            <code>VITE_ADMIN_EMAILS</code>
            {hasAllowlist ? " — set" : " — missing (comma-separated admin emails)"}
          </li>
        </ul>
        <p className="admin-unlock-hint">
          Add both to <code>.env.local</code> (gitignored), restart <code>npm run dev</code>, then
          sign in with an allowlisted email. See the project admin-auth doc for Cursor secrets /
          host env notes.
        </p>
        <Link className="admin-unlock-exit" to="/">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
