/** Shared types for the nonclinical site support assistant shell. */

export type FaqCategory =
  | "website"
  | "membership"
  | "navigation"
  | "account"
  | "policies"
  | "general";

export type KnowledgeEntry = {
  id: string;
  category: FaqCategory;
  /** Human-facing question shown as a chip / match title. */
  question: string;
  /** Answer copy — website/membership/nav only; never clinical. */
  answer: string;
  /** Lowercase keyword/phrases used by the rule-based matcher. */
  keywords: string[];
  /** Optional in-app deep links suggested with the answer. */
  links?: { to: string; label: string }[];
};

export type MatchKind = "faq" | "clinical_refusal" | "no_match" | "escalate";

export type AssistantMatch = {
  kind: MatchKind;
  /** Primary reply shown in the chat panel. */
  message: string;
  /** Matched FAQ when kind === "faq". */
  entry?: KnowledgeEntry;
  /** Rank score from the local matcher (higher = better). */
  score?: number;
  /** Whether the reply came from an external API (always false when fail-closed). */
  source: "local" | "api";
  /** When true, show escalate CTAs under the reply. */
  showEscalate?: boolean;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  body: string;
  createdAt: string;
  /** Matched entry id when the reply is FAQ-backed. */
  entryId?: string;
  links?: { to: string; label: string }[];
  /** When true, show escalate CTAs under the message. */
  showEscalate?: boolean;
};
