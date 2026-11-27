import { useCallback, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { JourneyRail } from "../components/JourneyRail";
import { QuizConsentGate } from "../components/QuizConsentGate";
import { QuizShell } from "../components/QuizShell";
import { StepIndicator } from "../components/StepIndicator";
import { useContent } from "../data/ContentContext";
import {
  clearQuizResume,
  readQuizResume,
  writeQuizResume,
  type QuizAnswers,
} from "../data/quizEngine";
import { getQuizTreatment } from "../data/quizQuestions";
import { isiSlugForQuiz } from "../data/isi";
import { hasCurrentIntakeConsent } from "../utils/intakeConsent";
import { goalLabelForArea, visitPath } from "../utils/careRoutes";
import "../components/QuizShell.css";

export function Quiz() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { content, addLead } = useContent();
  const treatment = getQuizTreatment(slug, content.questionnaires);
  const [consented, setConsented] = useState(() => hasCurrentIntakeConsent());
  const resume = useMemo(
    () => (typeof window === "undefined" || !slug ? null : readQuizResume(slug)),
    [slug],
  );
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>(() => resume?.answers ?? {});
  const [stepId, setStepId] = useState<string | null>(resume?.stepId ?? null);
  const [phase, setPhase] = useState<"questions" | "review">(resume?.phase ?? "questions");
  const hasResume = Boolean(resume && Object.keys(resume.answers).length > 0);

  const isiSlug = useMemo(() => (treatment ? isiSlugForQuiz(treatment.slug) : null), [treatment]);

  const persist = useCallback(
    (nextAnswers: QuizAnswers, nextStepId: string | null, nextPhase: "questions" | "review") => {
      if (!treatment) return;
      writeQuizResume(treatment.slug, {
        answers: nextAnswers,
        stepId: nextStepId,
        phase: nextPhase,
      });
    },
    [treatment],
  );

  if (!treatment) {
    return <Navigate to="/#find-care" replace />;
  }

  const active = treatment;
  const careHref =
    active.careArea === "weight" ? "/weight-loss" : `/${active.careArea}`;

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      persist(next, stepId, phase);
      return next;
    });
  }

  function handleStepChange(nextStepId: string | null, nextPhase: "questions" | "review") {
    setStepId(nextStepId);
    setPhase(nextPhase);
    persist(answers, nextStepId, nextPhase);
  }

  function handleComplete(finalAnswers: QuizAnswers) {
    addLead({
      goal: goalLabelForArea(active.careArea),
      state: "",
      notes: `Quiz · ${active.name} · awaiting admin workflow update`,
      status: "submitted",
      source: "quiz",
      quizSlug: active.slug,
      answers: finalAnswers,
    });
    clearQuizResume(active.slug);
    navigate(visitPath(active.careArea));
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
        <p className="visit-flow-chip">Quiz · continues into the shared visit</p>
        <h1>{active.name} quiz</h1>
        <p className="lede">{active.blurb}</p>
        <p className="quiz-storage-note" data-testid="quiz-storage-note">
          Non-PHI demo storage — answers resume from this browser&apos;s localStorage only. Not a
          clinical record and not sent to a clinic.
        </p>
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
              Consent version is current. Answer the questionnaire, review, then continue into the
              existing visit flow. No automatic eligibility outcome.
            </p>
            {hasResume ? (
              <div className="quiz-resume-banner" data-testid="quiz-resume-banner">
                <p>Saved demo answers found in this browser.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-testid="quiz-resume"
                  onClick={() => setStarted(true)}
                >
                  Resume
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="quiz-start-fresh"
                  onClick={() => {
                    setAnswers({});
                    setStepId(null);
                    setPhase("questions");
                    clearQuizResume(active.slug);
                    setStarted(true);
                  }}
                >
                  Start fresh
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                data-testid="quiz-start"
                onClick={() => {
                  setAnswers({});
                  setStepId(null);
                  setPhase("questions");
                  clearQuizResume(active.slug);
                  setStarted(true);
                }}
              >
                Start {active.name} questions
              </button>
            )}
          </div>
        ) : (
          <QuizShell
            treatment={active}
            answers={answers}
            onAnswer={setAnswer}
            onStepChange={handleStepChange}
            initialStepId={stepId}
            initialPhase={phase}
            onComplete={handleComplete}
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
