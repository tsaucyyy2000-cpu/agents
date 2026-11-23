import { ClerkProvider } from "@clerk/react";
import type { ReactNode } from "react";
import { clerkAppearance, clerkPublishableKey, isClerkConfigured } from "./clerkConfig";

type ClerkRootProps = {
  children: ReactNode;
};

/**
 * App-wide Clerk when `VITE_CLERK_PUBLISHABLE_KEY` is set.
 * Without a key, children render unchanged (customer marketing still works;
 * `/admin` and account routes show their own locked screens).
 */
export function ClerkRoot({ children }: ClerkRootProps) {
  if (!isClerkConfigured()) {
    return children;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey()}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/account"
      signUpFallbackRedirectUrl="/account"
      appearance={clerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
}
