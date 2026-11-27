import { useEffect, useId, useState, type FormEvent } from "react";
import {
  SAFE_NOTIFY,
  SUPPORT_STORE_KEY,
  createThread,
  formatBytes,
  listThreadsForPatient,
  noteAttachmentStub,
  replyToThread,
  subscribeSupportStore,
  type AttachmentMeta,
  type SupportThread,
  type ThreadStatus,
} from "../messaging/supportStore";

type AccountMessagesProps = {
  patientKey: string;
  patientLabel: string;
  preview?: boolean;
};

const STATUS_LABEL: Record<ThreadStatus, string> = {
  open: "Open",
  pending: "Pending reply",
  closed: "Closed",
};

function statusChipClass(status: ThreadStatus): string {
  if (status === "closed") return "account-chip account-chip-warn";
  if (status === "pending") return "account-chip account-chip-peach";
  return "account-chip account-chip-mint";
}

export function AccountMessages({
  patientKey,
  patientLabel,
  preview = false,
}: AccountMessagesProps) {
  const formId = useId();
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reply, setReply] = useState("");
  const [attachment, setAttachment] = useState<AttachmentMeta | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [attachNotice, setAttachNotice] = useState<string | null>(null);

  function refresh() {
    const next = listThreadsForPatient(patientKey);
    setThreads(next);
    setSelectedId((prev) => {
      if (prev && next.some((t) => t.id === prev)) return prev;
      return next[0]?.id ?? null;
    });
  }

  useEffect(() => {
    refresh();
    return subscribeSupportStore(refresh);
    // patientKey identity is the filter key
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh closes over patientKey
  }, [patientKey]);

  function flash(safeCopy: string) {
    setToast(safeCopy);
    window.setTimeout(() => setToast(null), 2800);
  }

  function onPickFile(fileList: FileList | null) {
    const file = fileList?.[0];
    const result = noteAttachmentStub(file);
    if (!result.ok) {
      setAttachment(null);
      setAttachNotice(result.notice);
      return;
    }
    setAttachment(result.meta);
    setAttachNotice(result.notice);
  }

  function resetCompose() {
    setSubject("");
    setBody("");
    setAttachment(null);
    setAttachNotice(null);
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const thread = createThread({
      patientKey,
      patientLabel,
      subject: subject.trim() || "Support request",
      body: body.trim(),
      ...(attachment ? { attachment } : {}),
    });
    resetCompose();
    setComposing(false);
    setSelectedId(thread.id);
    refresh();
    // Safe toast — never includes subject/body (may contain medical detail).
    flash(SAFE_NOTIFY.patientSent);
  }

  function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    replyToThread({
      threadId: selectedId,
      author: "patient",
      body: reply.trim(),
      ...(attachment ? { attachment } : {}),
    });
    setReply("");
    setAttachment(null);
    setAttachNotice(null);
    refresh();
    flash(SAFE_NOTIFY.patientSent);
  }

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="account-section" data-testid="account-messages">
      <header className="account-section-head">
        <p className="section-kicker">Messages</p>
        <h2>Support messaging</h2>
        <p>
          Message the support team about billing, shipping, or account questions. This is a{" "}
          <strong>localStorage demo shell</strong> (<code>{SUPPORT_STORE_KEY}</code>) — not durable
          clinical messaging, SMS, or email. Toast previews never include message text.
          {preview ? " Preview mode writes to this browser only." : null}
        </p>
      </header>

      <div className="account-chip-row" aria-label="Messaging shell labels">
        <span className="account-chip account-chip-mint">localStorage · non-durable</span>
        <span className="account-chip account-chip-peach">No PHI in notifications</span>
        <span className="account-chip account-chip-warn">Not clinical messaging</span>
      </div>

      {toast ? (
        <p className="msg-toast" role="status" data-testid="messages-toast">
          {toast}
        </p>
      ) : null}

      <div className="msg-shell">
        <aside className="account-card msg-list-panel" data-testid="messages-thread-list">
          <div className="msg-list-head">
            <h3>Your threads</h3>
            <button
              type="button"
              className="btn btn-primary"
              data-testid="messages-compose-open"
              onClick={() => {
                setComposing(true);
                setSelectedId(null);
                resetCompose();
              }}
            >
              New message
            </button>
          </div>

          {threads.length === 0 && !composing ? (
            <div className="account-activity-empty" data-testid="messages-empty">
              <p className="account-empty-kicker">No conversations yet</p>
              <p>
                Start a support thread when you have an account or billing question. Do not send
                diagnoses, lab results, or other medical detail here — this SPA is not a clinic chart.
              </p>
            </div>
          ) : (
            <ul className="msg-thread-list">
              {threads.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    className={
                      selectedId === thread.id && !composing
                        ? "msg-thread-item is-active"
                        : "msg-thread-item"
                    }
                    data-testid={`messages-thread-${thread.id}`}
                    onClick={() => {
                      setComposing(false);
                      setSelectedId(thread.id);
                      setAttachment(null);
                      setAttachNotice(null);
                    }}
                  >
                    <strong>{thread.subject}</strong>
                    <span className={statusChipClass(thread.status)}>
                      {STATUS_LABEL[thread.status]}
                    </span>
                    <em>
                      Updated {new Date(thread.updatedAt).toLocaleString()} ·{" "}
                      {thread.messages.length} message
                      {thread.messages.length === 1 ? "" : "s"}
                    </em>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="account-card msg-detail-panel" data-testid="messages-detail">
          {composing ? (
            <>
              <h3>Compose</h3>
              <p className="account-card-lede">
                Keep this to account and logistics questions. Avoid clinical detail — notifications
                and this demo store are not HIPAA-ready.
              </p>
              <form className="msg-compose" onSubmit={handleCreate} data-testid="messages-compose">
                <label htmlFor={`${formId}-subject`}>
                  Subject
                  <input
                    id={`${formId}-subject`}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Billing question"
                    maxLength={120}
                    data-testid="messages-subject"
                  />
                </label>
                <label htmlFor={`${formId}-body`}>
                  Message
                  <textarea
                    id={`${formId}-body`}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    required
                    placeholder="How can support help?"
                    data-testid="messages-body"
                  />
                </label>
                <AttachmentStub
                  formId={`${formId}-file`}
                  attachment={attachment}
                  notice={attachNotice}
                  onPick={onPickFile}
                  onClear={() => {
                    setAttachment(null);
                    setAttachNotice(null);
                  }}
                />
                <div className="account-toolbar">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-testid="messages-send"
                    disabled={!body.trim()}
                  >
                    Send to support
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setComposing(false);
                      resetCompose();
                      if (threads[0]) setSelectedId(threads[0].id);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : selected ? (
            <>
              <div className="msg-detail-head">
                <div>
                  <h3>{selected.subject}</h3>
                  <p className="account-card-lede">
                    Status: <span className={statusChipClass(selected.status)}>
                      {STATUS_LABEL[selected.status]}
                    </span>
                  </p>
                </div>
              </div>
              <ol className="msg-timeline" data-testid="messages-timeline">
                {selected.messages.map((msg) => (
                  <li
                    key={msg.id}
                    className={
                      msg.author === "patient" ? "msg-bubble msg-bubble-patient" : "msg-bubble"
                    }
                  >
                    <header>
                      <strong>{msg.author === "patient" ? "You" : "Support"}</strong>
                      <time dateTime={msg.createdAt}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </time>
                    </header>
                    <p>{msg.body}</p>
                    {msg.attachment ? (
                      <p className="msg-attach-meta">
                        Attachment stub: <code>{msg.attachment.fileName}</code> ·{" "}
                        {formatBytes(msg.attachment.sizeBytes)} · {msg.attachment.mimeType} (bytes
                        not stored)
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
              {selected.status === "closed" ? (
                <div className="callout">
                  <p>
                    This thread is closed. Sending a reply will reopen it as <strong>open</strong>{" "}
                    in this local demo store.
                  </p>
                </div>
              ) : null}
              <form className="msg-compose" onSubmit={handleReply} data-testid="messages-reply">
                <label htmlFor={`${formId}-reply`}>
                  Reply
                  <textarea
                    id={`${formId}-reply`}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    required
                    placeholder="Add a reply…"
                    data-testid="messages-reply-body"
                  />
                </label>
                <AttachmentStub
                  formId={`${formId}-reply-file`}
                  attachment={attachment}
                  notice={attachNotice}
                  onPick={onPickFile}
                  onClear={() => {
                    setAttachment(null);
                    setAttachNotice(null);
                  }}
                />
                <div className="account-toolbar">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-testid="messages-reply-send"
                    disabled={!reply.trim()}
                  >
                    Send reply
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="account-activity-empty">
              <p className="account-empty-kicker">Select or start a thread</p>
              <p>Choose a conversation on the left, or compose a new support message.</p>
            </div>
          )}
        </section>
      </div>

      <div className="callout warn">
        <p>
          <strong>Honesty note:</strong> Threads live only in this browser under{" "}
          <code>{SUPPORT_STORE_KEY}</code>. Clearing site data deletes them. No email/SMS provider
          is connected. Never put sensitive medical detail in toast or email-style previews — this
          UI only flashes generic status lines.
        </p>
      </div>
    </div>
  );
}

function AttachmentStub({
  formId,
  attachment,
  notice,
  onPick,
  onClear,
}: {
  formId: string;
  attachment: AttachmentMeta | null;
  notice: string | null;
  onPick: (files: FileList | null) => void;
  onClear: () => void;
}) {
  return (
    <div className="msg-attach" data-testid="messages-attach">
      <label htmlFor={formId} className="msg-attach-label">
        Attachment stub (metadata only)
        <input
          id={formId}
          type="file"
          onChange={(e) => {
            onPick(e.target.files);
            e.target.value = "";
          }}
          data-testid="messages-attach-input"
        />
      </label>
      {attachment ? (
        <p className="msg-attach-meta">
          Noted: <code>{attachment.fileName}</code> · {formatBytes(attachment.sizeBytes)} ·{" "}
          {attachment.mimeType}
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Remove stub
          </button>
        </p>
      ) : null}
      {notice ? (
        <p className="msg-attach-notice" role="status" data-testid="messages-attach-notice">
          {notice}
        </p>
      ) : (
        <p className="msg-attach-hint">
          Real medical document uploads are rejected with an honest notice. File bytes are never
          read or stored in this demo.
        </p>
      )}
    </div>
  );
}
