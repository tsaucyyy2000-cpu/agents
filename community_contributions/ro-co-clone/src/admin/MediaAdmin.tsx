import { useState } from "react";
import { useContent } from "../data/ContentContext";
import type { MediaAsset } from "../data/types";

export function MediaAdmin() {
  const { content, upsertMedia, removeMedia } = useContent();
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<MediaAsset>({
    id: "",
    label: "",
    src: "/media/hero-home.jpg",
    alt: "",
    kind: "other",
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Media library</h1>
          <p>
            Photoreal JPEGs plus SVG placeholders for expert/admin tiles ship in{" "}
            <code>/public/media</code>. Add remote URLs or local paths here—do not scrape Ro CDN
            assets.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Add / update asset</h2>
        <div className="admin-form">
          <label>
            ID
            <input
              value={draft.id}
              onChange={(event) => setDraft({ ...draft, id: event.target.value })}
              placeholder="hero-custom"
            />
          </label>
          <label>
            Label
            <input
              value={draft.label}
              onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            />
          </label>
          <label>
            Src (path or https URL)
            <input
              value={draft.src}
              onChange={(event) => setDraft({ ...draft, src: event.target.value })}
            />
          </label>
          <label>
            Alt
            <input
              value={draft.alt}
              onChange={(event) => setDraft({ ...draft, alt: event.target.value })}
            />
          </label>
          <label>
            Kind
            <select
              value={draft.kind}
              onChange={(event) =>
                setDraft({ ...draft, kind: event.target.value as MediaAsset["kind"] })
              }
            >
              <option value="hero">hero</option>
              <option value="category">category</option>
              <option value="product">product</option>
              <option value="guide">guide</option>
              <option value="expert">expert</option>
              <option value="other">other</option>
            </select>
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!draft.id.trim() || !draft.src.trim()) return;
              upsertMedia({
                ...draft,
                id: draft.id.trim(),
                label: draft.label.trim() || draft.id.trim(),
                alt: draft.alt.trim() || draft.label.trim() || draft.id.trim(),
              });
              setMessage("Media asset saved.");
              setDraft({
                id: "",
                label: "",
                src: "/media/hero-home.jpg",
                alt: "",
                kind: "other",
              });
            }}
          >
            Save media
          </button>
        </div>
      </div>

      <div className="media-grid" style={{ marginTop: "1rem" }}>
        {content.media.map((asset) => (
          <article key={asset.id} className="media-tile">
            <img src={asset.src} alt={asset.alt} />
            <div>
              <strong>{asset.label}</strong>
              <div>
                <small>
                  {asset.id} · {asset.kind}
                </small>
              </div>
              <div className="admin-actions" style={{ marginTop: "0.55rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDraft(asset)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    removeMedia(asset.id);
                    setMessage("Media removed.");
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {message ? <p className="toast-ok">{message}</p> : null}
    </div>
  );
}
