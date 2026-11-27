import { useClerk, useUser } from "@clerk/react";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import "../admin/admin.css";
import "./provider.css";
import { AdminClerkErrorBoundary } from "../admin/AdminClerkErrorBoundary";
import { ProviderAuthGate } from "./ProviderAuthGate";
import { ProviderMisconfigured } from "./ProviderMisconfigured";
import { ProviderRxBanner } from "./ProviderRxBanner";
import { isClerkConfigured } from "./providerAllowlist";

const links = [
  { to: "/provider", label: "Worklist", end: true },
  { to: "/provider/messages", label: "Messaging" },
  { to: "/provider/appointments", label: "Appointments" },
  { to: "/provider/templates", label: "Note templates" },
];

export function isProviderShellPreview(search: string): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(raw).get("previewShell") === "1";
}

export function withProviderPreview(path: string): string {
  const [pathname, existing = ""] = path.split("?");
  const params = new URLSearchParams(existing);
  params.set("previewShell", "1");
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function ProviderChrome({
  email,
  preview = false,
  onSignOut,
  children,
}: {
  email?: string | null;
  preview?: boolean;
  onSignOut?: () => void;
  children?: ReactNode;
}) {
  const location = useLocation();

  return (
    <div className="admin-shell provider-shell" data-testid="provider-portal">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>ro clone</strong>
          <span>{preview ? "Provider · design preview" : "Provider · Clerk"}</span>
        </div>
        <p className="admin-gate-note">
          {preview
            ? "Design preview only · Clerk not configured · not a signed-in provider session."
            : "Clerk + provider allowlist. Worklist reads local quiz/visit submissions — not a clinical chart."}
        </p>
        {email ? <p className="admin-signed-in-as">{email}</p> : null}
        <nav>
          {links.map((link) => {
            const to = preview ? withProviderPreview(link.to) : link.to;
            return (
              <NavLink key={link.to} to={to} end={link.end}>
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          {!preview && onSignOut ? (
            <button type="button" className="admin-lock-btn" onClick={onSignOut}>
              Sign out
            </button>
          ) : null}
          <Link className="admin-exit" to="/admin">
            Marketing CMS
          </Link>
          <Link className="admin-exit" to="/">
            ← View site
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        {preview ? (
          <div className="provider-design-preview-banner" role="status">
            Design preview · provider portal chrome · localStorage demo · not durable · not an auth
            bypass · path {location.pathname}
          </div>
        ) : null}
        <p className="provider-demo-chip">Demo / not clinical system of record</p>
        <ProviderRxBanner />
        {children ?? <Outlet />}
      </div>
    </div>
  );
}

function LiveProviderShell() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress;
  return (
    <ProviderChrome
      email={email}
      onSignOut={() => {
        void signOut({ redirectUrl: "/provider" });
      }}
    />
  );
}

/** Live `/provider/*` when Clerk is configured. */
export function ProviderLayout() {
  if (!isClerkConfigured()) {
    return <ProviderMisconfigured reason="clerk" />;
  }

  return (
    <AdminClerkErrorBoundary>
      <ProviderAuthGate>
        <LiveProviderShell />
      </ProviderAuthGate>
    </AdminClerkErrorBoundary>
  );
}

/** Design-only chrome when Clerk is missing and `?previewShell=1` is set. */
export function ProviderPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <ProviderChrome preview email="preview@provider.local">
      {children}
    </ProviderChrome>
  );
}
