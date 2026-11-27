import { Link, useLocation } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { workflowLabel } from "../data/workflowStates";
import { withProviderPreview } from "./ProviderLayout";

function caseHref(id: string, preview: boolean): string {
  const path = `/provider/cases/${id}`;
  return preview ? withProviderPreview(path) : path;
}

export function ProviderWorklist({ preview = false }: { preview?: boolean }) {
  const { content } = useContent();
  const location = useLocation();
  const isPreview = preview || new URLSearchParams(location.search).get("previewShell") === "1";
  const leads = content.leads;

  const awaiting = leads.filter(
    (lead) =>
      lead.status === "submitted" ||
      lead.status === "awaiting_review" ||
      lead.status === "under_clinician_review" ||
      lead.status === "more_information_required",
  ).length;

  return (
    <div data-testid="provider-worklist">
      <div className="admin-header">
        <div>
          <h1>Worklist</h1>
          <p>
            Quiz and visit submissions from this browser&apos;s local leads store. Status labels are
            administrative UI only — never an auto clinical decision.
          </p>
        </div>
      </div>

      <div className="provider-worklist-meta">
        <div className="provider-stat">
          <span>Total submissions</span>
          <strong>{leads.length}</strong>
        </div>
        <div className="provider-stat">
          <span>Needs attention</span>
          <strong>{awaiting}</strong>
        </div>
      </div>

      <div className="admin-panel">
        {leads.length === 0 ? (
          <p className="provider-empty">
            No submissions yet. Complete a quiz review or <Link to="/visit">/visit</Link> to create a
            local lead. This portal does not invent patient cases.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Source</th>
                <th>Goal</th>
                <th>State</th>
                <th>Workflow</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} data-testid={`provider-row-${lead.id}`}>
                  <td>{new Date(lead.createdAt).toLocaleString()}</td>
                  <td>
                    {lead.source ?? "visit"}
                    {lead.quizSlug ? ` · ${lead.quizSlug}` : ""}
                  </td>
                  <td>{lead.goal}</td>
                  <td>{lead.state || "—"}</td>
                  <td>{workflowLabel(lead.status)}</td>
                  <td>
                    <Link className="btn btn-secondary" to={caseHref(lead.id, isPreview)}>
                      Open case
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
