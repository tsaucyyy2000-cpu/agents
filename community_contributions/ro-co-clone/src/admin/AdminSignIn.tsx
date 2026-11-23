import { SignIn } from "@clerk/react";
import { Link } from "react-router-dom";
import { clerkAppearance } from "../auth/clerkConfig";

/**
 * Embedded Clerk sign-in for `/admin/*`.
 * Sign-up is intentionally omitted here — admins are invited / allowlisted.
 */
export function AdminSignIn() {
  return (
    <div className="admin-unlock">
      <div className="admin-unlock-card admin-auth-card">
        <p className="admin-unlock-badge admin-auth-badge">Admin sign-in</p>
        <h1>Sign in to admin</h1>
        <p className="admin-unlock-lead">
          Real Clerk authentication protects this UI. Your email must also be on the{" "}
          <code>VITE_ADMIN_EMAILS</code> allowlist. CMS content and leads still live in this
          browser&apos;s <code>localStorage</code> — a backend is required before shared hosting of
          that data.
        </p>
        <div className="admin-clerk-mount">
          <SignIn
            routing="hash"
            forceRedirectUrl="/admin"
            fallbackRedirectUrl="/admin"
            withSignUp={false}
            appearance={{
              ...clerkAppearance,
              elements: {
                ...clerkAppearance.elements,
                rootBox: "admin-clerk-root",
                card: "admin-clerk-card",
              },
            }}
          />
        </div>
        <p className="admin-unlock-hint">
          No passphrase fallback. Missing keys or an empty allowlist keep admin locked. Staff role
          remains the email allowlist — not a second passphrase.
        </p>
        <Link className="admin-unlock-exit" to="/">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
