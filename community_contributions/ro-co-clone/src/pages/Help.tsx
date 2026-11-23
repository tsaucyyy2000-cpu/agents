import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import { quizPath } from "../utils/careRoutes";
import "./Help.css";
import "./InfoPage.css";

type HelpLink = { to: string; label: string; note?: string };

type HelpCategory = {
  id: string;
  title: string;
  dek: string;
  links: HelpLink[];
};

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "start",
    title: "Getting started",
    dek: "See how the care path is organized before you pick a quiz.",
    links: [
      { to: "/how-it-works", label: "How care works", note: "Quiz → visit → coverage → plan review" },
      { to: "/#find-care", label: "Choose a care area", note: "Home care finder" },
      { to: "/about", label: "About this clone", note: "What is and isn’t real here" },
    ],
  },
  {
    id: "visit",
    title: "Visit & plan review",
    dek: "Shared funnel steps after a care-area quiz.",
    links: [
      { to: "/visit", label: "Visit", note: "Shared intake · sample data only" },
      { to: "/insurance-check", label: "Coverage check", note: "Optional · no payer APIs" },
      { to: "/checkout", label: "Plan review", note: "No payments · pricing pending" },
    ],
  },
  {
    id: "care",
    title: "Care areas & quizzes",
    dek: "Landings and matching quizzes for each aisle.",
    links: [
      { to: "/weight-loss", label: "Weight care", note: "Landing" },
      { to: quizPath("weight"), label: "Weight quiz", note: "Start quiz" },
      { to: "/sexual-health", label: "Sexual health", note: "Landing" },
      { to: quizPath("sexual-health"), label: "Sexual health quiz", note: "Start quiz" },
      { to: "/hair", label: "Hair", note: "Landing" },
      { to: quizPath("hair"), label: "Hair quiz", note: "Start quiz" },
      { to: "/skin", label: "Skin", note: "Landing" },
      { to: quizPath("skin"), label: "Skin quiz", note: "Start quiz" },
    ],
  },
  {
    id: "safety",
    title: "Safety & education",
    dek: "Placeholder safety language and health guides.",
    links: [
      { to: "/safety", label: "Safety hub", note: "Safety disclosures" },
      { to: "/isi/glp1", label: "GLP-1 ISI stub", note: "Layout review only" },
      { to: "/isi/minoxidil", label: "Minoxidil ISI stub", note: "Layout review only" },
      { to: "/guides", label: "Health guides", note: "Education tiles" },
    ],
  },
  {
    id: "policies",
    title: "Policies & privacy",
    dek: "Legal stubs for navigation review — not live notices.",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/cookie-policy", label: "Cookie policy" },
      { to: "/privacy-choices", label: "Your privacy choices" },
      { to: "/consumer-health-privacy", label: "Consumer health data" },
      { to: "/disclosure", label: "Disclosure" },
    ],
  },
];

const HELP_FAQS = [
  {
    id: "hf1",
    question: "Is this a real telehealth service?",
    answer:
      "No. This is a local marketing site for layout and funnel review. It does not diagnose, treat, prescribe, or bill insurance.",
  },
  {
    id: "hf2",
    question: "Where should I start?",
    answer:
      "Pick a care area on Home, start the matching quiz, then continue into the shared visit. Optional coverage check and plan review come after.",
  },
  {
    id: "hf3",
    question: "Why aren’t prices shown?",
    answer:
      "Verified prices are withheld until approved figures are supplied. Cards say cost is reviewed during the visit.",
  },
  {
    id: "hf4",
    question: "Where do my answers go?",
    answer:
      "Quiz and visit sample data stay in this browser’s localStorage. Nothing is sent to a clinic or backend.",
  },
  {
    id: "hf5",
    question: "How do I get help with this site?",
    answer:
      "Use the links on this page to reach the real routes. For operator questions about this preview, email the ops address below — there is no phone line.",
  },
];

export function HelpPage() {
  const { content } = useContent();
  const supportEmail = content.settings.supportEmail || "ops@clone.local";

  return (
    <div className="info-page help-hub">
      <header className="info-page-head">
        <div className="container help-hub-intro">
          <p className="eyebrow">Help</p>
          <h1>Help center</h1>
          <p className="lede">
            Find the route you need — care areas, visit steps, safety stubs, and policies —
            without inventing live support channels.
          </p>
          <p className="info-updated">Updated November 2026 · sample paths only</p>
          <div className="hero-actions help-hub-actions">
            <Link to="/#find-care" className="btn btn-primary">
              Choose care · start quiz
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              How care works
            </Link>
          </div>
        </div>
      </header>

      <section className="container help-hub-categories" aria-label="Help categories">
        {HELP_CATEGORIES.map((category) => (
          <article key={category.id} className="help-category" id={category.id}>
            <div className="help-category-head">
              <h2>{category.title}</h2>
              <p>{category.dek}</p>
            </div>
            <ul className="help-link-list">
              {category.links.map((link) => (
                <li key={`${category.id}-${link.to}-${link.label}`}>
                  <Link to={link.to} className="help-link-card">
                    <span className="help-link-label">{link.label}</span>
                    {link.note ? <span className="help-link-note">{link.note}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="container help-hub-faq" aria-labelledby="help-faq-heading">
        <p className="section-kicker">FAQ</p>
        <h2 id="help-faq-heading">Common questions</h2>
        <p className="section-dek help-faq-dek">
          Original answers only — not clinical guidance.
        </p>
        <div className="faq-list help-faq-list">
          {HELP_FAQS.map((faq) => (
            <details key={faq.id}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container help-hub-contact" aria-labelledby="help-contact-heading">
        <h2 id="help-contact-heading">Contact </h2>
        <p>
          There is no phone line or chat agent for this preview. For questions about running the
          clone locally, email{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Do not send real patient
          information.
        </p>
      </section>
    </div>
  );
}
