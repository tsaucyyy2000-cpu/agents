import { SignIn } from "@clerk/react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
  const forceRedirectUrl = redirectFromQuery(params.get("redirect_url"));

  if (!isClerkConfigured()) {
    return <AuthUnavailable title={t("auth.signInUnavailable")} context="sign-in" />;
  }

  return (
    <div className="auth-shell" data-testid="sign-in-page">
      <div className="auth-panel">
        <p className="auth-badge">{t("auth.customerAccount")}</p>
        <h1>{t("auth.signInTitle")}</h1>
        <p className="auth-lede">{t("auth.signInLede")}</p>
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
          {t("auth.newHere")} <Link to="/sign-up">{t("auth.createAnAccount")}</Link>
          {" · "}
          <Link to="/">{t("cta.backHome")}</Link>
        </p>
      </div>
    </div>
  );
}
