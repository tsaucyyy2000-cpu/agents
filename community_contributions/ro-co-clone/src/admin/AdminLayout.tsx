import { useClerk, useUser } from "@clerk/react";
import { Link, NavLink, Outlet } from "react-router-dom";
import "./admin.css";
import { AdminAuthGate } from "./AdminAuthGate";
import { AdminClerkErrorBoundary } from "./AdminClerkErrorBoundary";
import { AdminMisconfigured } from "./AdminMisconfigured";
import { isClerkConfigured } from "./adminAllowlist";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/content", label: "Site content" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/media", label: "Media library" },
  { to: "/admin/leads", label: "Submissions" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/appointments", label: "Appointments" },
  { to: "/admin/labs", label: "Labs" },
  { to: "/admin/pharmacy", label: "Pharmacy" },
  { to: "/admin/settings", label: "Settings" },
];

function AdminShell() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>ro clone</strong>
          <span>Admin · Clerk</span>
        </div>
        <p className="admin-gate-note">
          Clerk + email allowlist. CMS/leads remain browser-local until a backend exists.
        </p>
        {email ? <p className="admin-signed-in-as">{email}</p> : null}
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-lock-btn"
            onClick={() => {
              void signOut({ redirectUrl: "/admin" });
            }}
          >
            Sign out
          </button>
          <Link className="admin-exit" to="/account">
            Customer account
          </Link>
          <Link className="admin-exit" to="/">
            ← View site
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}

export function AdminLayout() {
  if (!isClerkConfigured()) {
    return <AdminMisconfigured />;
  }

  return (
    <AdminClerkErrorBoundary>
      <AdminAuthGate>
        <AdminShell />
      </AdminAuthGate>
    </AdminClerkErrorBoundary>
  );
}
