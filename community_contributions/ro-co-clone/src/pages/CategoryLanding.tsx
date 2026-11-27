import { Link } from "react-router-dom";
import { IsiBlock } from "../components/IsiBlock";
import { JourneyRail } from "../components/JourneyRail";
import { PriceTag } from "../components/PriceTag";
import { StepIndicator } from "../components/StepIndicator";
import { StickyMobileCta } from "../components/StickyMobileCta";
import { getCareLandingDepth } from "../data/careLandingDepth";
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

const quizTitleBySlug: Record<CareArea, string> = {
  weight: "Start the weight quiz",
  "sexual-health": "Start the sexual-health quiz",
  hair: "Start the hair quiz",
  skin: "Start the skin quiz",
};

const ctaTitleBySlug: Record<CareArea, string> = {
  weight: "Continue to the weight quiz",
  "sexual-health": "Continue to the sexual-health quiz",
  hair: "Continue to the hair quiz",
  skin: "Continue to the skin quiz",
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
      copy: "Short questionnaire for this care area. Answers stay in this browser.",
      to: quizHref,
      cta: "Start quiz",
    },
    {
      id: "visit",
      title: "Continue into the shared visit",
      copy: "One intake shell: care goal, state, option, confirm. Preview data only.",
      to: visitHref,
      cta: "Open visit",
    },
    {
      id: "coverage",
      title: "Optional coverage check",
      copy: "Insurance pathway metaphor — no payer APIs and no verified costs.",
      to: "/insurance-check",
      cta: "Try coverage check",
    },
    {
      id: "plan",
      title: "Review a sample plan",
      copy: "Membership cadence stub. No payments · prices pending verification.",
      to: "/checkout",
      cta: "Plan review",
    },
  ];

  return (
    <section className="section-tight timeline care-funnel" data-care-area={slug} id="how-it-works">
      <div className="container">
        <p className="section-kicker">How it works</p>
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

export function CarePathways({ slug }: { slug: CareArea }) {
  const depth = getCareLandingDepth(slug);
  return (
    <section className="section care-pathways" id="pathways">
      <div className="container">
        <p className="section-kicker">{depth.pathwayKicker}</p>
        <div className="section-head">
          <h2>{depth.pathwayTitle}</h2>
          <p className="section-dek">{depth.pathwayDek}</p>
        </div>
        <div className="three-up pathway-grid">
          {depth.pathways.map((card) => (
            <article key={card.id} className="plain-card pathway-card">
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CareExpectations({ slug }: { slug: CareArea }) {
  const depth = getCareLandingDepth(slug);
  return (
    <section className="section-tight care-expect" id="expect">
      <div className="container">
        <p className="section-kicker">{depth.expectKicker}</p>
        <div className="section-head">
          <h2>{depth.expectTitle}</h2>
          <p className="section-dek">{depth.expectDek}</p>
        </div>
        <div className="three-up">
          {depth.expectations.map((card) => (
            <article key={card.id} className="plain-card expect-card">
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CareOptions({
  slug,
  quizHref,
  optionsId = "options",
}: {
  slug: CareArea;
  quizHref: string;
  optionsId?: string;
}) {
  const { content, mediaById } = useContent();
  const products = content.products.filter(
    (product) => product.category === slug && product.active,
  );

  return (
    <section className="section" id={optionsId}>
      <div className="container">
        <p className="section-kicker">Options</p>
        <div className="section-head">
          <h2>Options in this aisle</h2>
          <p className="section-dek">
            Catalog cards for browsing. Verified prices are not published yet — PriceTag stays
            pending.
          </p>
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
  );
}

export function CareMembership({
  slug,
  quizHref,
  extraBullets = [],
}: {
  slug: CareArea;
  quizHref: string;
  extraBullets?: string[];
}) {
  const { content } = useContent();
  const category = content.categories.find((item) => item.slug === slug);
  const depth = getCareLandingDepth(slug);
  if (!category) return null;

  return (
    <section className="section membership" id="membership">
      <div className="container membership-grid">
        <div>
          <p className="section-kicker">Membership</p>
          <h2>What membership covers</h2>
          <p className="section-dek membership-dek">{depth.membershipNote}</p>
          <ul>
            {category.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
            {extraBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
        <div className="price-card">
          <p className="eyebrow">Cost</p>
          <PriceTag price={{ ...PENDING_PRICE, unit: "membership" }} />
          <p className="price-card-note">No invented membership dollars on this preview.</p>
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
  );
}

export function CareFaqs({ slug }: { slug: CareArea }) {
  const { content } = useContent();
  const depth = getCareLandingDepth(slug);
  const fromCms = content.faqs.filter((faq) => faq.area === slug || faq.area === "general");
  const faqs = [
    ...depth.faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer })),
    ...fromCms,
  ];

  return (
    <section className="section-tight" id="faq">
      <div className="container">
        <p className="section-kicker">FAQ</p>
        <h2>FAQs for this aisle</h2>
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
  );
}

export function CareSafety({
  slug,
  isiSlug,
}: {
  slug: CareArea;
  isiSlug: string | null;
}) {
  const depth = getCareLandingDepth(slug);

  return (
    <section className="section safety-band" id="safety">
      <div className="container">
        <p className="section-kicker">Safety</p>
        <h2>Safety & important information</h2>
        <div className="callout warn care-safety-lead">
          <p>{depth.safetyLead}</p>
        </div>
        {isiSlug ? (
          <IsiBlock slug={isiSlug} />
        ) : (
          <div className="isi-block">
            <h3>Important safety information · placeholder</h3>
            <p>
              This aisle has no drug-specific ISI stub yet. It does not reuse GLP-1 content. Open
              the safety hub for the general notice.
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
          {isiSlug ? (
            <>
              <span aria-hidden="true"> · </span>
              <Link to={`/isi/${isiSlug}`} className="text-link">
                Full {isiSlug.toUpperCase()} ISI stub
              </Link>
            </>
          ) : null}
          <span aria-hidden="true"> · </span>
          <Link to="/guides" className="text-link">
            Health guides
          </Link>
        </p>
      </div>
    </section>
  );
}

export function CareGuidesBridge({ slug }: { slug: CareArea }) {
  const { content, mediaById } = useContent();
  const guides = content.guides.slice(0, 3);

  return (
    <section className="section-tight care-guides-bridge" id="guides">
      <div className="container">
        <p className="section-kicker">Learn more</p>
        <div className="section-head">
          <h2>Guides nearby</h2>
          <p className="section-dek">
            Short educational reads. Not a substitute for clinician advice — and not tied to
            invented outcome stats.
          </p>
        </div>
        <div className="three-up">
          {guides.map((guide) => {
            const image = mediaById[guide.imageId];
            return (
              <article key={guide.id} className="plain-card guide-bridge-card">
                {image ? <img src={image.src} alt="" className="guide-bridge-thumb" /> : null}
                <h3>{guide.title}</h3>
                <p>{guide.summary ?? guide.read}</p>
                <Link to={`/guides/${guide.id}`} className="text-link">
                  Read guide
                </Link>
              </article>
            );
          })}
        </div>
        <p className="care-bridge">
          <Link to="/guides" className="text-link">
            All guides
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to={`/#find-care`} className="text-link">
            Other care areas
          </Link>
          <span className="sr-only"> ({slug})</span>
        </p>
      </div>
    </section>
  );
}

export function CareCtaBand({
  slug,
  quizHref,
}: {
  slug: CareArea;
  quizHref: string;
}) {
  return (
    <section className="cta-band cat-cta-band">
      <div className="container cta-band-inner">
        <p className="section-kicker section-kicker-on-dark">Next · Quiz</p>
        <h2>{ctaTitleBySlug[slug]}</h2>
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
  );
}

/** Shared body used by CategoryLanding and WeightLoss (custom hero). */
export function CareLandingBody({
  slug,
  quizHref,
  visitHref,
  optionsId = "options",
  quizTitle,
  extraMembershipBullets = [],
  isiSlug,
}: {
  slug: CareArea;
  quizHref: string;
  visitHref: string;
  optionsId?: string;
  quizTitle?: string;
  extraMembershipBullets?: string[];
  isiSlug: string | null;
}) {
  return (
    <>
      <CareFunnelSteps
        slug={slug}
        quizHref={quizHref}
        visitHref={visitHref}
        quizTitle={quizTitle ?? quizTitleBySlug[slug]}
      />
      <CarePathways slug={slug} />
      <CareOptions slug={slug} quizHref={quizHref} optionsId={optionsId} />
      <CareExpectations slug={slug} />
      <CareMembership
        slug={slug}
        quizHref={quizHref}
        extraBullets={extraMembershipBullets}
      />
      <CareFaqs slug={slug} />
      <CareSafety slug={slug} isiSlug={isiSlug} />
      <CareGuidesBridge slug={slug} />
      <CareCtaBand slug={slug} quizHref={quizHref} />
    </>
  );
}

export function CategoryLanding({ slug }: { slug: CareArea }) {
  const { content, mediaById } = useContent();
  const category = content.categories.find((item) => item.slug === slug);
  const products = content.products.filter(
    (product) => product.category === slug && product.active,
  );
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
              <a href="#pathways">See pathways</a>
              {" · "}
              <a href="#options">Options</a>
              {" · "}
              <a href="#safety">Safety</a>
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
            <p className="feature-panel-jump">
              <a href="#how-it-works">How it works</a>
              <span aria-hidden="true"> · </span>
              <a href="#faq">FAQ</a>
            </p>
          </div>
        </div>
      </section>

      <CareLandingBody
        slug={slug}
        quizHref={quizHref}
        visitHref={visitHref}
        isiSlug={isiSlug}
      />

      <StickyMobileCta
        to={quizHref}
        label="Start quiz"
        fine="Then visit → coverage → plan review · Help anytime"
      />
    </div>
  );
}
