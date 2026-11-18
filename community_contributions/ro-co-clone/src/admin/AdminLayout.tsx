import { Link, NavLink, Outlet } from "react-router-dom";
import "./admin.css";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/content", label: "Site content" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/media", label: "Media library" },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>ro clone</strong>
          <span>Admin</span>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Link className="admin-exit" to="/">
          ← View site
        </Link>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
