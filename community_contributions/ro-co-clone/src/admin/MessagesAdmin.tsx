import { useEffect, useId, useState, type FormEvent } from "react";
import {
  SAFE_NOTIFY,
  SUPPORT_STORE_KEY,
  formatBytes,
  listAllThreads,
  replyToThread,
  setThreadStatus,
  subscribeSupportStore,
  type SupportThread,
  type ThreadStatus,
} from "../messaging/supportStore";

const STATUS_OPTIONS: ThreadStatus[] = ["open", "pending", "closed"];

const STATUS_LABEL: Record<ThreadStatus, string> = {
  open: "Open",
  pending: "Pending",
  closed: "Closed",
};

export function MessagesAdmin() {
  const formId = useId();
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ThreadStatus>("all");
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function refresh() {
    const next = listAllThreads();
    setThreads(next);
    setSelectedId((prev) => {
      if (prev && next.some((t) => t.id === prev)) return prev;
      return next[0]?.id ?? null;
    });
  }

  useEffect(() => {
    refresh();
    return subscribeSupportStore(refresh);
  }, []);

  function flash(safeCopy: string) {
    setToast(safeCopy);
    window.setTimeout(() => setToast(null), 2800);
  }

  const filtered =
    filter === "all" ? threads : threads.filter((t) => t.status === filter);
  const selected = threads.find((t) => t.id === selectedId) ?? null;

  function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    replyToThread({
      threadId: selected.id,
      author: "support",
      body: reply.trim(),
      nextStatus: selected.status === "closed" ? "pending" : "pending",
    });
    setReply("");
    refresh();
    // Safe toast for staff UI — never includes message body.
    flash(SAFE_NOTIFY.supportReplied);
  }

  function handleStatus(status: ThreadStatus) {
    if (!selected) return;
    setThreadStatus(selected.id, status);
    refresh();
    flash(SAFE_NOTIFY.statusChanged);
  }

  const openCount = threads.filter((t) => t.status === "open").length;
  const pendingCount = threads.filter((t) => t.status === "pending").length;

  return (
    <div data-testid="admin-messages">
      <div className="admin-header">
        <div>
          <h1>Support messages</h1>
          <p>
            Patient ↔ support queue stored in <code>{SUPPORT_STORE_KEY}</code> only — non-durable
            demo. Toast/status flashes never include message text or medical detail.
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <span>Open</span>
          <strong>{openCount}</strong>
        </div>
        <div className="admin-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="admin-card">
          <span>Total threads</span>
          <strong>{threads.length}</strong>
        </div>
      </div>

      {toast ? (
        <p className="admin-msg-toast" role="status" data-testid="admin-messages-toast">
          {toast}
        </p>
      ) : null}

      <div className="admin-msg-shell">
        <div className="admin-panel admin-msg-queue" data-testid="admin-messages-queue">
          <div className="admin-msg-filters">
            <label>
              Status filter
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | ThreadStatus)}
                data-testid="admin-messages-filter"
              >
                <option value="all">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p data-testid="admin-messages-empty">
              No support threads yet. Patients create them from Account → Messages.
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Updated</th>
                  <th>Patient</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Msgs</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((thread) => (
                  <tr
                    key={thread.id}
                    className={selectedId === thread.id ? "admin-msg-row is-active" : "admin-msg-row"}
                    data-testid={`admin-thread-${thread.id}`}
                    onClick={() => setSelectedId(thread.id)}
                  >
                    <td>{new Date(thread.updatedAt).toLocaleString()}</td>
                    <td>
                      <div className="admin-msg-patient">
                        <strong>{thread.patientLabel}</strong>
                        <span>{thread.patientKey}</span>
                      </div>
                    </td>
                    <td>{thread.subject}</td>
                    <td>{STATUS_LABEL[thread.status]}</td>
                    <td>{thread.messages.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-panel admin-msg-detail" data-testid="admin-messages-detail">
          {selected ? (
            <>
              <div className="admin-msg-detail-head">
                <div>
                  <h2>{selected.subject}</h2>
                  <p>
                    {selected.patientLabel} · <code>{selected.patientKey}</code>
                  </p>
                </div>
                <div className="admin-actions" data-testid="admin-messages-status">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={
                        selected.status === status ? "btn btn-primary" : "btn btn-secondary"
                      }
                      onClick={() => handleStatus(status)}
                      data-testid={`admin-status-${status}`}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </div>

              <ol className="admin-msg-timeline">
                {selected.messages.map((msg) => (
                  <li key={msg.id}>
                    <header>
                      <strong>{msg.author === "patient" ? "Patient" : "Support"}</strong>
                      <time dateTime={msg.createdAt}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </time>
                    </header>
                    <p>{msg.body}</p>
                    {msg.attachment ? (
                      <p className="admin-msg-attach">
                        Stub: <code>{msg.attachment.fileName}</code> ·{" "}
                        {formatBytes(msg.attachment.sizeBytes)} · {msg.attachment.mimeType}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>

              <form className="admin-msg-reply" onSubmit={handleReply} data-testid="admin-messages-reply">
                <label htmlFor={`${formId}-reply`}>
                  Reply as support
                  <textarea
                    id={`${formId}-reply`}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    required
                    placeholder="Write a support reply…"
                    data-testid="admin-messages-reply-body"
                  />
                </label>
                <div className="admin-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!reply.trim()}
                    data-testid="admin-messages-reply-send"
                  >
                    Send reply
                  </button>
                </div>
                <p className="admin-msg-hint">
                  Sending sets status to <strong>pending</strong> (awaiting patient). Toast copy stays
                  generic — message text is never echoed into notifications.
                </p>
              </form>
            </>
          ) : (
            <p>Select a thread from the queue.</p>
          )}
        </div>
      </div>
    </div>
  );
}
