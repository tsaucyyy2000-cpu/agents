import { Link } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { useContent } from "../data/ContentContext";
import "./Flows.css";

const FUNNEL_STEPS = [
  {
    id: "quiz",
    title: "Start a care-area quiz",
    copy: "Pick Weight, Sexual health, Hair, or Skin on Home, then answer the short quiz for that aisle.",
    to: "/#find-care",
    cta: "Choose care · start quiz",
  },
  {
    id: "visit",
    title: "Continue into the shared visit",
    copy: "The quiz hands off into one fictional intake: care goal, state, option, confirm. Sample data only.",
    to: "/visit",
    cta: "Open visit",
  },
  {
    id: "coverage",
    title: "Optional coverage check",
    copy: "Try the insurance pathway metaphor if you want to see that branch. No payer APIs — placeholders unlock a fake result.",
    to: "/insurance-check",
    cta: "Try coverage check",
  },
  {
    id: "plan",
    title: "Review a sample plan",
    copy: "Confirm a membership cadence stub and save a local lead. No payments and no verified prices.",
    to: "/checkout",
    cta: "Plan review",
  },
];

export function HowItWorks() {
  const { content, mediaById } = useContent();
  const hero = mediaById["how-it-works"];

  return (
    <div className="flow-page">
      <section className="flow-hero">
        <div className="container flow-hero-grid">
          <div>
            <JourneyRail
              steps={[
                { label: "Home", to: "/" },
                { label: "How it works", current: true },
                { label: "Quiz", to: "/#find-care" },
                { label: "Visit", to: "/visit" },
              ]}
            />
            <p className="eyebrow">How care works</p>
            <h1>Quiz → visit → coverage → plan review</h1>
            <p className="lede">
              A four-beat care funnel that mirrors the marketing path. Original copy only — not a
              live care promise.
            </p>
            <div className="cta-row">
              <Link to="/#find-care" className="btn btn-primary">
                Choose care · start quiz
              </Link>
              <Link to="/visit" className="btn btn-secondary">
                Skip to visit
              </Link>
              <Link to="/help" className="btn btn-secondary">
                Help center
              </Link>
            </div>
          </div>
          {hero ? <img src={hero.src} alt={hero.alt} className="flow-hero-img" /> : null}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section-kicker">Care funnel</p>
          <div className="section-head">
            <h2>The path this preview walks</h2>
            <p className="section-dek">
              Each step links to a real route in the clone. Edit answers anytime — nothing leaves
              this browser.
            </p>
          </div>
          <div className="step-grid how-funnel-grid">
            {FUNNEL_STEPS.map((step, index) => (
              <article key={step.id} className="step-card">
                <span>{index + 1}</span>
                <h2>{step.title}</h2>
                <p>{step.copy}</p>
                <Link to={step.to} className="text-link">
                  {step.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <p className="section-kicker">Also on Home</p>
          <div className="section-head inline">
            <h2>Marketing beats</h2>
            <p>Shorter cards used on the home process strip</p>
          </div>
          <div className="step-grid">
            {content.howItWorks.map((step, index) => (
              <article key={step.id} className="step-card">
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container cta-row">
          <Link to="/#find-care" className="btn btn-primary">
            Start with a care quiz
          </Link>
          <Link to="/guides" className="btn btn-secondary">
            Browse health guides
          </Link>
          <Link to="/help" className="btn btn-secondary">
            Back to help
          </Link>
        </div>
      </section>
    </div>
  );
}
