import { useState } from "react";
import { Link } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { StepIndicator } from "../components/StepIndicator";
import { StickyMobileCta } from "../components/StickyMobileCta";
import { useContent } from "../data/ContentContext";
import { quizPath, visitPath } from "../utils/careRoutes";
import { CareLandingBody } from "./CategoryLanding";
import "./Category.css";
import "./Flows.css";
import "./Isi.css";

export function WeightLoss() {
  const { content, mediaById } = useContent();
  const category = content.categories.find((item) => item.slug === "weight");
  const products = content.products.filter(
    (product) => product.category === "weight" && product.active,
  );
  const hero = category ? mediaById[category.heroImageId] : undefined;
  const [weight, setWeight] = useState(220);
  const firstProductId = products[0]?.id;
  const visitHref = visitPath("weight", firstProductId);
  const quizHref = quizPath("weight");

  if (!category) return null;

  const eyebrow = category.eyebrow;

  return (
    <div className="category-page">
      <section className="cat-hero tone-weight">
        <div className="container cat-hero-grid">
          <div>
            <JourneyRail
              steps={[
                { label: "Home", to: "/", done: true },
                { label: "Care", current: true },
                { label: "Quiz", to: quizHref },
                { label: "Visit", to: visitHref },
              ]}
            />
            <StepIndicator current={0} />
            <p className="eyebrow">{eyebrow}</p>
            <h1>{category.title}</h1>
            <p className="lede">{category.lede}</p>
            <div className="hero-actions">
              <Link to={quizHref} className="btn btn-primary">
                Start quiz
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary">
                How care works
              </Link>
              <Link to="/help" className="btn btn-secondary">
                Help center
              </Link>
            </div>
            <p className="cat-fine">
              Quiz → visit → coverage → plan review ·{" "}
              <a href="#pathways">See pathways</a>
              {" · "}
              <a href="#meds">Browse options</a>
              {" · "}
              <a href="#safety">Safety</a>
              {" · "}
              <Link to="/#find-care">Other care areas</Link>
            </p>
          </div>
          <aside className="weight-widget">
            {hero ? <img className="cat-hero-img" src={hero.src} alt={hero.alt} /> : null}
            <label htmlFor="weight">Current weight (lbs)</label>
            <input
              id="weight"
              type="range"
              min={140}
              max={360}
              value={weight}
              onChange={(event) => setWeight(Number(event.target.value))}
            />
            <div className="weight-readout">
              <div>
                <strong>{weight}</strong>
                <span>starting lbs</span>
              </div>
              <div>
                <strong>—</strong>
                <span>outcomes not projected</span>
              </div>
            </div>
            <p className="disclaimer">
              Layout slider only. No weight-loss predictions or clinical guidance.
            </p>
          </aside>
        </div>
      </section>

      <CareLandingBody
        slug="weight"
        quizHref={quizHref}
        visitHref={visitHref}
        optionsId="meds"
        quizTitle="Start the weight quiz"
        extraMembershipBullets={["Progress tracking placeholders"]}
        isiSlug="glp1"
      />

      <StickyMobileCta
        to={quizHref}
        label="Start quiz"
        fine="Then visit → coverage → plan review · Help anytime"
      />
    </div>
  );
}
