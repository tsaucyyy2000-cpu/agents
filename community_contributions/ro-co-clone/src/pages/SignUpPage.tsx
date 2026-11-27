import { SignUp } from "@clerk/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AuthUnavailable } from "../auth/AuthUnavailable";
import { clerkAppearance, isClerkConfigured } from "../auth/clerkConfig";
import "../auth/auth.css";

export function SignUpPage() {
  const { t } = useTranslation("common");

  if (!isClerkConfigured()) {
    return <AuthUnavailable title={t("auth.signUpUnavailable")} context="sign-up" />;
  }

  return (
    <div className="auth-shell" data-testid="sign-up-page">
      <div className="auth-panel">
        <p className="auth-badge">{t("auth.customerAccount")}</p>
        <h1>{t("auth.signUpTitle")}</h1>
        <p className="auth-lede">{t("auth.signUpLede")}</p>
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
          {t("auth.alreadyHaveAccount")} <Link to="/sign-in">{t("cta.signIn")}</Link>
          {" · "}
          <Link to="/">{t("cta.backHome")}</Link>
        </p>
      </div>
    </div>
  );
}
