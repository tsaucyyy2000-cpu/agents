/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_ADMIN_EMAILS?: string;
  /** Optional provider allowlist. Prefer content-store role tags when empty. */
  readonly VITE_PROVIDER_EMAILS?: string;
  readonly VITE_SITE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
