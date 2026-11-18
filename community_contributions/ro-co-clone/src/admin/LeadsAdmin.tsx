import { useContent } from "../data/ContentContext";

export function LeadsAdmin() {
  const { content, updateLeadStatus } = useContent();

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Leads</h1>
          <p>Visit submissions stored in localStorage only.</p>
        </div>
      </div>

      <div className="admin-panel">
        {content.leads.length === 0 ? (
          <p>No leads yet. Complete a visit at /visit to create one.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Goal</th>
                <th>State</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {content.leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{new Date(lead.createdAt).toLocaleString()}</td>
                  <td>{lead.goal}</td>
                  <td>{lead.state || "—"}</td>
                  <td>{lead.status}</td>
                  <td>
                    <div className="admin-actions">
                      {(["new", "reviewed", "closed"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => updateLeadStatus(lead.id, status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
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
