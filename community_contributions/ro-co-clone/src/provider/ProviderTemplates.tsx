import { useState, type FormEvent } from "react";
import { DEFAULT_PROVIDER_NOTE_TEMPLATES } from "../data/defaultContent";
import { useContent } from "../data/ContentContext";

export function ProviderTemplates() {
  const { content, setProviderNoteTemplates } = useContent();
  const [draft, setDraft] = useState(content.providerNoteTemplates.join("\n"));
  const [message, setMessage] = useState("");

  function handleSave(event: FormEvent) {
    event.preventDefault();
    const templates = draft
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    setProviderNoteTemplates(templates);
    setDraft(templates.join("\n"));
    setMessage("Templates saved locally (demo only).");
  }

  return (
    <div data-testid="provider-templates">
      <div className="admin-header">
        <div>
          <h1>Note templates</h1>
          <p>
            Reusable administrative snippets for case notes. Not diagnoses, eligibility decisions, or
            prescriptions.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <form className="admin-form" onSubmit={handleSave}>
          <label>
            One template per line
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={8}
              data-testid="provider-templates-input"
            />
          </label>
          <div className="admin-actions">
            <button className="btn btn-primary" type="submit">
              Save templates
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setDraft(DEFAULT_PROVIDER_NOTE_TEMPLATES.join("\n"));
                setProviderNoteTemplates([...DEFAULT_PROVIDER_NOTE_TEMPLATES]);
                setMessage("Restored default templates.");
              }}
            >
              Reset defaults
            </button>
          </div>
        </form>
        {message ? <p className="toast-ok">{message}</p> : null}
      </div>
    </div>
  );
}
