import { useClerk, useUser } from "@clerk/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";
import { isAdminEmail } from "../admin/adminAllowlist";
import { ACCOUNT_NAV_KEYS } from "../i18n/carePaths";

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
  const { t } = useTranslation(["account", "common"]);
  const roleLabel = identity.staff ? t("account:roleStaff") : t("account:roleCustomer");

  return (
    <div
      className="account-page"
      data-testid="account-dashboard"
      data-preview={identity.preview ? "true" : undefined}
    >
      {identity.preview ? (
        <div className="account-preview-banner" data-testid="account-preview-banner" role="status">
          {t("account:previewBanner")}
        </div>
      ) : null}

      <section className="account-hero">
        <div className="container account-hero-inner">
          <p className="section-kicker">{t("account:kicker")}</p>
          <h1>
            {identity.displayName
              ? t("account:greeting", { name: identity.displayName })
              : t("account:titleFallback")}
          </h1>
          <p className="account-hero-dek">{t("account:heroDek")}</p>
          <div className="account-meta">
            {identity.email ? (
              <span>
                {identity.preview ? t("account:previewIdentity") : t("account:signedInAs")}{" "}
                <strong>{identity.email}</strong>
              </span>
            ) : null}
            <span>{t("account:role", { role: roleLabel })}</span>
          </div>
          <div className="account-toolbar">
            {onSignOut ? (
              <button
                type="button"
                className="btn btn-ghost"
                data-testid="account-sign-out"
                onClick={onSignOut}
              >
                {t("common:cta.signOut")}
              </button>
            ) : null}
            {identity.staff ? (
              <Link className="btn btn-primary" to="/admin">
                {t("common:cta.openAdmin")}
              </Link>
            ) : null}
            <Link className="btn btn-ghost" to="/help">
              {t("common:cta.getHelp")}
            </Link>
          </div>
        </div>
      </section>

      <div className="container account-body">
        <nav
          className="account-subnav"
          aria-label={t("account:sectionsAria")}
          data-testid="account-subnav"
        >
          <div className="account-subnav-scroll">
            {ACCOUNT_NAV_KEYS.map((item) => (
              <NavLink
                key={item.to}
                to={withPreviewQuery(item.to, identity.preview)}
                end={"end" in item ? item.end : false}
                className={({ isActive }) =>
                  isActive ? "account-subnav-link is-active" : "account-subnav-link"
                }
              >
                {t(`account:${item.key}`)}
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
  const { t } = useTranslation("account");
  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    email ||
    (isLoaded ? t("customerFallback") : t("titleFallback"));
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
