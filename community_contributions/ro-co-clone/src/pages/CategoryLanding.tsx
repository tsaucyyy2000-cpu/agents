import { Link } from "react-router-dom";
import { IsiBlock } from "../components/IsiBlock";
import { JourneyRail } from "../components/JourneyRail";
import { PriceTag } from "../components/PriceTag";
import { StepIndicator } from "../components/StepIndicator";
import { StickyMobileCta } from "../components/StickyMobileCta";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";
import { isiSlugForProduct } from "../data/isi";
import { PENDING_PRICE } from "../utils/formatPrice";
import { quizPath, visitPath } from "../utils/careRoutes";
import "./Category.css";
import "./Flows.css";
import "./Isi.css";

const toneBySlug: Record<CareArea, string> = {
  weight: "tone-weight",
  "sexual-health": "tone-sex",
  hair: "tone-hair",
  skin: "tone-skin",
};

/** Shared funnel beats — same IA as Help hub / how-it-works. */
export function CareFunnelSteps({
  slug,
  quizHref,
  visitHref,
  quizTitle,
}: {
  slug: CareArea;
  quizHref: string;
  visitHref: string;
  quizTitle?: string;
}) {
  const steps = [
    {
      id: "quiz",
      title: quizTitle ?? "Start this aisle’s quiz",
      copy: "Short questionnaire for this care area. Sample answers only.",
      to: quizHref,
      cta: "Start quiz",
    },
    {
      id: "visit",
      title: "Continue into the shared visit",
      copy: "One fictional intake: care goal, state, option, confirm.",
      to: visitHref,
      cta: "Open visit",
    },
    {
      id: "coverage",
      title: "Optional coverage check",
      copy: "Insurance pathway metaphor — no payer APIs.",
      to: "/insurance-check",
      cta: "Try coverage check",
    },
    {
      id: "plan",
      title: "Review a sample plan",
      copy: "Membership cadence stub. No payments · prices pending.",
      to: "/checkout",
      cta: "Plan review",
    },
  ];

  return (
    <section className="section-tight timeline care-funnel" data-care-area={slug}>
      <div className="container">
        <p className="section-kicker">Process</p>
        <div className="section-head">
          <h2>How care works in this aisle</h2>
          <p className="section-dek">
            Same four-beat path as the rest of the site: quiz → visit → optional coverage → plan
            review.
          </p>
        </div>
        <ol className="care-funnel-list">
          {steps.map((step, index) => (
            <li key={step.id}>
              <span>{index + 1}</span>
              <div>
                <p>
                  <strong>{step.title}</strong> — {step.copy}
                </p>
                <Link to={step.to} className="text-link">
                  {step.cta}
                </Link>
              </div>
            </li>
          ))}
        </ol>
        <p className="care-bridge">
          <Link to="/how-it-works" className="text-link">
            Full how-care-works explainer
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/help" className="text-link">
            Help center
          </Link>
        </p>
      </div>
    </section>
  );
}

