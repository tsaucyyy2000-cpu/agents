import { useState } from "react";
import { defaultContent } from "../data/defaultContent";
import { useContent } from "../data/ContentContext";

export function SettingsAdmin() {
  const { content, updateSettings, exportJson, importJson, resetToDefaults } = useContent();
  const [settings, setSettings] = useState(content.settings);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
