import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const heroGoals = [
  "Reach a healthier weight",
  "Feel more confident in intimacy",
  "Grow fuller-looking hair",
  "Calm and clarify skin",
];

const categories = [
  {
    to: "/weight-loss",
    title: "Weight",
    copy: "Explore structured online care paths with ongoing check-ins.",
    tone: "mint",
  },
  {
    to: "/sexual-health",
    title: "Sexual health",
    copy: "Discrete options designed around timing, lifestyle, and preference.",
    tone: "warm",
  },
  {
    to: "/hair",
    title: "Hair",
    copy: "Build a plan for thinning, shedding, or density goals.",
    tone: "calm",
  },
  {
    to: "/skin",
    title: "Skin",
    copy: "Simple routines for texture, tone, and everyday glow.",
    tone: "peach",
  },
];

const convenience = [
  {
    title: "Message clinicians anytime",
    copy: "Ask questions, share updates, and stay on track without waiting rooms.",
  },
  {
    title: "Evidence-guided options",
    copy: "Browse treatments that map to common goals—with clear safety context.",
  },
  {
    title: "Discreet delivery",
    copy: "Shipments arrive in plain packaging on a schedule that fits your life.",
  },
];

const quotes = [
  {
    quote:
      "The online flow made starting care feel approachable instead of intimidating.",
    name: "Alex M.",
  },
  {
    quote:
      "I finally had a plan I could stick with—and support when questions came up.",
    name: "Jordan P.",
  },
  {
    quote:
      "Everything stayed private, clear, and easy to manage from my phone.",
    name: "Sam R.",
  },
];

const guides = [
  { title: "How oral GLP-1 pathways differ", read: "8 min" },
  { title: "Timing tips when on-demand treatment falls short", read: "5 min" },
  { title: "What counts as normal shedding", read: "6 min" },
  { title: "Comparing weekly vs daily options", read: "11 min" },
];

export function Home() {
  const [goalIndex, setGoalIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setGoalIndex((current) => (current + 1) % heroGoals.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Online care, built around goals</p>
            <h1>
              <span className="hero-brand">ro</span>
              <span className="hero-line">Help with what you want next</span>
            </h1>
            <p className="hero-rotator" aria-live="polite">
              <span className="gradient-text">{heroGoals[goalIndex]}</span>
            </p>
            <p className="hero-support">
              A recreation of the marketing experience: browse care areas, compare
              options, and start a guided online visit—demo data only.
            </p>
            <div className="hero-actions">
              <Link to="/visit" className="btn btn-primary">
                Start free visit
              </Link>
              <Link to="/weight-loss" className="btn btn-secondary">
                Explore weight care
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-panel">
              <div className="hero-stat">
                <strong>3M+</strong>
                <span>members (marketing claim on live site)</span>
              </div>
              <div className="hero-orbits">
                <span />
                <span />
                <span />
              </div>
              <p>Calm slate · teal energy · goal-first IA</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section categories">
        <div className="container">
          <div className="section-head">
            <h2>Prescription-ready paths for everyday health goals</h2>
            <p>Four primary care areas mirrored from the live top-of-funnel.</p>
          </div>
          <div className="category-grid">
            {categories.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`category-card tone-${item.tone}`}
              >
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <span className="card-cta">View options</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight product-strip">
        <div className="container">
          <div className="section-head inline">
            <h2>Spotlight treatments</h2>
            <p>Structure-only cards with placeholder pricing.</p>
          </div>
          <div className="product-rail">
            {[
              {
                name: "Weekly GLP-1 plan",
                meta: "Weight · from $149/mo membership",
              },
              {
                name: "Fast-onset dual action",
                meta: "Sexual health · timed support",
              },
              {
                name: "Daily density kit",
                meta: "Hair · topical + oral combo",
              },
            ].map((product) => (
              <article key={product.name} className="product-card">
                <div className="product-swatch" />
                <h3>{product.name}</h3>
                <p>{product.meta}</p>
                <Link to="/visit" className="text-link">
                  Check eligibility
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section convenience">
        <div className="container convenience-grid">
          <div>
            <h2>100% online, built for busy schedules</h2>
            <p>
              The live site leans on convenience storytelling. This clone keeps
              the same three-beat rhythm with original wording.
            </p>
          </div>
          <ul>
            {convenience.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section social-proof">
        <div className="container">
          <div className="proof-banner">
            <div>
              <p className="eyebrow">Member voices</p>
              <h2>
                People stick with care when support feels close and clear
              </h2>
            </div>
            <div className="proof-metric">
              <strong>95%</strong>
              <span>say the experience feels supportive (demo figure)</span>
            </div>
          </div>
          <div className="quote-rail">
            {quotes.map((item) => (
              <blockquote key={item.name}>
                <p>“{item.quote}”</p>
                <footer>{item.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section experts">
        <div className="container experts-grid">
          <div>
            <h2>Clinical leadership, summarized</h2>
            <p>
              The live homepage features named clinicians and credentials. Here
              we keep the layout without copying biographies.
            </p>
            <ul className="expert-bullets">
              <li>Board-certified specialists across obesity, derm, and more</li>
              <li>Published research informing program design</li>
              <li>Policy and public-health advisors in the mix</li>
            </ul>
          </div>
          <div className="expert-cards">
            {["Chief Medical Officer", "Clinical Strategy Lead", "Education Lead"].map(
              (role) => (
                <article key={role}>
                  <div className="avatar" />
                  <h3>Clinician portrait</h3>
                  <p>{role}</p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="section-tight guides">
        <div className="container">
          <div className="section-head inline">
            <h2>Health guide</h2>
            <p>Editorial tiles that mirror the content hub pattern.</p>
          </div>
          <div className="guide-grid">
            {guides.map((guide) => (
              <article key={guide.title}>
                <div className="guide-thumb" />
                <h3>{guide.title}</h3>
                <p>{guide.read} read</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band-inner">
          <h2>Ready when you are</h2>
          <p>Start a mock online visit and see the interaction rhythm.</p>
          <Link to="/visit" className="btn btn-on-dark">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
