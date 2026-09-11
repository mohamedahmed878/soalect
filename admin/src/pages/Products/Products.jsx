import { useEffect, useState } from "react";
import ProductTable from "../../components/ProductTable/ProductTable";
import ProductForm from "./ProductForm";
import { adminApi } from "../../services/api";
import { CATEGORY_LABELS } from "../../utils/format";

export default function Products() {
  const [products, setProducts] = useState(null);
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState(null); // product being edited, or {} for "new"
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    adminApi.getProducts().then(setProducts);
  }, []);

  async function handleSave(data) {
    if (editing && editing.id) {
      const updated = await adminApi.updateProduct(editing.id, data);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await adminApi.createProduct(data);
      setProducts((prev) => [created, ...prev]);
    }
    setEditing(null);
  }

  async function handleDelete(product) {
    await adminApi.deleteProduct(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setConfirmDelete(null);
  }

  const filtered = products
    ? category === "all"
      ? products
      : products.filter((p) => p.category === category)
    : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>المنتجات</h1>
          <p>أضف، عدّل، أو احذف منتجات المتجر.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>+ إضافة منتج</button>
      </div>

      <div className="chip-select" style={{ marginBottom: 20 }}>
        <button className={`chip ${category === "all" ? "is-active" : ""}`} onClick={() => setCategory("all")}>
          الكل
        </button>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <button key={value} className={`chip ${category === value ? "is-active" : ""}`} onClick={() => setCategory(value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        {!filtered ? (
          <div className="table-empty">جاري التحميل...</div>
        ) : (
          <ProductTable products={filtered} onEdit={setEditing} onDelete={setConfirmDelete} />
        )}
      </div>

      {editing && (
        <ProductForm
          initial={editing.id ? editing : null}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>حذف "{confirmDelete.name}"؟</h3>
            <p style={{ color: "var(--text-mid)", fontSize: 14, marginBottom: 24 }}>
              الإجراء ده مش هينفع يتراجع فيه. المنتج هيتشال من المتجر نهائيًا.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirmDelete)}>
                نعم، احذف
              </button>
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
