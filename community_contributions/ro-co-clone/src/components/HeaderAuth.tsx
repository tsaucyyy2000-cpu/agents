import { Show, useClerk, useUser } from "@clerk/react";
import { Link } from "react-router-dom";
import { isClerkConfigured } from "../auth/clerkConfig";
import "../auth/auth.css";

/**
 * Header account controls. Hooks only run under ClerkProvider (key present).
 */
function HeaderAuthClerk({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const label = user?.firstName?.trim() || "Account";

  return (
    <>
      <Show when="signed-out">
        <Link
          to="/sign-in"
          className="nav-link header-account"
          data-testid="header-sign-in"
          onClick={onNavigate}
        >
          Sign in
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
          Sign out
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
  if (!isClerkConfigured()) {
    return (
      <Link
        to="/account"
        className={mobile ? "mobile-link" : "nav-link header-account"}
        data-testid="header-account-locked"
        onClick={onNavigate}
      >
        Account
      </Link>
    );
  }

  if (mobile) {
    return (
      <>
        <Show when="signed-out">
          <Link to="/sign-in" className="mobile-link" data-testid="header-sign-in" onClick={onNavigate}>
            Sign in
          </Link>
          <Link to="/sign-up" className="mobile-link" onClick={onNavigate}>
            Create account
          </Link>
        </Show>
        <Show when="signed-in">
          <Link to="/account" className="mobile-link" data-testid="header-account" onClick={onNavigate}>
            Your account
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
      Sign out
    </button>
  );
}
