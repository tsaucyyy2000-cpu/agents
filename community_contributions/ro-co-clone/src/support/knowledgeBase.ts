import type { KnowledgeEntry } from "./types";

/**
 * Local nonclinical knowledge base for the site support assistant.
 * Covers website navigation, membership sandbox, account help, and policies.
 * Never invents prescriptions, diagnoses, or medical advice.
 */
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "kb-real-site",
    category: "general",
    question: "Is this a real telehealth service?",
    answer:
      "No. This is a marketing SPA for layout and funnel review. It does not diagnose, treat, prescribe, or bill insurance. Verified prices and clinician bios stay gated until supplied.",
    keywords: [
      "real",
      "telehealth",
      "live",
      "actual",
      "official",
      "ro.co",
      "affiliated",
      "prescription service",
    ],
    links: [
      { to: "/about", label: "About this clone" },
      { to: "/help", label: "Help center" },
    ],
  },
  {
    id: "kb-start",
    category: "navigation",
    question: "Where should I start?",
    answer:
      "Pick a care area on Home, start the matching quiz, then continue into the shared visit. Optional coverage check and plan review come after. Membership comparison is a separate sandbox path.",
    keywords: ["start", "begin", "get started", "where do i", "first step", "how to begin"],
    links: [
      { to: "/#find-care", label: "Choose a care area" },
      { to: "/how-it-works", label: "How care works" },
    ],
  },
  {
    id: "kb-nav-care",
    category: "navigation",
    question: "How do I find a care area?",
    answer:
      "Use Home → Find care, or open Weight, Sexual health, Hair, or Skin from the header. Each landing links to its quiz.",
    keywords: [
      "care area",
      "find care",
      "weight",
      "hair",
      "skin",
      "sexual health",
      "category",
      "aisle",
    ],
    links: [
      { to: "/#find-care", label: "Find care" },
      { to: "/weight-loss", label: "Weight care" },
    ],
  },
  {
    id: "kb-quiz-visit",
    category: "website",
    question: "How does the quiz and visit funnel work?",
    answer:
      "Quizzes are consent-gated and resume in this browser’s localStorage. After a quiz you continue to Visit → optional Coverage check → Plan review. Nothing is sent to a clinic API.",
    keywords: ["quiz", "visit", "funnel", "intake", "how it works", "coverage", "plan review"],
    links: [
      { to: "/how-it-works", label: "How care works" },
      { to: "/visit", label: "Visit intake" },
    ],
  },
  {
    id: "kb-membership",
    category: "membership",
    question: "How does membership work here?",
    answer:
      "Membership is a labeled sandbox: compare placeholder plans on /membership, then try sandbox checkout. Care-membership fees stay TBD and are separate from medication costs. No Stripe, no real charge.",
    keywords: [
      "membership",
      "plan",
      "plans",
      "subscribe",
      "subscription",
      "monthly",
      "quarterly",
      "annual",
      "sandbox checkout",
      "billing",
    ],
    links: [
      { to: "/membership", label: "Compare plans" },
      { to: "/membership/checkout", label: "Sandbox checkout" },
    ],
  },
  {
    id: "kb-pricing",
    category: "membership",
    question: "Why aren’t prices shown?",
    answer:
      "Verified dollar amounts are withheld until approved figures are supplied. Cards and membership rows show pricing pending — not invented totals.",
    keywords: ["price", "pricing", "cost", "how much", "dollar", "fee", "fees", "charges"],
    links: [
      { to: "/membership", label: "Membership plans" },
      { to: "/checkout", label: "Plan review" },
    ],
  },
  {
    id: "kb-account",
    category: "account",
    question: "How do I sign in or open my account?",
    answer:
      "Use Account / Sign in in the header. When Clerk keys are configured you get a real sign-in; otherwise account routes stay fail-closed (design preview uses ?previewShell=1). Account data here is not a production PHI store.",
    keywords: ["account", "sign in", "sign up", "login", "log in", "profile", "password", "clerk"],
    links: [
      { to: "/sign-in", label: "Sign in" },
      { to: "/account", label: "Account" },
    ],
  },
  {
    id: "kb-messages",
    category: "account",
    question: "How do I message support?",
    answer:
      "Open Account → Messages for the support messaging shell (browser localStorage only). This assistant can escalate you there. Toasts never include message body or medical detail.",
    keywords: ["message", "messages", "messaging", "contact support", "ticket", "chat with support"],
    links: [{ to: "/account/messages", label: "Support messages" }],
  },
  {
    id: "kb-data",
    category: "website",
    question: "Where do my answers go?",
    answer:
      "Quiz answers, visit leads, CMS edits, support threads, and progress demos stay in this browser’s localStorage. Nothing is sent to a clinic or durable backend yet.",
    keywords: ["data", "answers", "localstorage", "privacy", "stored", "save", "where do my"],
    links: [
      { to: "/privacy", label: "Privacy stub" },
      { to: "/help", label: "Help center" },
    ],
  },
  {
    id: "kb-help-center",
    category: "navigation",
    question: "Where is the help center?",
    answer:
      "Open /help for categorized links (getting started, visit steps, care areas, safety stubs, policies) plus common FAQs. This floating assistant mirrors those website answers.",
    keywords: ["help", "help center", "faq", "faqs", "support page"],
    links: [{ to: "/help", label: "Help center" }],
  },
  {
    id: "kb-policies",
    category: "policies",
    question: "Where are privacy and terms?",
    answer:
      "Legal stubs live under Privacy, Terms, Cookie policy, Privacy choices, Consumer health data, and Disclosure. They are navigation stubs — not live counsel-reviewed notices.",
    keywords: [
      "privacy",
      "terms",
      "cookie",
      "legal",
      "policy",
      "policies",
      "disclosure",
      "consent",
    ],
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
  {
    id: "kb-safety",
    category: "website",
    question: "Where is safety information?",
    answer:
      "Use the Safety hub and ISI layout stubs for review only. They are illustrative placeholders — not prescribing information or clinical counseling.",
    keywords: ["safety", "isi", "important safety", "side effects page", "disclosures"],
    links: [
      { to: "/safety", label: "Safety hub" },
      { to: "/guides", label: "Health guides" },
    ],
  },
  {
    id: "kb-phone",
    category: "general",
    question: "Is there a phone line?",
    answer:
      "No phone line for this preview. Use this assistant for website FAQs, Account → Messages for support messaging, or email the ops address on the Help page. Do not send real patient information.",
    keywords: ["phone", "call", "hotline", "number", "speak to someone"],
    links: [
      { to: "/help", label: "Help & contact" },
      { to: "/account/messages", label: "Message support" },
    ],
  },
];

export const SUGGESTED_PROMPTS: string[] = [
  "Where should I start?",
  "How does membership work?",
  "Why aren’t prices shown?",
  "How do I message support?",
];

export const WELCOME_MESSAGE =
  "Hi — I’m the site helper for website, membership, and navigation questions. I won’t diagnose or recommend prescriptions. Ask a question or pick a suggestion below.";

export const CLINICAL_REFUSAL_MESSAGE =
  "I can’t help with diagnoses, symptoms, dosing, or prescription recommendations. For site navigation or membership questions I’m happy to help; for personal medical questions talk with a licensed clinician. You can also message support about nonclinical account topics.";

export const NO_MATCH_MESSAGE =
  "I don’t have a local FAQ match for that. Try rephrasing a website, membership, or navigation question — or escalate to support messaging.";

export const ESCALATE_HINT =
  "Need a human? Open Account → Messages (local demo store) or email the ops address from Help. Do not send real patient information.";
