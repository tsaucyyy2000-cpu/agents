import { Link } from "react-router-dom";
import "./auth.css";

type AuthUnavailableProps = {
  title?: string;
  context?: "account" | "sign-in" | "sign-up";
};

/**
 * Fail-closed customer auth chrome when Clerk publishable key is missing.
 * Mirrors admin locked messaging without passphrase fallbacks.
 */
export function AuthUnavailable({
  title = "Account sign-in unavailable",
  context = "account",
}: AuthUnavailableProps) {
  return (
    <div className="auth-shell" data-testid="auth-unavailable">
      <div className="auth-panel">
        <p className="auth-badge auth-badge-warn">Auth not configured</p>
        <h1>{title}</h1>
        <p className="auth-lede">
          Customer accounts need <code>VITE_CLERK_PUBLISHABLE_KEY</code> at build time (same Clerk
          app as admin). This SPA never embeds a Clerk secret key.
        </p>
        <ul className="auth-checklist">
          <li className="missing">
            <code>VITE_CLERK_PUBLISHABLE_KEY</code> — missing
          </li>
          <li>
            Link Clerk app <code>app_3MVcZ8Rr2hLFhPnnmb9aa1eWhgz</code> via Dashboard or{" "}
            <code>npx -y clerk@latest</code>
          </li>
        </ul>
        <p className="auth-hint">
          {context === "sign-up"
            ? "Sign-up, email verification, and password recovery stay in Clerk once the key is set."
            : context === "sign-in"
              ? "Sign-in, password recovery, and session management stay in Clerk once the key is set."
              : "Profile and account management open here after you sign in with Clerk configured."}
        </p>
        <div className="auth-actions">
          <Link className="btn btn-primary" to="/">
            Back to home
          </Link>
          <Link className="auth-text-link" to="/help">
            Help center
          </Link>
        </div>
      </div>
    </div>
  );
}
