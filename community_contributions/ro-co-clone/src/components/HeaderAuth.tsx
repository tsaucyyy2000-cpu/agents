import { Show, useClerk, useUser } from "@clerk/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { isClerkConfigured } from "../auth/clerkConfig";
import "../auth/auth.css";

/**
 * Header account controls. Hooks only run under ClerkProvider (key present).
 */
function HeaderAuthClerk({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t } = useTranslation("common");
  const label = user?.firstName?.trim() || t("cta.account");

  return (
    <>
      <Show when="signed-out">
        <Link
          to="/sign-in"
          className="nav-link header-account"
          data-testid="header-sign-in"
          onClick={onNavigate}
        >
          {t("cta.signIn")}
        </Link>
      </Show>
      <Show when="signed-in">
        <Link
          to="/account"
          className="nav-link header-account"
          data-testid="header-account"
          onClick={onNavigate}
        >
          {label}
        </Link>
        <button
          type="button"
          className="nav-link header-account header-account-btn"
          data-testid="header-sign-out"
          onClick={() => {
            onNavigate?.();
            void signOut({ redirectUrl: "/" });
          }}
        >
          {t("cta.signOut")}
        </button>
      </Show>
    </>
  );
}

type HeaderAuthProps = {
  onNavigate?: () => void;
  mobile?: boolean;
};

export function HeaderAuth({ onNavigate, mobile = false }: HeaderAuthProps) {
  const { t } = useTranslation("common");

  if (!isClerkConfigured()) {
    return (
      <Link
        to="/account"
        className={mobile ? "mobile-link" : "nav-link header-account"}
        data-testid="header-account-locked"
        onClick={onNavigate}
      >
        {t("cta.account")}
      </Link>
    );
  }

  if (mobile) {
    return (
      <>
        <Show when="signed-out">
          <Link to="/sign-in" className="mobile-link" data-testid="header-sign-in" onClick={onNavigate}>
            {t("cta.signIn")}
          </Link>
          <Link to="/sign-up" className="mobile-link" onClick={onNavigate}>
            {t("cta.signUp")}
          </Link>
        </Show>
        <Show when="signed-in">
          <Link to="/account" className="mobile-link" data-testid="header-account" onClick={onNavigate}>
            {t("cta.yourAccount")}
          </Link>
          <HeaderAuthMobileSignOut onNavigate={onNavigate} />
        </Show>
      </>
    );
  }

  return <HeaderAuthClerk onNavigate={onNavigate} />;
}

function HeaderAuthMobileSignOut({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut } = useClerk();
  const { t } = useTranslation("common");
  return (
    <button
      type="button"
      className="mobile-link header-account-btn"
      data-testid="header-sign-out"
      onClick={() => {
        onNavigate?.();
        void signOut({ redirectUrl: "/" });
      }}
    >
      {t("cta.signOut")}
    </button>
  );
}
