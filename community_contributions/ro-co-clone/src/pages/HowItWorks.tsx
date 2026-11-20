import { Link } from "react-router-dom";
import { useContent } from "../data/ContentContext";
import "./Flows.css";

export function HowItWorks() {
  const { content, mediaById } = useContent();
  const hero = mediaById["how-it-works"];

  return (
    <div className="flow-page">
      <section className="flow-hero">
        <div className="container flow-hero-grid">
          <div>
            <p className="eyebrow">How it works</p>
            <h1>From goal to ongoing care—in four beats</h1>
            <p className="lede">
              Structural recreation of the live site’s process storytelling. Original copy only.
            </p>
            <div className="cta-row">
              <Link to="/visit" className="btn btn-primary">
                Start online visit
              </Link>
              <Link to="/#find-care" className="btn btn-secondary">
                Choose a care area
              </Link>
            </div>
          </div>
          {hero ? <img src={hero.src} alt={hero.alt} className="flow-hero-img" /> : null}
        </div>
      </section>

      <section className="section">
        <div className="container step-grid">
          {content.howItWorks.map((step, index) => (
            <article key={step.id} className="step-card">
              <span>{index + 1}</span>
              <h2>{step.title}</h2>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-tight">
        <div className="container cta-row">
          <Link to="/insurance-check" className="btn btn-secondary">
            Try coverage check demo
          </Link>
          <Link to="/guides" className="btn btn-secondary">
            Browse health guides
          </Link>
        </div>
      </section>
    </div>
  );
}
