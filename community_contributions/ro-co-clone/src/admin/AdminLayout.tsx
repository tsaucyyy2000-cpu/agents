import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import "./admin.css";
import { isAdminUnlocked, lockAdmin } from "./adminGate";
import { AdminUnlock } from "./AdminUnlock";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/content", label: "Site content" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/media", label: "Media library" },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminLayout() {
  const [unlocked, setUnlocked] = useState(() => isAdminUnlocked());

  if (!unlocked) {
    return <AdminUnlock onUnlocked={() => setUnlocked(true)} />;
  }

  function onLock() {
    lockAdmin();
    setUnlocked(false);
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>ro clone</strong>
          <span>Admin unlock</span>
        </div>
        <p className="admin-gate-note">
          Client unlock only — not real auth / not HIPAA. Passphrase lives in the client bundle until server auth ships.
        </p>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button type="button" className="admin-lock-btn" onClick={onLock}>
            Lock admin
          </button>
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
