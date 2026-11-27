import { KNOWLEDGE_BASE, CLINICAL_REFUSAL_MESSAGE, NO_MATCH_MESSAGE } from "./knowledgeBase";
import type { AssistantMatch, KnowledgeEntry } from "./types";

/** Minimum score for a local FAQ hit (keyword hits + phrase bonuses). */
const MATCH_THRESHOLD = 2;

/**
 * Patterns that indicate the user wants clinical advice.
 * Matched questions are refused — never answered with invented medical content.
 */
const CLINICAL_PATTERNS: RegExp[] = [
  /\bdiagnos(e|is|ed|ing)\b/i,
  /\b(what('s| is) wrong with me|do i have)\b/i,
  /\b(my )?symptom(s)?\b/i,
  /\b(prescrib(e|ed|ing)|write me (an? )?rx|need (a )?prescription for)\b/i,
  /\b(what|which) (prescription|rx)\b/i,
  /\b(dos(e|age|ing)|how many mg|milligram)\b/i,
  /\b(which|what)\s+(drug|medication|medicine|pill|meds?)\b/i,
  /\b(should i take|can i take|is it safe (for me )?to take)\b/i,
  /\b(recommend( a)? (drug|medication|medicine|treatment|dose))\b/i,
  /\b(treat(ment)? for my|cure my)\b/i,
  /\b(side effects? of|will .+ cause)\b/i,
  /\b(glp-?1|semaglutide|tirzepatide|minoxidil|sildenafil|tadalafil)\b.*\b(dose|how much|should i)\b/i,
  /\b(blood pressure|lab result|lab results|test result)\b.*\b(mean|interpret|normal)\b/i,
];

export function isClinicalRequest(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return CLINICAL_PATTERNS.some((re) => re.test(trimmed));
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'#\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(query: string, entry: KnowledgeEntry): number {
  const q = normalize(query);
  if (!q) return 0;
  let score = 0;
  const qWords = new Set(q.split(" ").filter((w) => w.length > 2));

  for (const kw of entry.keywords) {
    const k = normalize(kw);
    if (!k) continue;
    if (k.includes(" ") || k.length > 8) {
      if (q.includes(k)) score += 3;
    } else if (qWords.has(k) || q.includes(k)) {
      score += 1;
    }
  }

  const qNorm = normalize(entry.question);
  if (qNorm && (q.includes(qNorm) || qNorm.includes(q))) {
    score += 4;
  } else {
    const qTokens = qNorm.split(" ").filter((w) => w.length > 3);
    let overlap = 0;
    for (const t of qTokens) {
      if (qWords.has(t) || q.includes(t)) overlap += 1;
    }
    if (overlap >= 2) score += overlap;
  }

  return score;
}

export function matchLocalFaq(query: string): AssistantMatch {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      kind: "no_match",
      message: NO_MATCH_MESSAGE,
      source: "local",
      showEscalate: true,
    };
  }

  if (isClinicalRequest(trimmed)) {
    return {
      kind: "clinical_refusal",
      message: CLINICAL_REFUSAL_MESSAGE,
      source: "local",
      showEscalate: true,
    };
  }

  let best: { entry: KnowledgeEntry; score: number } | null = null;
  for (const entry of KNOWLEDGE_BASE) {
    const score = scoreEntry(trimmed, entry);
    if (!best || score > best.score) best = { entry, score };
  }

  if (best && best.score >= MATCH_THRESHOLD) {
    return {
      kind: "faq",
      message: best.entry.answer,
      entry: best.entry,
      score: best.score,
      source: "local",
    };
  }

  return {
    kind: "no_match",
    message: NO_MATCH_MESSAGE,
    source: "local",
    score: best?.score ?? 0,
    showEscalate: true,
  };
}

/** Re-export threshold for tests / docs. */
export const LOCAL_MATCH_THRESHOLD = MATCH_THRESHOLD;
