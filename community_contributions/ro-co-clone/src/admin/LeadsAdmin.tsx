import { useContent } from "../data/ContentContext";
import {
  WORKFLOW_STATUSES,
  workflowLabel,
  type WorkflowStatus,
} from "../data/workflowStates";

export function LeadsAdmin() {
  const { content, updateLeadStatus } = useContent();

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Submissions</h1>
          <p>
            Visit and quiz intakes stored in this browser only. Workflow status is{" "}
            <strong>admin-set</strong> — changing it never implies an AI or clinician auto-decision.
          </p>
        </div>
      </div>

      <div className="admin-panel" data-testid="admin-submissions">
        {content.leads.length === 0 ? (
          <p>No submissions yet. Complete a quiz review or /visit to create one.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Source</th>
                <th>Goal</th>
                <th>State</th>
                <th>Workflow</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {content.leads.map((lead) => (
                <tr key={lead.id} data-testid={`submission-row-${lead.id}`}>
                  <td>{new Date(lead.createdAt).toLocaleString()}</td>
                  <td>{lead.source ?? "visit"}{lead.quizSlug ? ` · ${lead.quizSlug}` : ""}</td>
                  <td>{lead.goal}</td>
                  <td>{lead.state || "—"}</td>
                  <td>
                    <label className="admin-workflow-select">
                      <span className="sr-only">Workflow status</span>
                      <select
                        value={lead.status}
                        aria-label={`Workflow for ${lead.goal}`}
                        onChange={(event) =>
                          updateLeadStatus(lead.id, event.target.value as WorkflowStatus)
                        }
                      >
                        {WORKFLOW_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {workflowLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="admin-workflow-hint">UI label only · no clinical decision</p>
                  </td>
                  <td>
                    <div className="admin-lead-notes">{lead.notes}</div>
                    {lead.answers && Object.keys(lead.answers).length > 0 ? (
                      <details>
                        <summary>Demo answers</summary>
                        <ul>
                          {Object.entries(lead.answers).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {value}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
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
