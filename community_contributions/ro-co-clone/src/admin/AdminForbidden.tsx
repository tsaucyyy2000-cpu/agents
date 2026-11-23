import { useClerk, useUser } from "@clerk/react";
import { Link } from "react-router-dom";

/** Signed-in user whose email is not on `VITE_ADMIN_EMAILS`. */
export function AdminForbidden() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress ?? "unknown account";

  return (
    <div className="admin-unlock">
      <div className="admin-unlock-card">
        <p className="admin-unlock-badge admin-auth-badge-danger">Access denied</p>
        <h1>Not an admin</h1>
        <p className="admin-unlock-lead">
          Signed in as <strong>{email}</strong>, but that address is not on the admin allowlist (
          <code>VITE_ADMIN_EMAILS</code>). Ask an owner to add you, then sign in again.
        </p>
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              void signOut({ redirectUrl: "/admin" });
            }}
          >
            Sign out
          </button>
          <Link className="admin-unlock-exit" to="/">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
