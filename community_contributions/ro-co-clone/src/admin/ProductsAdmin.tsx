import { useState } from "react";
import { useContent } from "../data/ContentContext";
import type { CareArea, Product } from "../data/types";

const emptyProduct: Product = {
  id: "",
  name: "",
  category: "weight",
  meta: "",
  tag: "",
  imageId: "product-glp1",
  active: true,
};

export function ProductsAdmin() {
  const { content, upsertProduct, removeProduct } = useContent();
  const [draft, setDraft] = useState<Product>(emptyProduct);
  const [message, setMessage] = useState("");

  function save() {
    if (!draft.name.trim()) return;
    const product: Product = {
      ...draft,
      id: draft.id || crypto.randomUUID(),
      name: draft.name.trim(),
      meta: draft.meta.trim(),
      tag: draft.tag?.trim() || undefined,
    };
    upsertProduct(product);
    setDraft(emptyProduct);
    setMessage("Product saved.");
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Products</h1>
          <p>Spotlight and category cards read from this list.</p>
        </div>
      </div>

      <div className="admin-panel">
        <h2>{draft.id ? "Edit product" : "Add product"}</h2>
        <div className="admin-form">
          <label>
            Name
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </label>
          <label>
            Category
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value as CareArea })
              }
            >
              <option value="weight">Weight</option>
              <option value="sexual-health">Sexual health</option>
              <option value="hair">Hair</option>
              <option value="skin">Skin</option>
            </select>
          </label>
          <label>
            Meta
            <input
              value={draft.meta}
              onChange={(event) => setDraft({ ...draft, meta: event.target.value })}
            />
          </label>
          <label>
            Tag
            <input
              value={draft.tag ?? ""}
              onChange={(event) => setDraft({ ...draft, tag: event.target.value })}
            />
          </label>
          <label>
            Image
            <select
              value={draft.imageId}
              onChange={(event) => setDraft({ ...draft, imageId: event.target.value })}
            >
              {content.media.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Active</span>
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
            />
          </label>
          <div className="admin-actions">
            <button type="button" className="btn btn-primary" onClick={save}>
              Save product
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDraft(emptyProduct)}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Catalog</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {content.products.map((product) => (
              <tr key={product.id}>
                <td>
                  <strong>{product.name}</strong>
                  <div>{product.meta}</div>
                </td>
                <td>{product.category}</td>
                <td>{product.active ? "Active" : "Hidden"}</td>
                <td>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setDraft(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        removeProduct(product.id);
                        setMessage("Product removed.");
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message ? <p className="toast-ok">{message}</p> : null}
    </div>
  );
}
