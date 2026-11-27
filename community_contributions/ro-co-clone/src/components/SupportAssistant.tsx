import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { isClerkConfigured } from "../auth/clerkConfig";
import { useContent } from "../data/ContentContext";
import {
  ESCALATE_HINT,
  SUGGESTED_PROMPTS,
  WELCOME_MESSAGE,
} from "../support/knowledgeBase";
import {
  isSupportAssistantApiConfigured,
  resolveAssistantAnswer,
} from "../support/resolveAnswer";
import type { ChatMessage } from "../support/types";
import "./SupportAssistant.css";

function newMsgId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `sa-${crypto.randomUUID()}`;
  }
  return `sa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function messagesPath(): string {
  return isClerkConfigured()
    ? "/account/messages"
    : "/account/messages?previewShell=1";
}

function toChatFromMatch(
  match: Awaited<ReturnType<typeof resolveAssistantAnswer>>,
): Omit<ChatMessage, "id" | "createdAt"> {
  const links = match.entry?.links;
  const showEscalate =
    match.showEscalate ||
    match.kind === "no_match" ||
    match.kind === "clinical_refusal" ||
    match.kind === "escalate";

  return {
    role: "assistant",
    body: match.message,
    entryId: match.entry?.id,
    links,
    showEscalate,
  };
}

export function SupportAssistant() {
  const { t } = useTranslation("common");
  const titleId = useId();
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const { content } = useContent();
  const supportEmail = content.settings.supportEmail || "ops@clone.local";

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "system",
      body: WELCOME_MESSAGE,
      createdAt: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  async function ask(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;

    const userMsg: ChatMessage = {
      id: newMsgId(),
      role: "user",
      body: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    try {
      const match = await resolveAssistantAnswer(text);
      const partial = toChatFromMatch(match);
      const reply: ChatMessage = {
        id: newMsgId(),
        createdAt: new Date().toISOString(),
        ...partial,
      };
      setMessages((prev) => [...prev, reply]);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  const apiOn = isSupportAssistantApiConfigured();
  const escalateTo = messagesPath();

  return (
    <div className="support-assistant" data-testid="support-assistant">
      {open ? (
        <div
          className="support-assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          data-testid="support-assistant-panel"
        >
          <header className="support-assistant-head">
            <div>
              <p className="support-assistant-kicker">{t("support.kicker")}</p>
              <h2 id={titleId}>{t("support.title")}</h2>
            </div>
            <button
              type="button"
              className="support-assistant-close"
              aria-label={t("support.closeAria")}
              data-testid="support-assistant-close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <p className="support-assistant-disclaimer">{t("support.disclaimer")}</p>

          <div
            className="support-assistant-messages"
            ref={listRef}
            data-testid="support-assistant-messages"
            aria-live="polite"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="support-assistant-bubble"
                data-role={msg.role}
                data-testid={
                  msg.role === "assistant" || msg.role === "system"
                    ? "support-assistant-reply"
                    : "support-assistant-user"
                }
              >
                <p>{msg.body}</p>
                {msg.links && msg.links.length > 0 ? (
                  <ul className="support-assistant-links">
                    {msg.links.map((link) => (
                      <li key={`${msg.id}-${link.to}`}>
                        <Link to={link.to} onClick={() => setOpen(false)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {msg.showEscalate ? (
                  <div className="support-assistant-escalate">
                    <Link
                      to={escalateTo}
                      data-testid="support-assistant-escalate-messages"
                      onClick={() => setOpen(false)}
                    >
                      {t("support.messageSupport")}
                    </Link>
                    <a href={`mailto:${supportEmail}`} data-testid="support-assistant-escalate-email">
                      {t("support.emailOps")}
                    </a>
                    <p className="support-assistant-meta">{ESCALATE_HINT}</p>
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? (
              <div className="support-assistant-bubble" data-role="assistant" aria-busy="true">
                <p>{t("support.lookingUp")}</p>
              </div>
            ) : null}
          </div>

          <div className="support-assistant-suggestions" aria-label={t("support.suggestionsAria")}>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="support-assistant-chip"
                data-testid="support-assistant-chip"
                disabled={busy}
                onClick={() => void ask(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <p className="support-assistant-status" data-testid="support-assistant-mode">
            {apiOn ? t("support.modeApi") : t("support.modeLocal")}
          </p>

          <form className="support-assistant-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor={inputId}>
              {t("support.inputLabel")}
            </label>
            <input
              id={inputId}
              data-testid="support-assistant-input"
              type="text"
              autoComplete="off"
              placeholder={t("support.placeholder")}
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              data-testid="support-assistant-send"
              disabled={busy || !input.trim()}
            >
              {t("support.ask")}
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className="support-assistant-launch"
        data-testid="support-assistant-launch"
        aria-expanded={open}
        aria-controls={open ? undefined : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="support-assistant-launch-dot" aria-hidden="true" />
        <span className="support-assistant-launch-label">
          {open ? t("support.launchClose") : t("support.launchOpen")}
        </span>
      </button>
    </div>
  );
}
