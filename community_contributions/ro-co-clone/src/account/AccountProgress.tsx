import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  SAFE_PROGRESS_NOTIFY,
  SIDE_EFFECT_OPTIONS,
  WEIGHT_PROGRESS_STORE_KEY,
  addWeightCheckIn,
  clearWeightProgressStore,
  currentWeightLb,
  formatWeight,
  getHabitsForDate,
  lbToDisplay,
  loadWeightProgressStore,
  needsEscalation,
  remainingToGoalLb,
  saveHabitsForDate,
  saveWeightGoals,
  setWeightUnit,
  sortedCheckIns,
  subscribeWeightProgressStore,
  todayLocalIso,
  weightDeltaLb,
  type HabitDayStub,
  type WeightProgressStore,
  type WeightUnit,
} from "../progress/weightProgressStore";

type AccountProgressProps = {
  preview?: boolean;
};

function withPreview(to: string, preview: boolean): string {
  if (!preview) return to;
  const [path, existing] = to.split("?");
  const params = new URLSearchParams(existing ?? "");
  params.set("previewShell", "1");
  const q = params.toString();
  return q ? `${path}?${q}` : path;
}

function WeightChart({
  store,
  unit,
}: {
  store: WeightProgressStore;
  unit: WeightUnit;
}) {
  const points = useMemo(() => {
    const checks = sortedCheckIns(store);
    const start = store.profile.startingWeightLb;
    const series: { label: string; lb: number }[] = [];
    if (start != null && (checks.length === 0 || checks[0].date !== "start")) {
      series.push({ label: "Start", lb: start });
    }
    for (const c of checks) {
      series.push({ label: c.date.slice(5), lb: c.weightLb });
    }
    return series;
  }, [store]);

  if (points.length < 2) {
    return (
      <div className="progress-chart-empty" data-testid="progress-chart-empty">
        <p>Add at least one weekly check-in to see your trend chart.</p>
      </div>
    );
  }

  const width = 560;
  const height = 200;
  const padX = 28;
  const padY = 24;
  const lbs = points.map((p) => p.lb);
  const goal = store.profile.goalWeightLb;
  const minLb = Math.min(...lbs, goal ?? Infinity) - 4;
  const maxLb = Math.max(...lbs, goal ?? -Infinity) + 4;
  const span = Math.max(maxLb - minLb, 1);

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (p.lb - minLb) / span) * (height - padY * 2);
    return { ...p, x, y };
  });

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const goalY =
    goal != null ? padY + (1 - (goal - minLb) / span) * (height - padY * 2) : null;

  return (
    <div className="progress-chart" data-testid="progress-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Weight trend chart">
        {goalY != null ? (
          <g>
            <line
              x1={padX}
              x2={width - padX}
              y1={goalY}
              y2={goalY}
              className="progress-chart-goal"
            />
            <text x={width - padX} y={goalY - 6} textAnchor="end" className="progress-chart-goal-label">
              Goal {formatWeight(goal!, unit)}
            </text>
          </g>
        ) : null}
        <path d={line} className="progress-chart-line" fill="none" />
        {coords.map((c) => (
          <g key={`${c.label}-${c.lb}`}>
            <circle cx={c.x} cy={c.y} r={5} className="progress-chart-dot" />
            <text x={c.x} y={height - 4} textAnchor="middle" className="progress-chart-x">
              {c.label}
            </text>
            <text x={c.x} y={c.y - 10} textAnchor="middle" className="progress-chart-y">
              {lbToDisplay(c.lb, unit)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function AccountProgress({ preview = false }: AccountProgressProps) {
  const [store, setStore] = useState<WeightProgressStore>(() => loadWeightProgressStore());
  const [toast, setToast] = useState<string | null>(null);

  const unit = store.profile.unit;
  const [startInput, setStartInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [checkWeight, setCheckWeight] = useState("");
  const [checkNote, setCheckNote] = useState("");
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [showEscalation, setShowEscalation] = useState(false);
  const [habits, setHabits] = useState<HabitDayStub>(() => getHabitsForDate());

  function refresh() {
    const next = loadWeightProgressStore();
    setStore(next);
    setHabits(getHabitsForDate());
  }

  useEffect(() => {
    refresh();
    return subscribeWeightProgressStore(refresh);
  }, []);

  useEffect(() => {
    const start = store.profile.startingWeightLb;
    const goal = store.profile.goalWeightLb;
    setStartInput(start != null ? String(lbToDisplay(start, unit)) : "");
    setGoalInput(goal != null ? String(lbToDisplay(goal, unit)) : "");
  }, [store.profile.startingWeightLb, store.profile.goalWeightLb, unit]);

  function flash(safeCopy: string) {
    setToast(safeCopy);
    window.setTimeout(() => setToast(null), 2800);
  }

  function handleUnitToggle(next: WeightUnit) {
    if (next === unit) return;
    setWeightUnit(next);
    refresh();
    flash(SAFE_PROGRESS_NOTIFY.unitChanged);
  }

  function handleSaveGoals(event: FormEvent) {
    event.preventDefault();
    const startingWeight = Number(startInput);
    const goalWeight = Number(goalInput);
    if (!Number.isFinite(startingWeight) || !Number.isFinite(goalWeight)) return;
    if (startingWeight <= 0 || goalWeight <= 0) return;
    saveWeightGoals({ startingWeight, goalWeight, unit });
    refresh();
    flash(SAFE_PROGRESS_NOTIFY.profileSaved);
  }

  function toggleSideEffect(id: string) {
    setSideEffects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleCheckIn(event: FormEvent) {
    event.preventDefault();
    const weight = Number(checkWeight);
    if (!Number.isFinite(weight) || weight <= 0) return;
    addWeightCheckIn({
      weight,
      unit,
      note: checkNote,
      sideEffects,
    });
    const escalate = needsEscalation(sideEffects);
    setCheckWeight("");
    setCheckNote("");
    setSideEffects([]);
    setShowEscalation(escalate);
    refresh();
    flash(
      escalate ? SAFE_PROGRESS_NOTIFY.escalation : SAFE_PROGRESS_NOTIFY.checkInSaved,
    );
  }

  function handleHabitsSave(event: FormEvent) {
    event.preventDefault();
    saveHabitsForDate(habits);
    refresh();
    flash(SAFE_PROGRESS_NOTIFY.habitsSaved);
  }

  function handleClear() {
    clearWeightProgressStore();
    setShowEscalation(false);
    setSideEffects([]);
    setCheckWeight("");
    setCheckNote("");
    refresh();
    flash(SAFE_PROGRESS_NOTIFY.cleared);
  }

  const current = currentWeightLb(store);
  const delta = weightDeltaLb(store);
  const remaining = remainingToGoalLb(store);
  const hasGoals =
    store.profile.startingWeightLb != null && store.profile.goalWeightLb != null;
  const checkIns = sortedCheckIns(store);

  return (
    <div className="account-section" data-testid="account-progress">
      <header className="account-section-head">
        <p className="section-kicker">Progress</p>
        <h2>Weight & habit tracking</h2>
        <p>
          Log starting, current, and goal weight plus weekly check-ins on this device. Habit,
          hydration, and activity rows are stubs. This screen never recommends medication doses and
          never invents clinician notes — side-effect concerns route to messaging or appointments.
        </p>
      </header>

      <div className="account-chip-row" aria-label="Progress status chips">
        <span className="account-chip account-chip-peach">Local sandbox only</span>
        <span className="account-chip account-chip-mint">
          <code>{WEIGHT_PROGRESS_STORE_KEY}</code>
        </span>
        <span className="account-chip account-chip-warn">No dose advice</span>
      </div>

      {toast ? (
        <div className="progress-toast" data-testid="progress-toast" role="status">
          {toast}
        </div>
      ) : null}

      <div className="progress-toolbar">
        <div
          className="progress-unit-toggle"
          role="group"
          aria-label="Weight units"
          data-testid="progress-unit-toggle"
        >
          <button
            type="button"
            className={unit === "lb" ? "is-active" : undefined}
            data-testid="progress-unit-lb"
            onClick={() => handleUnitToggle("lb")}
          >
            lb
          </button>
          <button
            type="button"
            className={unit === "kg" ? "is-active" : undefined}
            data-testid="progress-unit-kg"
            onClick={() => handleUnitToggle("kg")}
          >
            kg
          </button>
        </div>
        {hasGoals ? (
          <button
            type="button"
            className="btn btn-ghost"
            data-testid="progress-clear"
            onClick={handleClear}
          >
            Clear local data
          </button>
        ) : null}
      </div>

      <div className="progress-summary" data-testid="progress-summary">
        <article className="progress-stat">
          <p className="progress-stat-label">Starting</p>
          <p className="progress-stat-value" data-testid="progress-stat-starting">
            {store.profile.startingWeightLb != null
              ? formatWeight(store.profile.startingWeightLb, unit)
              : "—"}
          </p>
        </article>
        <article className="progress-stat">
          <p className="progress-stat-label">Current</p>
          <p className="progress-stat-value" data-testid="progress-stat-current">
            {current != null ? formatWeight(current, unit) : "—"}
          </p>
          {delta != null ? (
            <p className="progress-stat-meta">
              {delta === 0
                ? "No change from start"
                : delta < 0
                  ? `${formatWeight(Math.abs(delta), unit)} below start`
                  : `${formatWeight(delta, unit)} above start`}
            </p>
          ) : null}
        </article>
        <article className="progress-stat">
          <p className="progress-stat-label">Goal</p>
          <p className="progress-stat-value" data-testid="progress-stat-goal">
            {store.profile.goalWeightLb != null
              ? formatWeight(store.profile.goalWeightLb, unit)
              : "—"}
          </p>
          {remaining != null ? (
            <p className="progress-stat-meta">
              {remaining <= 0
                ? "At or past goal mark"
                : `${formatWeight(remaining, unit)} to go`}
            </p>
          ) : null}
        </article>
      </div>

      <div className="account-panel-grid progress-panels">
        <form
          className="account-card"
          data-testid="progress-goals-form"
          onSubmit={handleSaveGoals}
        >
          <h3>{hasGoals ? "Update goals" : "Set starting & goal weight"}</h3>
          <p className="account-card-lede">
            Saved in this browser only. Values convert when you switch lb / kg.
          </p>
          <div className="progress-form-row">
            <label>
              Starting ({unit})
              <input
                type="number"
                inputMode="decimal"
                min={1}
                step="0.1"
                required
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                data-testid="progress-start-input"
              />
            </label>
            <label>
              Goal ({unit})
              <input
                type="number"
                inputMode="decimal"
                min={1}
                step="0.1"
                required
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                data-testid="progress-goal-input"
              />
            </label>
          </div>
          <div className="account-toolbar">
            <button type="submit" className="btn btn-primary" data-testid="progress-goals-save">
              Save goals
            </button>
          </div>
        </form>

        <form
          className="account-card"
          data-testid="progress-checkin-form"
          onSubmit={handleCheckIn}
        >
          <h3>Weekly check-in</h3>
          <p className="account-card-lede">
            Today’s date: <strong>{todayLocalIso()}</strong>. Re-saving overwrites today’s entry.
          </p>
          <label>
            Weight ({unit})
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step="0.1"
              required
              value={checkWeight}
              onChange={(e) => setCheckWeight(e.target.value)}
              data-testid="progress-checkin-weight"
            />
          </label>
          <label>
            Note (optional · stays on this screen)
            <textarea
              rows={2}
              value={checkNote}
              onChange={(e) => setCheckNote(e.target.value)}
              data-testid="progress-checkin-note"
              placeholder="How you’re feeling — not a clinician chart note"
            />
          </label>
          <fieldset className="progress-side-effects" data-testid="progress-side-effects">
            <legend>Side effects to flag</legend>
            <p>
              Flagging concerning symptoms opens messaging and appointment links. This does{" "}
              <strong>not</strong> adjust doses and does not create clinician notes.
            </p>
            <div className="progress-side-effect-grid">
              {SIDE_EFFECT_OPTIONS.map((opt) => (
                <label key={opt.id} className="progress-side-effect">
                  <input
                    type="checkbox"
                    checked={sideEffects.includes(opt.id)}
                    onChange={() => toggleSideEffect(opt.id)}
                    data-testid={`progress-se-${opt.id}`}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="account-toolbar">
            <button
              type="submit"
              className="btn btn-primary"
              data-testid="progress-checkin-save"
              disabled={!hasGoals}
            >
              Save check-in
            </button>
          </div>
          {!hasGoals ? (
            <p className="progress-inline-hint">Set starting and goal weight before check-ins.</p>
          ) : null}
        </form>
      </div>

      {showEscalation ? (
        <aside
          className="account-card progress-escalation"
          data-testid="progress-escalation"
          role="region"
          aria-label="Side-effect escalation"
        >
          <h3>Talk with care support</h3>
          <p>
            You flagged symptoms that may need a human reply. Use messaging or book a visit. This
            product does <strong>not</strong> recommend medication dose changes and will not invent
            clinician notes.
          </p>
          <div className="account-toolbar">
            <Link
              className="btn btn-primary"
              to={withPreview("/account/messages", preview)}
              data-testid="progress-escalate-messages"
            >
              Message support
            </Link>
            <Link
              className="btn btn-ghost"
              to={withPreview("/account/appointments", preview)}
              data-testid="progress-escalate-appointments"
            >
              Book appointment
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              data-testid="progress-escalate-dismiss"
              onClick={() => setShowEscalation(false)}
            >
              Dismiss
            </button>
          </div>
        </aside>
      ) : null}

      <div className="account-card" data-testid="progress-chart-card">
        <h3>Trend</h3>
        <p className="account-card-lede">
          Simple local chart from your check-ins. Not a clinical outcome prediction.
        </p>
        <WeightChart store={store} unit={unit} />
      </div>

      <div className="account-panel-grid progress-panels">
        <form
          className="account-card"
          data-testid="progress-habits-form"
          onSubmit={handleHabitsSave}
        >
          <h3>Habits · hydration · activity</h3>
          <p className="account-card-lede">
            Stub trackers for today ({habits.date}). Not synced to a coach or clinician.
          </p>
          <div className="progress-habit-meters">
            <label>
              Hydration (glasses)
              <input
                type="range"
                min={0}
                max={12}
                value={habits.hydrationGlasses}
                onChange={(e) =>
                  setHabits((h) => ({ ...h, hydrationGlasses: Number(e.target.value) }))
                }
                data-testid="progress-hydration"
              />
              <span data-testid="progress-hydration-value">{habits.hydrationGlasses} / 12</span>
            </label>
            <label>
              Activity (minutes)
              <input
                type="number"
                min={0}
                max={600}
                value={habits.activityMinutes}
                onChange={(e) =>
                  setHabits((h) => ({ ...h, activityMinutes: Number(e.target.value) || 0 }))
                }
                data-testid="progress-activity"
              />
            </label>
          </div>
          <ul className="account-pref-list">
            <li>
              <label className="account-pref-row">
                <input
                  type="checkbox"
                  checked={habits.proteinGoal}
                  onChange={(e) =>
                    setHabits((h) => ({ ...h, proteinGoal: e.target.checked }))
                  }
                  data-testid="progress-habit-protein"
                />
                <span>
                  <strong>Protein goal</strong>
                  <em>Stub checkbox · local only</em>
                </span>
              </label>
            </li>
            <li>
              <label className="account-pref-row">
                <input
                  type="checkbox"
                  checked={habits.sleepGoal}
                  onChange={(e) => setHabits((h) => ({ ...h, sleepGoal: e.target.checked }))}
                  data-testid="progress-habit-sleep"
                />
                <span>
                  <strong>Sleep goal</strong>
                  <em>Stub checkbox · local only</em>
                </span>
              </label>
            </li>
            <li>
              <label className="account-pref-row">
                <input
                  type="checkbox"
                  checked={habits.movementGoal}
                  onChange={(e) =>
                    setHabits((h) => ({ ...h, movementGoal: e.target.checked }))
                  }
                  data-testid="progress-habit-movement"
                />
                <span>
                  <strong>Movement goal</strong>
                  <em>Stub checkbox · local only</em>
                </span>
              </label>
            </li>
          </ul>
          <div className="account-toolbar">
            <button type="submit" className="btn btn-primary" data-testid="progress-habits-save">
              Save today’s stubs
            </button>
          </div>
        </form>

        <div className="account-card" data-testid="progress-history">
          <h3>Check-in history</h3>
          {checkIns.length === 0 ? (
            <p className="account-card-lede">No weekly check-ins yet.</p>
          ) : (
            <ul className="progress-history-list">
              {[...checkIns].reverse().map((c) => (
                <li key={c.id} data-testid="progress-history-item">
                  <strong>{c.date}</strong>
                  <span>{formatWeight(c.weightLb, unit)}</span>
                  {c.sideEffects?.length ? (
                    <em>{c.sideEffects.join(", ")}</em>
                  ) : (
                    <em>No side effects flagged</em>
                  )}
                  {c.note ? <p>{c.note}</p> : null}
                </li>
              ))}
            </ul>
          )}
          <div className="account-toolbar">
            <Link className="btn btn-ghost" to="/weight-loss">
              Weight care landing
            </Link>
            <Link className="btn btn-ghost" to="/guides">
              Browse guides
            </Link>
            <Link className="btn btn-ghost" to="/safety">
              Safety hub
            </Link>
          </div>
        </div>
      </div>

      <div className="callout" data-testid="progress-honesty">
        <p>
          <strong>Honesty:</strong> Progress data lives in browser{" "}
          <code>localStorage</code> under <code>{WEIGHT_PROGRESS_STORE_KEY}</code>. Labs, pharmacy
          tracking, and durable charts need a future backend. Never treat this as a medical record
          or dose guide.
        </p>
      </div>
    </div>
  );
}
