import { Show, useUser } from "@clerk/react";
import type { ReactNode } from "react";
import { isAdminAllowlistConfigured, isAdminEmail } from "./adminAllowlist";
import { AdminForbidden } from "./AdminForbidden";
import { AdminMisconfigured } from "./AdminMisconfigured";
import { AdminSignIn } from "./AdminSignIn";

type AdminAuthGateProps = {
  children: ReactNode;
};

function AdminAuthorized({ children }: AdminAuthGateProps) {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="admin-unlock">
        <div className="admin-unlock-card">
          <p className="admin-unlock-badge admin-auth-badge">Checking session…</p>
          <h1>Loading admin</h1>
          <p className="admin-unlock-lead">Verifying your Clerk session.</p>
        </div>
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress;
  if (!isAdminEmail(email)) {
    return <AdminForbidden />;
  }

  return children;
}

/**
 * Protects `/admin/*`: unauthenticated → sign-in; unauthorized → forbidden;
 * missing allowlist → locked (even if Clerk session exists).
 */
export function AdminAuthGate({ children }: AdminAuthGateProps) {
  if (!isAdminAllowlistConfigured()) {
    return <AdminMisconfigured />;
  }

  return (
    <>
      <Show when="signed-out">
        <AdminSignIn />
      </Show>
      <Show when="signed-in">
        <AdminAuthorized>{children}</AdminAuthorized>
      </Show>
    </>
  );
}
