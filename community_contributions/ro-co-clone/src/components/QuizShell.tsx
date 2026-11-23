import { useState } from "react";
import type { QuizTreatment } from "../data/quizQuestions";
import "./QuizShell.css";

type Props = {
  treatment: QuizTreatment;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  onComplete: () => void;
};

export function QuizShell({ treatment, answers, onAnswer, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const total = treatment.questions.length;
  const question = treatment.questions[index];

  if (!question) return null;

  const value = answers[question.id] ?? "";
  const trimmed = value.trim();
  const valid =
    trimmed.length > 0 &&
    (question.type !== "number" || Number(trimmed) > 0);
  const progressPct = Math.round(((index + 1) / total) * 100);

  function next() {
    setTouched(true);
    if (!valid) return;
    if (index >= total - 1) {
      onComplete();
      return;
    }
    setTouched(false);
    setIndex((current) => current + 1);
  }

  function back() {
    setTouched(false);
    setIndex((current) => Math.max(0, current - 1));
  }

  return (
    <div className="quiz-shell" data-testid="quiz-shell">
      <div className="quiz-progress" aria-hidden="true">
        <div className="quiz-progress-bar" style={{ width: `${progressPct}%` }} />
      </div>
      <p className="quiz-progress-label">
        Question {index + 1} of {total}
      </p>

      <h2>{question.label}</h2>
      {question.help ? <p className="lede">{question.help}</p> : null}

      {question.type === "choice" && question.options ? (
        <div className="quiz-choice-grid" role="group" aria-label={question.label}>
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              className={value === option ? "selected" : ""}
              aria-pressed={value === option}
              onClick={() => {
                onAnswer(question.id, option);
                setTouched(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      {question.type === "number" ? (
        <label className="field quiz-number-field">
          <span className="sr-only">{question.label}</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={value}
            onChange={(event) => {
              onAnswer(question.id, event.target.value);
              setTouched(false);
            }}
          />
          {question.unit ? <span className="quiz-unit">{question.unit}</span> : null}
        </label>
      ) : null}

      {question.type === "text" ? (
        <label className="field">
          <span className="sr-only">{question.label}</span>
          <textarea
            rows={4}
            value={value}
            placeholder="Optional demo notes"
            onChange={(event) => {
              onAnswer(question.id, event.target.value);
              setTouched(false);
            }}
          />
        </label>
      ) : null}

      {touched && !valid ? (
        <p className="field-error" role="alert">
          An answer is needed to continue.
        </p>
      ) : null}

      <div className="quiz-actions">
        <button type="button" className="btn btn-secondary" onClick={back} disabled={index === 0}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={next}>
          {index >= total - 1 ? "Continue to visit" : "Next"}
        </button>
      </div>
    </div>
  );
}
