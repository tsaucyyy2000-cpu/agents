import { useClerk, useUser } from "@clerk/react";
import { Link } from "react-router-dom";

/** Signed-in user whose email is not on the provider allowlist. */
export function ProviderForbidden() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress ?? "unknown account";

  return (
    <div className="admin-unlock">
      <div className="admin-unlock-card">
        <p className="admin-unlock-badge admin-auth-badge-danger">Access denied</p>
        <h1>Not a provider</h1>
        <p className="admin-unlock-lead">
          Signed in as <strong>{email}</strong>, but that address is not tagged{" "}
          <code>provider</code> in the content-store staff allowlist and is not on{" "}
          <code>VITE_PROVIDER_EMAILS</code>. Ask an owner to add the role, then sign in again.
        </p>
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              void signOut({ redirectUrl: "/provider" });
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
