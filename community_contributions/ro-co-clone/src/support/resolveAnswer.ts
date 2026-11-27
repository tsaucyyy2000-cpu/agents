import { matchLocalFaq, isClinicalRequest } from "./matchFaq";
import { CLINICAL_REFUSAL_MESSAGE } from "./knowledgeBase";
import type { AssistantMatch } from "./types";

/**
 * Optional remote assistant endpoint.
 * When unset, empty, or failing — always fall back to the local FAQ matcher (fail closed).
 *
 * Env (build-time Vite):
 *   VITE_SUPPORT_ASSISTANT_API_URL  — POST JSON `{ "message": string }` expecting
 *                                     `{ "reply": string }` or `{ "message": string }`.
 *   VITE_SUPPORT_ASSISTANT_API_KEY  — optional Bearer token (never required for local FAQ).
 *
 * Clinical requests are refused locally and never forwarded to the API.
 */
export function supportAssistantApiUrl(): string {
  const raw = import.meta.env.VITE_SUPPORT_ASSISTANT_API_URL;
  if (typeof raw !== "string") return "";
  return raw.trim();
}

export function isSupportAssistantApiConfigured(): boolean {
  return supportAssistantApiUrl().length > 0;
}

function apiKey(): string {
  const raw = import.meta.env.VITE_SUPPORT_ASSISTANT_API_KEY;
  if (typeof raw !== "string") return "";
  return raw.trim();
}

type ApiPayload = {
  reply?: unknown;
  message?: unknown;
  kind?: unknown;
};

function parseApiPayload(data: ApiPayload): AssistantMatch | null {
  const text =
    (typeof data.reply === "string" && data.reply.trim()) ||
    (typeof data.message === "string" && data.message.trim()) ||
    "";
  if (!text) return null;
  // Never accept API text that looks like clinical advice slipped through.
  if (isClinicalRequest(text)) {
    return {
      kind: "clinical_refusal",
      message: CLINICAL_REFUSAL_MESSAGE,
      source: "local",
      showEscalate: true,
    };
  }
  return {
    kind: typeof data.kind === "string" && data.kind === "escalate" ? "escalate" : "faq",
    message: text,
    source: "api",
    showEscalate: data.kind === "escalate",
  };
}

/**
 * Resolve an assistant reply. Prefer local FAQ; optionally try a remote API and
 * fail closed to local on any error, timeout, or missing config.
 */
export async function resolveAssistantAnswer(
  query: string,
  options?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<AssistantMatch> {
  const local = matchLocalFaq(query);

  // Clinical refusals and strong local FAQ hits stay local — no API round-trip.
  if (local.kind === "clinical_refusal") return local;
  if (local.kind === "faq" && (local.score ?? 0) >= 4) return local;

  const url = supportAssistantApiUrl();
  if (!url) return local;

  const timeoutMs = options?.timeoutMs ?? 4000;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  options?.signal?.addEventListener("abort", onAbort);

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const key = apiKey();
    if (key) headers.Authorization = `Bearer ${key}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: query.trim(), mode: "nonclinical-site-faq" }),
      signal: controller.signal,
    });

    if (!res.ok) return local;
    const data = (await res.json()) as ApiPayload;
    const parsed = parseApiPayload(data);
    return parsed ?? local;
  } catch {
    return local;
  } finally {
    window.clearTimeout(timer);
    options?.signal?.removeEventListener("abort", onAbort);
  }
}
