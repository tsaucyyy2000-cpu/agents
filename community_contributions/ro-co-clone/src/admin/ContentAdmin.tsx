import { useState } from "react";
import { useContent } from "../data/ContentContext";
import type { QuizDefinition, QuizStepDef } from "../data/quizEngine";
import { defaultQuestionnaires } from "../data/quizQuestions";
import type { CareArea, OrphanPublishFlags } from "../data/types";

const ORPHAN_LABELS: { key: keyof OrphanPublishFlags; label: string; hint: string }[] = [
  {
    key: "testimonials",
    label: "Publish testimonials on customer home",
    hint: "Requires approved quotes — do not invent member stories.",
  },
  {
    key: "experts",
    label: "Publish clinician cards on customer home",
    hint: "Requires approved bios and portraits — do not invent credentials.",
  },
  {
    key: "moreCare",
    label: "Publish more-care tiles on customer home",
    hint: "Requires approved adjacent care assets — no faux verticals.",
  },
  {
    key: "vanityStats",
    label: "Publish vanity stats (member count / satisfaction)",
    hint: "Requires verified figures — empty by default (no 3M+ / 95% placeholders).",
  },
];

function stepsToEditor(steps: QuizStepDef[]): string {
  return steps
    .map((step) => {
      const parts = [
        `id=${step.id}`,
        `type=${step.type}`,
        `label=${step.label}`,
      ];
      if (step.help) parts.push(`help=${step.help}`);
      if (step.unit) parts.push(`unit=${step.unit}`);
      if (step.required === false) parts.push("required=false");
      if (step.min !== undefined) parts.push(`min=${step.min}`);
      if (step.max !== undefined) parts.push(`max=${step.max}`);
      if (step.options?.length) parts.push(`options=${step.options.join("|")}`);
      if (step.showIf?.fieldId) {
        if (step.showIf.equals !== undefined) {
          parts.push(`showIf=${step.showIf.fieldId}==${step.showIf.equals}`);
        } else if (step.showIf.notEquals !== undefined) {
          parts.push(`showIf=${step.showIf.fieldId}!=${step.showIf.notEquals}`);
        } else if (step.showIf.anyOf?.length) {
          parts.push(`showIf=${step.showIf.fieldId}in:${step.showIf.anyOf.join("|")}`);
        }
      }
      return parts.join("; ");
    })
    .join("\n");
}

function parseStepsEditor(raw: string): QuizStepDef[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const map = new Map<string, string>();
      for (const part of line.split(";")) {
        const trimmed = part.trim();
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        map.set(trimmed.slice(0, eq).trim(), trimmed.slice(eq + 1).trim());
      }
      const id = map.get("id") || crypto.randomUUID().slice(0, 8);
      const typeRaw = map.get("type") || "choice";
      const type: QuizStepDef["type"] =
        typeRaw === "number" || typeRaw === "text" ? typeRaw : "choice";
      const showRaw = map.get("showIf");
      let showIf: QuizStepDef["showIf"];
      if (showRaw) {
        if (showRaw.includes("==")) {
          const [fieldId, equals] = showRaw.split("==");
          showIf = { fieldId: fieldId.trim(), equals: equals.trim() };
        } else if (showRaw.includes("!=")) {
          const [fieldId, notEquals] = showRaw.split("!=");
          showIf = { fieldId: fieldId.trim(), notEquals: notEquals.trim() };
        } else if (showRaw.includes("in:")) {
          const [fieldId, list] = showRaw.split("in:");
          showIf = {
            fieldId: fieldId.trim(),
            anyOf: list.split("|").map((item) => item.trim()).filter(Boolean),
          };
        }
      }
      return {
        id,
        label: map.get("label") || id,
        help: map.get("help"),
        type,
        unit: map.get("unit"),
        required: map.get("required") === "false" ? false : undefined,
        min: map.get("min") ? Number(map.get("min")) : undefined,
        max: map.get("max") ? Number(map.get("max")) : undefined,
        options: map.get("options")
          ? map
              .get("options")!
              .split("|")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        showIf,
      } satisfies QuizStepDef;
    });
}

