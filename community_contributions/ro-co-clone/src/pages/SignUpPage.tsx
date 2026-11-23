import { SignUp } from "@clerk/react";
import { Link } from "react-router-dom";
import { AuthUnavailable } from "../auth/AuthUnavailable";
import { clerkAppearance, isClerkConfigured } from "../auth/clerkConfig";
import "../auth/auth.css";

export function SignUpPage() {
  if (!isClerkConfigured()) {
    return <AuthUnavailable title="Sign-up unavailable" context="sign-up" />;
  }

  return (
    <div className="auth-shell" data-testid="sign-up-page">
      <div className="auth-panel">
        <p className="auth-badge">Customer account</p>
        <h1>Create your account</h1>
        <p className="auth-lede">
          Sign up with email (verification required when enabled in Clerk) or Google / Apple when
          those social providers are turned on in the Dashboard for this application.
        </p>
        <div className="auth-clerk-mount">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/account"
            fallbackRedirectUrl="/account"
            appearance={clerkAppearance}
          />
        </div>
        <p className="auth-hint">
          Already have an account? <Link to="/sign-in">Sign in</Link>
          {" · "}
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
