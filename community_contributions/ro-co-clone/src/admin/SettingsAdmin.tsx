import { useState } from "react";
import { defaultContent } from "../data/defaultContent";
import { useContent } from "../data/ContentContext";
import type { StaffAllowlistEntry, StaffRole } from "../data/types";

export function SettingsAdmin() {
  const {
    content,
    updateSettings,
    exportJson,
    importJson,
    resetToDefaults,
    setStaffAllowlist,
    setProviderNoteTemplates,
  } = useContent();
  const [settings, setSettings] = useState(content.settings);
  const [staffDraft, setStaffDraft] = useState(() => serializeStaff(content.staffAllowlist));
  const [templatesDraft, setTemplatesDraft] = useState(
    () => content.providerNoteTemplates.join("\n"),
  );
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function serializeStaff(entries: StaffAllowlistEntry[]): string {
    return entries
      .map((entry) => `${entry.email}:${entry.roles.join("+")}`)
      .join("\n");
  }

  function parseStaff(raw: string): StaffAllowlistEntry[] {
    const out: StaffAllowlistEntry[] = [];
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [emailPart, rolesPart = "provider"] = trimmed.split(":");
      const email = emailPart.trim().toLowerCase();
      if (!email) continue;
      const roles: StaffRole[] = [];
      for (const role of rolesPart.split(/[+|,]/)) {
        const r = role.trim().toLowerCase();
        if (r === "admin" || r === "provider") {
          if (!roles.includes(r)) roles.push(r);
        }
      }
      if (roles.length === 0) roles.push("provider");
      out.push({ email, roles });
    }
    return out;
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Settings</h1>
          <p>Brand knobs plus JSON import/export to keep the clone updatable.</p>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Brand & membership</h2>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            updateSettings(settings);
            setMessage("Settings saved.");
            setError("");
          }}
        >
          {(
            [
              ["brandName", "Brand name"],
              ["tagline", "Tagline"],
              ["supportEmail", "Support email"],
              ["membershipFirstMonth", "First-month price label"],
              ["membershipOngoing", "Ongoing price label"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={settings[key]}
                onChange={(event) =>
                  setSettings({ ...settings, [key]: event.target.value })
                }
              />
            </label>
          ))}
          <fieldset className="admin-orphan-fieldset">
            <legend>
              Vanity stats{" "}
              <span className="admin-stage-badge">
                {content.orphanPublish.vanityStats
                  ? "Published"
                  : "Staged · not on customer UI"}
              </span>
            </legend>
            <p className="admin-orphan-lede">
              Leave blank until verified. Customer home ignores these unless the vanity publish gate
              is on (Content admin). Do not invent member counts or satisfaction %.
            </p>
            {(
              [
                ["memberCountLabel", "Member count label"],
                ["satisfactionLabel", "Satisfaction label"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={settings[key]}
                  placeholder="Leave empty until verified"
                  onChange={(event) =>
                    setSettings({ ...settings, [key]: event.target.value })
                  }
                />
              </label>
            ))}
          </fieldset>
          <button className="btn btn-primary" type="submit">
            Save settings
          </button>
        </form>
      </div>

      <div className="admin-panel" data-testid="admin-staff-roles">
        <h2>Staff roles (provider portal)</h2>
        <p className="admin-orphan-lede">
          Prefer tagging <code>provider</code> emails here instead of inventing new secrets. Live{" "}
          <code>/admin</code> still requires <code>VITE_ADMIN_EMAILS</code>. Optional{" "}
          <code>VITE_PROVIDER_EMAILS</code> merges with this list for <code>/provider</code>. Format:{" "}
          <code>email@example.com:provider</code> or <code>email@example.com:admin+provider</code>{" "}
          (one per line).
        </p>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            const entries = parseStaff(staffDraft);
            setStaffAllowlist(entries);
            setStaffDraft(serializeStaff(entries));
            setMessage("Staff roles saved to local content store.");
            setError("");
          }}
        >
          <label>
            Role-tagged emails
            <textarea
              value={staffDraft}
              onChange={(event) => setStaffDraft(event.target.value)}
              placeholder={"clinician@example.com:provider\nops@example.com:admin+provider"}
              rows={5}
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Save staff roles
          </button>
        </form>
        <form
          className="admin-form"
          style={{ marginTop: "1rem" }}
          onSubmit={(event) => {
            event.preventDefault();
            const templates = templatesDraft
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);
            setProviderNoteTemplates(templates);
            setTemplatesDraft(templates.join("\n"));
            setMessage("Provider note templates saved.");
            setError("");
          }}
        >
          <label>
            Provider note templates (one per line)
            <textarea
              value={templatesDraft}
              onChange={(event) => setTemplatesDraft(event.target.value)}
              rows={5}
            />
          </label>
          <button className="btn btn-secondary" type="submit">
            Save note templates
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <h2>Export / import</h2>
        <div className="admin-actions" style={{ marginBottom: "0.85rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const blob = new Blob([exportJson()], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = "ro-clone-content.json";
              anchor.click();
              URL.revokeObjectURL(url);
              setMessage("Exported content JSON.");
            }}
          >
            Download JSON
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              resetToDefaults();
              setSettings(structuredClone(defaultContent.settings));
              setMessage("Reset to shipped defaults.");
            }}
          >
            Reset defaults
          </button>
        </div>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            const result = importJson(importText);
            if (!result.ok) {
              setError(result.error);
              setMessage("");
              return;
            }
            setError("");
            setMessage("Imported content JSON.");
          }}
        >
          <label>
            Paste content JSON
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder='{"version":1,...}'
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Import
          </button>
        </form>
      </div>

      {message ? <p className="toast-ok">{message}</p> : null}
      {error ? <p className="toast-err">{error}</p> : null}
    </div>
  );
}