export function ContentAdmin() {
  const {
    content,
    updateHome,
    updateCategory,
    setTestimonials,
    setExperts,
    setMoreCare,
    updateOrphanPublish,
    upsertQuestionnaire,
    setQuestionnaires,
  } = useContent();
  const [support, setSupport] = useState(content.homeSupport);
  const [goals, setGoals] = useState(content.heroGoals.join("\n"));
  const [slug, setSlug] = useState<CareArea>("weight");
  const category = content.categories.find((item) => item.slug === slug);
  const [title, setTitle] = useState(category?.title ?? "");
  const [lede, setLede] = useState(category?.lede ?? "");
  const [message, setMessage] = useState("");
  const [quizSlug, setQuizSlug] = useState(
    content.questionnaires[0]?.slug ?? defaultQuestionnaires[0].slug,
  );
  const activeQuiz =
    content.questionnaires.find((item) => item.slug === quizSlug) ??
    defaultQuestionnaires.find((item) => item.slug === quizSlug) ??
    defaultQuestionnaires[0];
  const [quizName, setQuizName] = useState(activeQuiz.name);
  const [quizBlurb, setQuizBlurb] = useState(activeQuiz.blurb);
  const [quizSteps, setQuizSteps] = useState(stepsToEditor(activeQuiz.steps));

  function loadCategory(next: CareArea) {
    const found = content.categories.find((item) => item.slug === next);
    setSlug(next);
    setTitle(found?.title ?? "");
    setLede(found?.lede ?? "");
  }

  function loadQuiz(nextSlug: string) {
    const found =
      content.questionnaires.find((item) => item.slug === nextSlug) ??
      defaultQuestionnaires.find((item) => item.slug === nextSlug);
    setQuizSlug(nextSlug);
    setQuizName(found?.name ?? nextSlug);
    setQuizBlurb(found?.blurb ?? "");
    setQuizSteps(stepsToEditor(found?.steps ?? []));
  }

  const anyPublished = Object.values(content.orphanPublish).some(Boolean);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Site content</h1>
          <p>Update home messaging and category landings. Changes apply immediately.</p>
        </div>
      </div>

      <div className="admin-panel admin-orphan-gate" data-testid="orphan-publish-gate">
        <h2>Orphan content publish gate</h2>
        <p className="admin-orphan-lede">
          Testimonials, experts, more-care tiles, and vanity stats are{" "}
          <strong>staged in admin only</strong> until an explicit publish switch is on. Customer
          pages use a stripped snapshot — unpublished orphans cannot leak. Do not invent bios,
          testimonials, or stats (preferences).
        </p>
        <div className="admin-orphan-flags">
          {ORPHAN_LABELS.map((item) => (
            <label key={item.key} className="admin-orphan-flag">
              <input
                type="checkbox"
                checked={content.orphanPublish[item.key]}
                onChange={(event) =>
                  updateOrphanPublish({ [item.key]: event.target.checked })
                }
              />
              <span>
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
            </label>
          ))}
        </div>
        <p className={`admin-orphan-status ${anyPublished ? "is-open" : "is-closed"}`}>
          {anyPublished
            ? "One or more orphan blocks may appear on customer home if staged rows exist."
            : "All orphan blocks gated off — customer UI stays clear of testimonials / experts / moreCare / vanity stats."}
        </p>
      </div>

      <div className="admin-panel">
        <h2>Home</h2>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            updateHome({
              homeSupport: support,
              heroGoals: goals
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            });
            setMessage("Home content saved.");
          }}
        >
          <label>
            Support copy
            <textarea value={support} onChange={(event) => setSupport(event.target.value)} />
          </label>
          <label>
            Rotating goals (one per line)
            <textarea value={goals} onChange={(event) => setGoals(event.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">
            Save home
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <h2>Category pages</h2>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            updateCategory(slug, { title, lede });
            setMessage(`Saved ${slug} category.`);
          }}
        >
          <label>
            Category
            <select
              value={slug}
              onChange={(event) => loadCategory(event.target.value as CareArea)}
            >
              {content.categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.eyebrow}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Lede
            <textarea value={lede} onChange={(event) => setLede(event.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">
            Save category
          </button>
        </form>
      </div>

      <div className="admin-panel" data-testid="admin-questionnaires">
        <h2>Questionnaires</h2>
        <p className="admin-orphan-lede">
          Edit quiz copy and steps without a code change. One step per line. Branching uses{" "}
          <code>showIf=field==value</code>, <code>!=</code>, or <code>in:a|b</code>. Never encode
          diagnosis or prescribing outcomes in step text.
        </p>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            const steps = parseStepsEditor(quizSteps);
            if (!steps.length) {
              setMessage("Add at least one questionnaire step.");
              return;
            }
            const next: QuizDefinition = {
              slug: quizSlug,
              name: quizName.trim() || quizSlug,
              careArea: activeQuiz.careArea,
              blurb: quizBlurb,
              steps,
            };
            upsertQuestionnaire(next);
            setMessage(`Saved questionnaire ${quizSlug}.`);
          }}
        >
          <label>
            Questionnaire
            <select value={quizSlug} onChange={(event) => loadQuiz(event.target.value)}>
              {content.questionnaires.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name} ({item.slug})
                </option>
              ))}
            </select>
          </label>
          <label>
            Display name
            <input value={quizName} onChange={(event) => setQuizName(event.target.value)} />
          </label>
          <label>
            Blurb
            <textarea value={quizBlurb} onChange={(event) => setQuizBlurb(event.target.value)} />
          </label>
          <label>
            Steps (one per line)
            <textarea
              value={quizSteps}
              rows={12}
              data-testid="admin-questionnaire-steps"
              onChange={(event) => setQuizSteps(event.target.value)}
            />
          </label>
          <div className="admin-actions">
            <button className="btn btn-primary" type="submit">
              Save questionnaire
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                const defaults = structuredClone(defaultQuestionnaires);
                setQuestionnaires(defaults);
                const found = defaults.find((item) => item.slug === quizSlug) ?? defaults[0];
                setQuizSlug(found.slug);
                setQuizName(found.name);
                setQuizBlurb(found.blurb);
                setQuizSteps(stepsToEditor(found.steps));
                setMessage("Questionnaires reset to defaults.");
              }}
            >
              Reset all questionnaires
            </button>
          </div>
        </form>
      </div>

      <div className="admin-panel">
        <h2>
          Testimonials{" "}
          <span className="admin-stage-badge">
            {content.orphanPublish.testimonials ? "Published" : "Staged · not on customer UI"}
          </span>
        </h2>
        <p className="admin-orphan-lede">
          Ship empty by default. Add only approved quotes — never invent member stories.
        </p>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const quote = String(form.get("quote") ?? "").trim();
            const name = String(form.get("name") ?? "").trim();
            if (!quote || !name) return;
            setTestimonials([
              ...content.testimonials,
              { id: crypto.randomUUID(), quote, name },
            ]);
            event.currentTarget.reset();
            setMessage("Testimonial staged (customer publish still gated unless enabled above).");
          }}
        >
          <label>
            Quote
            <input name="quote" required />
          </label>
          <label>
            Name
            <input name="name" required />
          </label>
          <button className="btn btn-primary" type="submit">
            Stage testimonial
          </button>
        </form>
        <table className="admin-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quote</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {content.testimonials.length === 0 ? (
              <tr>
                <td colSpan={3}>No staged testimonials.</td>
              </tr>
            ) : (
              content.testimonials.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quote}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setTestimonials(content.testimonials.filter((row) => row.id !== item.id));
                        setMessage("Testimonial removed.");
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-panel">
        <h2>
          Experts{" "}
          <span className="admin-stage-badge">
            {content.orphanPublish.experts ? "Published" : "Staged · not on customer UI"}
          </span>
        </h2>
        <p className="admin-orphan-lede">
          Empty by default. Stage approved clinician cards only — no placeholder bios on customer
          home.
        </p>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const name = String(form.get("name") ?? "").trim();
            const role = String(form.get("role") ?? "").trim();
            const imageId = String(form.get("imageId") ?? "").trim();
            if (!name || !role || !imageId) return;
            setExperts([...content.experts, { id: crypto.randomUUID(), name, role, imageId }]);
            event.currentTarget.reset();
            setMessage("Expert staged (customer publish still gated unless enabled above).");
          }}
        >
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Role / bio line
            <input name="role" required />
          </label>
          <label>
            Media asset id
            <input name="imageId" placeholder="expert-1" required />
          </label>
          <button className="btn btn-primary" type="submit">
            Stage expert
          </button>
        </form>
        <table className="admin-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Media</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {content.experts.length === 0 ? (
              <tr>
                <td colSpan={4}>No staged experts.</td>
              </tr>
            ) : (
              content.experts.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.role}</td>
                  <td>{item.imageId}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setExperts(content.experts.filter((row) => row.id !== item.id));
                        setMessage("Expert removed.");
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-panel">
        <h2>
          More care{" "}
          <span className="admin-stage-badge">
            {content.orphanPublish.moreCare ? "Published" : "Staged · not on customer UI"}
          </span>
        </h2>
        <p className="admin-orphan-lede">
          Empty by default. Do not invent adjacent verticals that redirect to Help / How it works.
        </p>
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const titleValue = String(form.get("title") ?? "").trim();
            const copy = String(form.get("copy") ?? "").trim();
            const imageId = String(form.get("imageId") ?? "").trim();
            const to = String(form.get("to") ?? "").trim();
            if (!titleValue || !copy || !imageId || !to) return;
            setMoreCare([
              ...content.moreCare,
              { id: crypto.randomUUID(), title: titleValue, copy, imageId, to },
            ]);
            event.currentTarget.reset();
            setMessage("More-care tile staged (customer publish still gated unless enabled above).");
          }}
        >
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Copy
            <input name="copy" required />
          </label>
          <label>
            Media asset id
            <input name="imageId" placeholder="more-fertility" required />
          </label>
          <label>
            Link path
            <input name="to" placeholder="/help" required />
          </label>
          <button className="btn btn-primary" type="submit">
            Stage more-care tile
          </button>
        </form>
        <table className="admin-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>To</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {content.moreCare.length === 0 ? (
              <tr>
                <td colSpan={3}>No staged more-care tiles.</td>
              </tr>
            ) : (
              content.moreCare.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.to}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setMoreCare(content.moreCare.filter((row) => row.id !== item.id));
                        setMessage("More-care tile removed.");
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {message ? <p className="toast-ok">{message}</p> : null}
    </div>
  );
}
