import { useState } from "react";
import { useContent } from "../data/ContentContext";
import type { CareArea } from "../data/types";

export function ContentAdmin() {
  const { content, updateHome, updateCategory, setTestimonials } = useContent();
  const [support, setSupport] = useState(content.homeSupport);
  const [goals, setGoals] = useState(content.heroGoals.join("\n"));
  const [slug, setSlug] = useState<CareArea>("weight");
  const category = content.categories.find((item) => item.slug === slug);
  const [title, setTitle] = useState(category?.title ?? "");
  const [lede, setLede] = useState(category?.lede ?? "");
  const [message, setMessage] = useState("");

  function loadCategory(next: CareArea) {
    const found = content.categories.find((item) => item.slug === next);
    setSlug(next);
    setTitle(found?.title ?? "");
    setLede(found?.lede ?? "");
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Site content</h1>
          <p>Update home messaging and category landings. Changes apply immediately.</p>
        </div>
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

      <div className="admin-panel">
        <h2>Testimonials</h2>
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
            setMessage("Testimonial added.");
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
            Add testimonial
          </button>
        </form>
        <table className="admin-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quote</th>
            </tr>
          </thead>
          <tbody>
            {content.testimonials.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message ? <p className="toast-ok">{message}</p> : null}
    </div>
  );
}
