import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useUser } from "@clerk/react";
import { useContent } from "../data/ContentContext";
import { isClerkConfigured } from "../auth/clerkConfig";
import {
  WORKFLOW_STATUSES,
  workflowLabel,
  type WorkflowStatus,
} from "../data/workflowStates";
import { withProviderPreview } from "./ProviderLayout";

function ProviderCaseDetailView({
  preview,
  authorLabel,
}: {
  preview: boolean;
  authorLabel: string;
}) {
  const { caseId = "" } = useParams();
  const location = useLocation();
  const isPreview = preview || new URLSearchParams(location.search).get("previewShell") === "1";
  const { content, updateLeadStatus, appendProviderNote } = useContent();
  const [noteBody, setNoteBody] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const lead = useMemo(
    () => content.leads.find((item) => item.id === caseId),
    [content.leads, caseId],
  );

  const backHref = isPreview ? withProviderPreview("/provider") : "/provider";
  const messagesHref = isPreview
    ? withProviderPreview("/provider/messages")
    : "/provider/messages";

  if (!lead) {
    return <Navigate to={backHref} replace />;
  }

  const caseLead = lead;

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function handleNote(event: FormEvent) {
    event.preventDefault();
    const note = appendProviderNote(caseLead.id, noteBody, authorLabel);
    if (!note) return;
    setNoteBody("");
    flash("Local note saved (demo only — not a chart).");
  }

  function applyTemplate(template: string) {
    setNoteBody(template);
  }

  return (
    <div data-testid="provider-case-detail">
      <div className="admin-header">
        <div>
          <p className="provider-demo-chip" style={{ marginBottom: "0.5rem" }}>
            Case · local lead · no Rx
          </p>
          <h1>Intake review</h1>
          <p>
            {caseLead.goal}
            {caseLead.state ? ` · ${caseLead.state}` : ""} · {caseLead.source ?? "visit"}
            {caseLead.quizSlug ? ` · ${caseLead.quizSlug}` : ""}
          </p>
        </div>
        <Link className="btn btn-secondary" to={backHref}>
          ← Worklist
        </Link>
      </div>

      <div className="provider-case-grid">
        <div className="admin-panel">
          <h2>Demo answers</h2>
          {caseLead.answers && Object.keys(caseLead.answers).length > 0 ? (
            <ul className="provider-answers">
              {Object.entries(caseLead.answers).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}</strong>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="provider-empty">
              No structured quiz answers on this lead. Visit notes: {caseLead.notes || "—"}
            </p>
          )}
          {caseLead.notes ? (
            <p style={{ marginTop: "1rem", color: "var(--color-ink-muted)" }}>
              <strong>Submission notes:</strong> {caseLead.notes}
            </p>
          ) : null}
        </div>

        <div className="admin-panel">
          <h2>Workflow status</h2>
          <p className="admin-workflow-hint" style={{ marginBottom: "0.75rem" }}>
            Same admin workflow labels as Submissions — UI only · no clinical decision · cannot
            prescribe.
          </p>
          <label className="admin-workflow-select">
            <span className="sr-only">Workflow status</span>
            <select
              value={caseLead.status}
              aria-label="Workflow status"
              data-testid="provider-case-status"
              onChange={(event) =>
                updateLeadStatus(caseLead.id, event.target.value as WorkflowStatus)
              }
            >
              {WORKFLOW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {workflowLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <h2 style={{ marginTop: "1.25rem" }}>Provider notes (local)</h2>
          {content.providerNoteTemplates.length > 0 ? (
            <div className="provider-template-row">
              {content.providerNoteTemplates.map((template) => (
                <button
                  key={template}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => applyTemplate(template)}
                  title={template}
                >
                  {template.length > 42 ? `${template.slice(0, 42)}…` : template}
                </button>
              ))}
            </div>
          ) : null}

          <ul className="provider-note-list">
            {(caseLead.providerNotes ?? []).length === 0 ? (
              <li className="provider-empty">No provider notes yet.</li>
            ) : (
              (caseLead.providerNotes ?? []).map((note) => (
                <li key={note.id}>
                  <time dateTime={note.createdAt}>
                    {new Date(note.createdAt).toLocaleString()} · {note.authorLabel}
                  </time>
                  <div>{note.body}</div>
                </li>
              ))
            )}
          </ul>

          <form className="admin-form" onSubmit={handleNote}>
            <label>
              Add note
              <textarea
                data-testid="provider-note-input"
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
                placeholder="Administrative note only — not a prescription or diagnosis"
                required
              />
            </label>
            <button className="btn btn-primary" type="submit" data-testid="provider-note-save">
              Save local note
            </button>
          </form>
          {toast ? <p className="toast-ok">{toast}</p> : null}

          <p style={{ marginTop: "1rem" }}>
            <Link className="btn btn-secondary" to={messagesHref}>
              Open messaging handoff
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ProviderCaseDetailLive() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "provider";
  return <ProviderCaseDetailView preview={false} authorLabel={email} />;
}

export function ProviderCaseDetail({ preview = false }: { preview?: boolean }) {
  if (preview || !isClerkConfigured()) {
    return <ProviderCaseDetailView preview authorLabel="preview@provider.local" />;
  }
  return <ProviderCaseDetailLive />;
}
