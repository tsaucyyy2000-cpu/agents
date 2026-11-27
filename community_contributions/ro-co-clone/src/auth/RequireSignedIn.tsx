import { Show } from "@clerk/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { AuthUnavailable } from "./AuthUnavailable";
import { isClerkConfigured } from "./clerkConfig";
import "./auth.css";

type RequireSignedInProps = {
  children: ReactNode;
};

function SignedOutGate() {
  const location = useLocation();
  const { t } = useTranslation("common");
  const redirect = `${location.pathname}${location.search}`;
  const signInTo = `/sign-in?redirect_url=${encodeURIComponent(redirect || "/account")}`;

  return (
    <div className="auth-shell" data-testid="auth-signed-out-gate">
      <div className="auth-panel">
        <p className="auth-badge">{t("auth.accountRequired")}</p>
        <h1>{t("auth.signInToContinue")}</h1>
        <p className="auth-lede">{t("auth.signedOutLede")}</p>
        <div className="auth-actions">
          <Link className="btn btn-primary" to={signInTo} data-testid="auth-gate-sign-in">
            {t("cta.signIn")}
          </Link>
          <Link className="btn btn-ghost" to="/sign-up">
            {t("cta.signUp")}
          </Link>
        </div>
        <p className="auth-hint">
          {t("auth.preferRedirect")} <Link to={signInTo}>{t("auth.openSignIn")}</Link>
          {" · "}
          <Link to="/">{t("auth.home")}</Link>
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
