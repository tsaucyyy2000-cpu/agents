import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { DEMO_ADMIN_GATE_PASSPHRASE, unlockAdmin } from "./adminGate";

type AdminUnlockProps = {
  onUnlocked: () => void;
};

/**
 * Lightweight unlock screen for `/admin/*`.
 * Not real auth — passphrase is client-side / env-bundled.
 */
export function AdminUnlock({ onUnlocked }: AdminUnlockProps) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!unlockAdmin(passphrase)) {
      setError("Passphrase did not match. Check VITE_ADMIN_GATE or the README fallback.");
      return;
    }
    setError(null);
    onUnlocked();
  }

  return (
    <div className="admin-unlock">
      <div className="admin-unlock-card">
        <p className="admin-unlock-badge">Admin unlock · not production auth</p>
        <h1>Unlock local admin</h1>
        <p className="admin-unlock-lead">
          This SPA has no server-side auth. Anyone who can read the built bundle can recover the
          passphrase. Use only on trusted machines — not HIPAA, not staff login, not a real CMS
          boundary.
        </p>
        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            Passphrase
            <input
              type="password"
              name="admin-passphrase"
              autoComplete="current-password"
              value={passphrase}
              onChange={(event) => {
                setPassphrase(event.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter admin passphrase"
            />
          </label>
          {error ? (
            <p className="toast-err" role="alert">
              {error}
            </p>
          ) : null}
          <div className="admin-actions">
            <button type="submit" className="btn btn-primary">
              Unlock for this tab
            </button>
            <Link className="admin-unlock-exit" to="/">
              ← Back to site
            </Link>
          </div>
        </form>
        <p className="admin-unlock-hint">
          Local default when <code>VITE_ADMIN_GATE</code> is unset:{" "}
          <code>{DEMO_ADMIN_GATE_PASSPHRASE}</code> (documented in README). Unlock is stored in{" "}
          <code>sessionStorage</code> for this browser tab only.
        </p>
      </div>
    </div>
  );
}
