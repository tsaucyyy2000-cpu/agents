/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_ADMIN_EMAILS?: string;
  /** Optional provider allowlist. Prefer content-store role tags when empty. */
  readonly VITE_PROVIDER_EMAILS?: string;
  readonly VITE_SITE_ORIGIN?: string;
  /**
   * Optional remote support-assistant endpoint. When unset or failing, the site
   * helper fails closed to the local FAQ matcher. Never required for website FAQs.
   */
  readonly VITE_SUPPORT_ASSISTANT_API_URL?: string;
  /** Optional Bearer token for VITE_SUPPORT_ASSISTANT_API_URL. */
  readonly VITE_SUPPORT_ASSISTANT_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
