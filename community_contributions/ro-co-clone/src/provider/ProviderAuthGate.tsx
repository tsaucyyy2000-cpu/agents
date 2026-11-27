import { Show, useUser } from "@clerk/react";
import type { ReactNode } from "react";
import { useContent } from "../data/ContentContext";
import { isProviderAllowlistConfigured, isProviderEmail } from "./providerAllowlist";
import { ProviderForbidden } from "./ProviderForbidden";
import { ProviderMisconfigured } from "./ProviderMisconfigured";
import { ProviderSignIn } from "./ProviderSignIn";

type ProviderAuthGateProps = {
  children: ReactNode;
};

function ProviderAuthorized({ children }: ProviderAuthGateProps) {
  const { isLoaded, user } = useUser();
  const { content } = useContent();

  if (!isLoaded) {
    return (
      <div className="admin-unlock">
        <div className="admin-unlock-card">
          <p className="admin-unlock-badge admin-auth-badge">Checking session…</p>
          <h1>Loading provider portal</h1>
          <p className="admin-unlock-lead">Verifying your Clerk session.</p>
        </div>
      </div>
    );
  }

  if (!isProviderAllowlistConfigured(content.staffAllowlist)) {
    return <ProviderMisconfigured reason="allowlist" />;
  }

  const email = user?.primaryEmailAddress?.emailAddress;
  if (!isProviderEmail(email, content.staffAllowlist)) {
    return <ProviderForbidden />;
  }

  return children;
}

/**
 * Protects `/provider/*`: unauthenticated → sign-in; unauthorized → forbidden;
 * missing allowlist → locked (even if Clerk session exists).
 */
export function ProviderAuthGate({ children }: ProviderAuthGateProps) {
  return (
    <>
      <Show when="signed-out">
        <ProviderSignIn />
      </Show>
      <Show when="signed-in">
        <ProviderAuthorized>{children}</ProviderAuthorized>
      </Show>
    </>
  );
}
