import { SignIn } from "@clerk/react";
import { Link } from "react-router-dom";
import { clerkAppearance } from "../auth/clerkConfig";

/**
 * Embedded Clerk sign-in for `/provider/*`.
 * Sign-up omitted — providers are invited / allowlisted.
 */
export function ProviderSignIn() {
  return (
    <div className="admin-unlock">
      <div className="admin-unlock-card admin-auth-card">
        <p className="admin-unlock-badge admin-auth-badge">Provider sign-in</p>
        <h1>Sign in to provider portal</h1>
        <p className="admin-unlock-lead">
          Real Clerk authentication protects this UI. Your email must be tagged{" "}
          <code>provider</code> in the content-store staff allowlist (Admin → Settings) or listed in{" "}
          <code>VITE_PROVIDER_EMAILS</code>. Submissions stay in this browser&apos;s{" "}
          <code>localStorage</code> — not a clinical chart.
        </p>
        <div className="admin-clerk-mount">
          <SignIn
            routing="hash"
            forceRedirectUrl="/provider"
            fallbackRedirectUrl="/provider"
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
          No prescribe / Rx. Separate from the marketing CMS at <code>/admin</code>. Missing keys or
          an empty provider allowlist keep this portal locked.
        </p>
        <Link className="admin-unlock-exit" to="/">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
