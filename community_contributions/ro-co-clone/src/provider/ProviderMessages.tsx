import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAllThreads,
  subscribeSupportStore,
  type SupportThread,
} from "../messaging/supportStore";

const STATUS_LABEL: Record<SupportThread["status"], string> = {
  open: "Open",
  pending: "Pending",
  closed: "Closed",
};

/**
 * Messaging handoff — links into the existing support queue, not clinical chat.
 */
export function ProviderMessages() {
  const [threads, setThreads] = useState<SupportThread[]>([]);

  useEffect(() => {
    const refresh = () => setThreads(listAllThreads());
    refresh();
    return subscribeSupportStore(refresh);
  }, []);

  return (
    <div data-testid="provider-messages">
      <div className="admin-header">
        <div>
          <h1>Messaging handoff</h1>
          <p>
            Support threads from the patient messaging shell. This is{" "}
            <strong>not</strong> provider clinical messaging — reply in the staff support queue.
          </p>
        </div>
        <Link className="btn btn-primary" to="/admin/messages">
          Open support queue
        </Link>
      </div>

      <div className="admin-panel">
        {threads.length === 0 ? (
          <p className="provider-empty">
            No support threads in this browser yet. Patients compose at{" "}
            <Link to="/account/messages">/account/messages</Link>. Staff reply at{" "}
            <Link to="/admin/messages">/admin/messages</Link>.
          </p>
        ) : (
          <div className="provider-thread-list">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                className="provider-thread-card"
                to="/admin/messages"
                data-testid={`provider-thread-${thread.id}`}
              >
                <strong>{thread.subject}</strong>
                <span>
                  {thread.patientLabel} · {STATUS_LABEL[thread.status]} ·{" "}
                  {new Date(thread.updatedAt).toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
