import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getVisibleSteps,
  validateStep,
  type QuizAnswers,
  type QuizDefinition,
} from "../data/quizEngine";
import "./QuizShell.css";

type Phase = "questions" | "review";

type Props = {
  treatment: QuizDefinition;
  answers: QuizAnswers;
  onAnswer: (id: string, value: string) => void;
  onStepChange?: (stepId: string | null, phase: Phase) => void;
  initialStepId?: string | null;
  initialPhase?: Phase;
  onComplete: (answers: QuizAnswers) => void;
};

export function QuizShell({
  treatment,
  answers,
  onAnswer,
  onStepChange,
  initialStepId = null,
  initialPhase = "questions",
  onComplete,
}: Props) {
  const { t } = useTranslation("common");
  const visible = useMemo(() => getVisibleSteps(treatment, answers), [treatment, answers]);
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [index, setIndex] = useState(() => {
    if (initialStepId) {
      const found = getVisibleSteps(treatment, answers).findIndex((s) => s.id === initialStepId);
      return found >= 0 ? found : 0;
    }
    return 0;
  });
  const [touched, setTouched] = useState(false);
  const [confirmAck, setConfirmAck] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const safeIndex = Math.min(index, Math.max(0, visible.length - 1));
  const question = visible[safeIndex];
  const total = visible.length;
  const progressPct =
    phase === "review" ? 100 : total === 0 ? 0 : Math.round(((safeIndex + 1) / total) * 100);

  useEffect(() => {
    if (index > visible.length - 1 && visible.length > 0) {
      setIndex(visible.length - 1);
    }
  }, [visible.length, index]);

  useEffect(() => {
    onStepChange?.(phase === "review" ? null : (question?.id ?? null), phase);
  }, [phase, question?.id, onStepChange]);

  if (!question && phase === "questions") {
    return (
      <div className="quiz-shell" data-testid="quiz-shell">
        <p className="lede">This questionnaire has no visible steps yet.</p>
      </div>
    );
  }

  const value = question ? (answers[question.id] ?? "") : "";
  const validation = question ? validateStep(question, answers) : { ok: true as const };

  function goNext() {
    if (!question) return;
    setTouched(true);
    if (!validation.ok) return;
    if (safeIndex >= total - 1) {
      setPhase("review");
      setTouched(false);
      setConfirmError("");
      return;
    }
    setTouched(false);
    setIndex((current) => current + 1);
  }

  function goBack() {
    setTouched(false);
    setConfirmError("");
    if (phase === "review") {
      setPhase("questions");
      setIndex(Math.max(0, total - 1));
      return;
    }
    setIndex((current) => Math.max(0, current - 1));
  }

  function editStep(stepId: string) {
    const found = visible.findIndex((step) => step.id === stepId);
    if (found < 0) return;
    setPhase("questions");
    setIndex(found);
    setTouched(false);
    setConfirmError("");
  }

  function submitReview() {
    if (!confirmAck) {
      setConfirmError("Confirm the acknowledgment to submit this demo intake.");
      return;
    }
    onComplete(answers);
  }

  if (phase === "review") {
    return (
      <div className="quiz-shell" data-testid="quiz-shell" data-phase="review">
        <div className="quiz-progress" aria-hidden="true">
          <div className="quiz-progress-bar" style={{ width: "100%" }} />
        </div>
        <p className="quiz-progress-label">Review · {total} answered step{total === 1 ? "" : "s"}</p>
        <h2>Review your answers</h2>
        <p className="lede">
          Edit anything before submitting. This does not diagnose, prescribe, or decide eligibility.
        </p>
        <ul className="quiz-review-list" data-testid="quiz-review">
          {visible.map((step) => (
            <li key={step.id}>
              <div>
                <strong>{step.label}</strong>
                <span>{(answers[step.id] ?? "").trim() || "—"}</span>
              </div>
              <button type="button" className="text-link" onClick={() => editStep(step.id)}>
                Edit
              </button>
            </li>
          ))}
        </ul>
        <label className="field checkbox">
          <input
            type="checkbox"
            checked={confirmAck}
            data-testid="quiz-review-ack"
            onChange={(event) => {
              setConfirmAck(event.target.checked);
              setConfirmError("");
            }}
          />
          <span>
            I understand this is a non-clinical demo intake. Workflow status is set by an admin later
            — not by this form.
          </span>
        </label>
        {confirmError ? (
          <p className="field-error" role="alert">
            {confirmError}
          </p>
        ) : null}
        <div className="quiz-actions">
          <button type="button" className="btn btn-secondary" onClick={goBack}>
            {t("cta.back")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-testid="quiz-review-submit"
            onClick={submitReview}
          >
            {t("cta.submit")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-shell" data-testid="quiz-shell" data-phase="questions">
      <div className="quiz-progress" aria-hidden="true">
        <div className="quiz-progress-bar" style={{ width: `${progressPct}%` }} />
      </div>
      <p className="quiz-progress-label">
        Question {safeIndex + 1} of {total}
      </p>

      <h2>{question!.label}</h2>
      {question!.help ? <p className="lede">{question!.help}</p> : null}

      {question!.type === "choice" && question!.options ? (
        <div className="quiz-choice-grid" role="group" aria-label={question!.label}>
          {question!.options.map((option) => (
            <button
              key={option}
              type="button"
              className={value === option ? "selected" : ""}
              aria-pressed={value === option}
              onClick={() => {
                onAnswer(question!.id, option);
                setTouched(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      {question!.type === "number" ? (
        <label className="field quiz-number-field">
          <span className="sr-only">{question!.label}</span>
          <input
            type="number"
            inputMode="decimal"
            min={question!.min ?? 0}
            max={question!.max}
            value={value}
            onChange={(event) => {
              onAnswer(question!.id, event.target.value);
              setTouched(false);
            }}
          />
          {question!.unit ? <span className="quiz-unit">{question!.unit}</span> : null}
        </label>
      ) : null}

      {question!.type === "text" ? (
        <label className="field">
          <span className="sr-only">{question!.label}</span>
          <textarea
            rows={4}
            value={value}
            placeholder={question!.required === false ? "Optional notes" : "Your answer"}
            onChange={(event) => {
              onAnswer(question!.id, event.target.value);
              setTouched(false);
            }}
          />
        </label>
      ) : null}

      {touched && !validation.ok ? (
        <p className="field-error" role="alert">
          {validation.message}
        </p>
      ) : null}

      <div className="quiz-actions">
        <button type="button" className="btn btn-secondary" onClick={goBack} disabled={safeIndex === 0}>
          {t("cta.back")}
        </button>
        <button type="button" className="btn btn-primary" onClick={goNext} data-testid="quiz-next">
          {safeIndex >= total - 1 ? t("cta.reviewAnswers") : t("cta.next")}
        </button>
      </div>
    </div>
  );
}
