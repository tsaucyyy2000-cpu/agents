import { useClerk, useUser } from "@clerk/react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { isAdminEmail } from "../admin/adminAllowlist";
import { ACCOUNT_NAV } from "./accountNav";

export type ShellIdentity = {
  displayName: string;
  email?: string;
  staff: boolean;
  preview: boolean;
};

export const PREVIEW_IDENTITY: ShellIdentity = {
  displayName: "Alex Preview",
  email: "preview@example.local",
  staff: false,
  preview: true,
};

export function isAccountShellPreview(search: string): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(raw).get("previewShell") === "1";
}

function withPreviewQuery(to: string, preview: boolean): string {
  if (!preview) return to;
  const [path, existing] = to.split("?");
  const params = new URLSearchParams(existing ?? "");
  params.set("previewShell", "1");
  const q = params.toString();
  return q ? `${path}?${q}` : path;
}

type AccountChromeProps = {
  identity: ShellIdentity;
  children: ReactNode;
  onSignOut?: () => void;
};

export function AccountChrome({ identity, children, onSignOut }: AccountChromeProps) {
  return (
    <div
      className="account-page"
      data-testid="account-dashboard"
      data-preview={identity.preview ? "true" : undefined}
    >
      {identity.preview ? (
        <div className="account-preview-banner" data-testid="account-preview-banner" role="status">
          Design preview · Clerk not configured · <code>?previewShell=1</code> shows this shell for
          screenshots only. Not a signed-in session.
        </div>
      ) : null}

      <section className="account-hero">
        <div className="container account-hero-inner">
          <p className="section-kicker">Your account</p>
          <h1>{identity.displayName ? `Hi, ${identity.displayName}` : "Your account"}</h1>
          <p className="account-hero-dek">
            Patient dashboard shell for overview, care, appointments, orders, membership, progress,
            documents, messages, and settings. Durable medical records, pharmacy, and payments need
            a future backend — this SPA keeps honest empty states instead of inventing PHI.
          </p>
          <div className="account-meta">
            {identity.email ? (
              <span>
                {identity.preview ? "Preview identity" : "Signed in as"}{" "}
                <strong>{identity.email}</strong>
              </span>
            ) : null}
            <span>Role: {identity.staff ? "Administrator / staff" : "Customer"}</span>
          </div>
          <div className="account-toolbar">
            {onSignOut ? (
              <button
                type="button"
                className="btn btn-ghost"
                data-testid="account-sign-out"
                onClick={onSignOut}
              >
                Sign out
              </button>
            ) : null}
            {identity.staff ? (
              <Link className="btn btn-primary" to="/admin">
                Open admin
              </Link>
            ) : null}
            <Link className="btn btn-ghost" to="/help">
              Help
            </Link>
          </div>
        </div>
      </section>

      <div className="container account-body">
        <nav className="account-subnav" aria-label="Account sections" data-testid="account-subnav">
          <div className="account-subnav-scroll">
            {ACCOUNT_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={withPreviewQuery(item.to, identity.preview)}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? "account-subnav-link is-active" : "account-subnav-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
}

/** Resolve signed-in customer identity. Must run under ClerkProvider. */
export function useAccountIdentity(): ShellIdentity {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    email ||
    (isLoaded ? "Customer" : "Your account");
  return {
    displayName,
    email,
    staff: isAdminEmail(email),
    preview: false,
  };
}

/** Signed-in account shell. Must render under ClerkProvider. */
export function AccountLayout({
  identity,
  children,
}: {
  identity: ShellIdentity;
  children: ReactNode;
}) {
  const { signOut } = useClerk();

  return (
    <AccountChrome
      identity={identity}
      onSignOut={() => {
        void signOut({ redirectUrl: "/" });
      }}
    >
      {children}
    </AccountChrome>
  );
}

/** Design-only chrome when Clerk is missing and ?previewShell=1 is set. */
export function AccountPreviewLayout({ children }: { children: ReactNode }) {
  return <AccountChrome identity={PREVIEW_IDENTITY}>{children}</AccountChrome>;
}
