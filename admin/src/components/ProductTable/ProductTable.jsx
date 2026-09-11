import { CATEGORY_LABELS, formatPrice } from "../../utils/format";
import "./productTable.css";

export default function ProductTable({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return <div className="table-empty">مفيش منتجات لسه. ابدأ بإضافة أول منتج.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الفئة</th>
            <th>السعر</th>
            <th>الألوان</th>
            <th>المقاسات</th>
            <th>المخزون</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="product-cell">
                  <span className="product-cell__swatch" style={{ background: p.colors?.[0]?.hex || "#333" }} />
                  <div>
                    <p className="product-cell__name">{p.name}</p>
                    <p className="product-cell__slug">{p.slug}</p>
                  </div>
                </div>
              </td>
              <td>{CATEGORY_LABELS[p.category] || p.category}</td>
              <td>{formatPrice(p.price)}</td>
              <td>
                <div className="dot-row">
                  {p.colors?.map((c) => (
                    <span key={c.name} className="dot" style={{ background: c.hex }} title={c.name} />
                  ))}
                </div>
              </td>
              <td>{p.sizes?.join(", ")}</td>
              <td>
                <span className={`stock-badge ${p.stock <= 10 ? "stock-badge--low" : ""}`}>{p.stock ?? "—"}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button className="btn-icon" onClick={() => onEdit(p)} aria-label="تعديل">
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button className="btn-icon" onClick={() => onDelete(p)} aria-label="حذف">
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                      <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
