import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { QuizConsentGate } from "../components/QuizConsentGate";
import { QuizShell } from "../components/QuizShell";
import { StepIndicator } from "../components/StepIndicator";
import { getQuizTreatment } from "../data/quizQuestions";
import { isiSlugForQuiz } from "../data/isi";
import { hasCurrentIntakeConsent } from "../utils/intakeConsent";
import { visitPath } from "../utils/careRoutes";
import "../components/QuizShell.css";

const ANSWERS_KEY = "ro-clone-quiz-answers-v1";

function readAnswers(slug: string): Record<string, string> {
  try {
    const raw = window.sessionStorage.getItem(ANSWERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Record<string, string>>;
    return parsed[slug] ?? {};
  } catch {
    return {};
  }
}

function writeAnswers(slug: string, answers: Record<string, string>) {
  try {
    const raw = window.sessionStorage.getItem(ANSWERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, Record<string, string>>) : {};
    window.sessionStorage.setItem(ANSWERS_KEY, JSON.stringify({ ...parsed, [slug]: answers }));
  } catch {
    /* ignore quota */
  }
}

export function Quiz() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const treatment = getQuizTreatment(slug);
  const [consented, setConsented] = useState(() => hasCurrentIntakeConsent());
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    typeof window === "undefined" ? {} : readAnswers(slug),
  );

  const isiSlug = useMemo(() => (treatment ? isiSlugForQuiz(treatment.slug) : null), [treatment]);

  if (!treatment) {
    return <Navigate to="/#find-care" replace />;
  }

  const active = treatment;
  const careHref =
    active.careArea === "weight" ? "/weight-loss" : `/${active.careArea}`;

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      writeAnswers(active.slug, next);
      return next;
    });
  }

  return (
    <div className="quiz-page">
      <div className="container">
        <JourneyRail
          steps={[
            { label: "Home", to: "/", done: true },
            { label: "Care", to: careHref, done: true },
            { label: "Quiz", current: true },
            { label: "Visit", to: visitPath(active.careArea) },
          ]}
        />
        <StepIndicator current={0} />
        <p className="visit-demo-chip">Quiz · continues into the shared visit</p>
        <h1>{active.name} quiz</h1>
        <p className="lede">{active.blurb}</p>
        {isiSlug ? (
          <p>
            Safety stub:{" "}
            <Link to={`/isi/${isiSlug}`} className="text-link">
              /isi/{isiSlug}
            </Link>
          </p>
        ) : (
          <p>
            No drug-specific ISI for this aisle — see the{" "}
            <Link to="/safety" className="text-link">
              safety hub
            </Link>
            .
          </p>
        )}

        {!consented ? (
          <QuizConsentGate
            treatmentName={active.name}
            treatmentSlug={active.slug}
            onAccepted={() => {
              setConsented(true);
              setStarted(true);
            }}
          />
        ) : !started ? (
          <div className="quiz-consent-card">
            <h2>Ready when you are</h2>
            <p className="lede">
              Consent version is current. Start the short question set, then continue into the
              existing visit flow.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              data-testid="quiz-start"
              onClick={() => {
                setAnswers({});
                writeAnswers(active.slug, {});
                setStarted(true);
              }}
            >
              Start {active.name} questions
            </button>
          </div>
        ) : (
          <QuizShell
            treatment={active}
            answers={answers}
            onAnswer={setAnswer}
            onComplete={() => navigate(visitPath(active.careArea))}
          />
        )}

        <div className="cta-row" style={{ marginTop: "1.5rem" }}>
          <Link to={careHref} className="btn btn-secondary">
            Back to care
          </Link>
          <Link to={visitPath(active.careArea)} className="btn btn-secondary">
            Skip to visit
          </Link>
        </div>
      </div>
    </div>
  );
}
