import { Show } from "@clerk/react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthUnavailable } from "./AuthUnavailable";
import { isClerkConfigured } from "./clerkConfig";
import "./auth.css";

type RequireSignedInProps = {
  children: ReactNode;
};

function SignedOutGate() {
  const location = useLocation();
  const redirect = `${location.pathname}${location.search}`;
  const signInTo = `/sign-in?redirect_url=${encodeURIComponent(redirect || "/account")}`;

  return (
    <div className="auth-shell" data-testid="auth-signed-out-gate">
      <div className="auth-panel">
        <p className="auth-badge">Account required</p>
        <h1>Sign in to continue</h1>
        <p className="auth-lede">
          This area is for signed-in customers. Quiz answers, visit leads, and plan reviews still
          live in this browser&apos;s <code>localStorage</code> until a real backend exists — not
          production PHI storage.
        </p>
        <div className="auth-actions">
          <Link className="btn btn-primary" to={signInTo} data-testid="auth-gate-sign-in">
            Sign in
          </Link>
          <Link className="btn btn-ghost" to="/sign-up">
            Create account
          </Link>
        </div>
        <p className="auth-hint">
          Prefer a hard redirect? <Link to={signInTo}>Open sign-in</Link>
          {" · "}
          <Link to="/">Home</Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Client-route guard for private account pages.
 * SPA has no server API — this is UI protection only.
 */
export function RequireSignedIn({ children }: RequireSignedInProps) {
  if (!isClerkConfigured()) {
    return <AuthUnavailable />;
  }

  return (
    <>
      <Show when="signed-out">
        <SignedOutGate />
      </Show>
      <Show when="signed-in">{children}</Show>
    </>
  );
}
