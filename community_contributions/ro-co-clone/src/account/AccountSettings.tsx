import { UserProfile } from "@clerk/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clerkAppearance } from "../auth/clerkConfig";
import {
  DEFAULT_NOTIF_PREFS,
  loadNotificationPrefs,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "./notificationPrefs";

type AccountSettingsProps = {
  preview?: boolean;
};

const NOTIF_FIELDS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  {
    key: "careReminders",
    label: "Care reminders",
    hint: "Quiz / visit nudges — local stub only",
  },
  {
    key: "orderUpdates",
    label: "Order updates",
    hint: "No shipments yet — preference saved in this browser",
  },
  {
    key: "membershipTips",
    label: "Membership tips",
    hint: "Billing is not connected",
  },
  {
    key: "productEducation",
    label: "Product education",
    hint: "Guide highlights — not clinical messaging",
  },
];

export function AccountSettings({ preview = false }: AccountSettingsProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIF_PREFS);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setPrefs(loadNotificationPrefs());
  }, []);

  function toggle(key: keyof NotificationPrefs) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveNotificationPrefs(next);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1600);
      return next;
    });
  }

  return (
    <div className="account-section" data-testid="account-settings">
      <header className="account-section-head">
        <p className="section-kicker">Settings</p>
        <h2>Profile & preferences</h2>
        <p>
          Security, password, and connected accounts use Clerk&apos;s profile UI. Notification toggles
          below are <strong>local-only stubs</strong> — they do not send email or push.
        </p>
      </header>

      <div className="account-settings-grid">
        <section className="account-card account-profile-mount">
          <h3>Profile & security</h3>
          <p className="account-card-lede">
            Update name, email, password, and connected accounts. Email verification and password
            recovery are provided by Clerk when enabled for this app.
          </p>
          {preview ? (
            <div className="account-clerk-stub" data-testid="account-clerk-stub">
              <p className="account-empty-kicker">Clerk UserProfile</p>
              <p>
                Live profile editing mounts here when <code>VITE_CLERK_PUBLISHABLE_KEY</code> is set
                and you are signed in. This design preview shows the slot only.
              </p>
              <Link className="btn btn-ghost" to="/sign-in">
                Sign-in route
              </Link>
            </div>
          ) : (
            <UserProfile routing="hash" appearance={clerkAppearance} />
          )}
        </section>

        <section className="account-card" data-testid="account-notif-prefs">
          <h3>Notification preferences</h3>
          <p className="account-card-lede">
            Stored in <code>localStorage</code> key <code>ro-clone-account-notif-prefs-v1</code>. Not
            synced to a server.
          </p>
          <ul className="account-pref-list">
            {NOTIF_FIELDS.map((field) => (
              <li key={field.key}>
                <label className="account-pref-row">
                  <input
                    type="checkbox"
                    checked={prefs[field.key]}
                    onChange={() => toggle(field.key)}
                    data-testid={`notif-${field.key}`}
                  />
                  <span>
                    <strong>{field.label}</strong>
                    <em>{field.hint}</em>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {savedFlash ? (
            <p className="account-pref-saved" role="status">
              Saved on this device
            </p>
          ) : null}
          <div className="callout warn">
            <p>
              Turning these on does not enable email or SMS. Real notification delivery needs a
              future backend and provider configuration.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