export function CategoryLanding({ slug }: { slug: CareArea }) {
  const { content, mediaById } = useContent();
  const category = content.categories.find((item) => item.slug === slug);
  const products = content.products.filter(
    (product) => product.category === slug && product.active,
  );
  const faqs = content.faqs.filter((faq) => faq.area === slug || faq.area === "general");
  const firstProductId = products[0]?.id;
  const visitHref = visitPath(slug, firstProductId);
  const quizHref = quizPath(slug);
  const isiSlug = isiSlugForProduct(firstProductId ?? "", slug);

  if (!category) return null;
  const hero = mediaById[category.heroImageId];
  const eyebrow = category.eyebrow;

  return (
    <div className="category-page">
      <section className={`cat-hero ${toneBySlug[slug]}`}>
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
            <div className="cta-row">
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
              <a href="#options">See options</a>
              {" · "}
              <Link to="/#find-care">Other care areas</Link>
            </p>
          </div>
          <div className="feature-panel">
            {hero ? <img className="cat-hero-img" src={hero.src} alt={hero.alt} /> : null}
            <h2>Why people browse this aisle</h2>
            <ul>
              {category.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CareFunnelSteps slug={slug} quizHref={quizHref} visitHref={visitHref} />

      <section className="section" id="options">
        <div className="container">
          <p className="section-kicker">Options</p>
          <div className="section-head">
            <h2>Options</h2>
            <p>Catalog · verified prices are not published yet.</p>
          </div>
          <div className="med-grid">
            {products.length === 0 ? (
              <article className="empty-stub">
                <h3>Formats coming soon</h3>
                <p>This category has no active products yet—start the quiz to explore the flow.</p>
                <Link to={quizHref} className="btn btn-primary">
                  Start quiz
                </Link>
              </article>
            ) : (
              products.map((option) => {
                const image = mediaById[option.imageId];
                return (
                  <article key={option.id}>
                    {image ? <img src={image.src} alt="" className="med-thumb" /> : null}
                    {option.tag ? <span className="chip">{option.tag}</span> : null}
                    <h3>{option.name}</h3>
                    <p>{option.meta}</p>
                    <PriceTag price={PENDING_PRICE} />
                    <div className="cta-row">
                      <Link to={`/products/${option.id}`} className="btn btn-secondary">
                        Details
                      </Link>
                      <Link to={quizHref} className="btn btn-primary">
                        Start quiz
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="section membership">
        <div className="container membership-grid">
          <div>
            <p className="section-kicker">Membership</p>
            <h2>What membership covers </h2>
            <ul>
              {category.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
          <div className="price-card">
            <p className="eyebrow">Cost</p>
            <PriceTag price={{ ...PENDING_PRICE, unit: "membership" }} />
            <div className="cta-row">
              <Link to={quizHref} className="btn btn-primary">
                Start quiz
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary">
                How care works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <p className="section-kicker">FAQ</p>
          <h2>FAQs</h2>
          <div className="faq-list">
            {faqs.length === 0 ? (
              <details open>
                <summary>Is this medical advice?</summary>
                <p>No. No real prescribing or clinical review happens here.</p>
              </details>
            ) : (
              faqs.map((faq) => (
                <details key={faq.id}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))
            )}
          </div>
          <p className="care-bridge">
            More answers in the{" "}
            <Link to="/help" className="text-link">
              Help center
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section safety-band">
        <div className="container">
          <p className="section-kicker">Safety</p>
          <h2>Safety note </h2>
          {isiSlug ? (
            <IsiBlock slug={isiSlug} />
          ) : (
            <div className="isi-block">
              <h3>Important safety information · placeholder</h3>
              <p>
                This aisle has no drug-specific ISI stub. It does not reuse GLP-1 content. Open the
                safety hub for the general notice.
              </p>
              <Link to="/safety" className="text-link">
                Open safety hub
              </Link>
            </div>
          )}
          <p className="care-bridge">
            <Link to="/safety" className="text-link">
              Safety hub
            </Link>
            <span aria-hidden="true"> · </span>
            <Link to="/guides" className="text-link">
              Health guides
            </Link>
          </p>
        </div>
      </section>

      <section className="cta-band cat-cta-band">
        <div className="container cta-band-inner">
          <p className="section-kicker section-kicker-on-dark">Next · Quiz</p>
          <h2>Continue with this aisle’s quiz</h2>
          <p>Then the shared visit funnel. Answers stay in this browser.</p>
          <div className="hero-actions">
            <Link to={quizHref} className="btn btn-on-dark">
              Start quiz
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              How care works
            </Link>
            <Link to="/help" className="btn btn-secondary">
              Help center
            </Link>
          </div>
        </div>
      </section>

      <StickyMobileCta
        to={quizHref}
        label="Start quiz"
        fine="Then visit → coverage → plan review · Help anytime"
      />
    </div>
  );
}
