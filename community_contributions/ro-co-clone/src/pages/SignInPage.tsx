import { SignIn } from "@clerk/react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthUnavailable } from "../auth/AuthUnavailable";
import { clerkAppearance, isClerkConfigured } from "../auth/clerkConfig";
import "../auth/auth.css";

function redirectFromQuery(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account";
  if (raw.startsWith("/sign-in") || raw.startsWith("/sign-up")) return "/account";
  return raw;
}

export function SignInPage() {
  const [params] = useSearchParams();
  const forceRedirectUrl = redirectFromQuery(params.get("redirect_url"));

  if (!isClerkConfigured()) {
    return <AuthUnavailable title="Sign-in unavailable" context="sign-in" />;
  }

  return (
    <div className="auth-shell" data-testid="sign-in-page">
      <div className="auth-panel">
        <p className="auth-badge">Customer account</p>
        <h1>Sign in</h1>
        <p className="auth-lede">
          Use your email and password, or Google / Apple when those providers are enabled in the
          Clerk Dashboard. Password recovery and email verification are handled by Clerk.
        </p>
        <div className="auth-clerk-mount">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl={forceRedirectUrl}
            fallbackRedirectUrl="/account"
            appearance={clerkAppearance}
          />
        </div>
        <p className="auth-hint">
          New here? <Link to="/sign-up">Create an account</Link>
          {" · "}
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
