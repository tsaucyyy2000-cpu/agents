import { Link } from "react-router-dom";
import { isClerkConfigured } from "./providerAllowlist";

/**
 * Fail-closed screen when Clerk or the provider allowlist is missing.
 */
export function ProviderMisconfigured({ reason }: { reason?: "clerk" | "allowlist" }) {
  const clerkOk = isClerkConfigured();
  const missingClerk = reason === "clerk" || !clerkOk;

  return (
    <div className="admin-unlock" data-testid="provider-locked">
      <div className="admin-unlock-card">
        <p className="admin-unlock-badge admin-auth-badge-danger">Provider locked</p>
        <h1>Auth not configured</h1>
        <p className="admin-unlock-lead">
          <code>/provider</code> requires Clerk plus a provider allowlist (content-store role tag or{" "}
          <code>VITE_PROVIDER_EMAILS</code>). This is not a clinical system of record.
        </p>
        <ul className="admin-auth-checklist">
          <li className={clerkOk ? "ok" : "missing"}>
            <code>VITE_CLERK_PUBLISHABLE_KEY</code>
            {clerkOk ? " — set" : " — missing"}
          </li>
          <li className={missingClerk || reason === "allowlist" ? "missing" : "ok"}>
            Provider emails — content-store <code>staffAllowlist</code> role{" "}
            <code>provider</code> and/or <code>VITE_PROVIDER_EMAILS</code>
            {reason === "allowlist" ? " — empty" : missingClerk ? " — check after Clerk" : ""}
          </li>
        </ul>
        <p className="admin-unlock-hint">
          Prefer tagging providers in Admin → Settings rather than inventing new secrets. Optional
          env allowlist is documented when a build-time list is cleaner. For design screenshots
          without secrets, use <code>/provider?previewShell=1</code>.
        </p>
        <Link className="admin-unlock-exit" to="/">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
