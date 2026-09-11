import { useState, useRef } from "react";
import { adminApi } from "../../services/api";

const CATEGORIES = [
  { value: "tshirts", label: "تيشيرتات" },
  { value: "hoodies", label: "هوديز" },
  { value: "pants", label: "بنطلونات" },
  { value: "accessories", label: "إكسسوارات" },
];

const ALL_SIZES = ["One Size", "S", "M", "L", "XL", "XXL"];

const emptyProduct = {
  name: "",
  nameEn: "",
  category: "tshirts",
  price: "",
  stock: "",
  isNew: false,
  description: "",
  colors: [{ name: "أسود", hex: "#111111" }],
  sizes: ["M"],
  images: [],
};

let uid = 0;

export default function ProductForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial ? { ...emptyProduct, ...initial } : emptyProduct);
  // Images are tracked locally as {id, url, uploading, error} so we can
  // show the picture immediately (via a local blob preview) while the
  // real upload happens in the background, then swap in the server URL.
  const [images, setImages] = useState(
    (initial?.images || []).map((url) => ({ id: `existing-${uid++}`, url, uploading: false }))
  );
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateColor(index, patch) {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  }

  function addColor() {
    setForm((f) => ({ ...f, colors: [...f.colors, { name: "", hex: "#8a8a82" }] }));
  }

  function removeColor(index) {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== index) }));
  }

  function toggleSize(size) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  }

  function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const id = `upload-${uid++}`;
      const previewUrl = URL.createObjectURL(file);

      // Show it in the grid immediately.
      setImages((prev) => [...prev, { id, url: previewUrl, uploading: true, error: false }]);

      adminApi
        .uploadImage(file)
        .then(({ url }) => {
          setImages((prev) => prev.map((img) => (img.id === id ? { ...img, url, uploading: false } : img)));
          URL.revokeObjectURL(previewUrl);
        })
        .catch(() => {
          setImages((prev) => prev.map((img) => (img.id === id ? { ...img, uploading: false, error: true } : img)));
        });
    });
    e.target.value = ""; // allow re-selecting the same file later
  }

  function removeImage(id) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  const stillUploading = images.some((img) => img.uploading);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "ادخل اسم المنتج بالعربي";
    if (!form.nameEn.trim()) next.nameEn = "ادخل اسم المنتج بالإنجليزي";
    if (!form.price || Number(form.price) <= 0) next.price = "ادخل سعر صحيح";
    if (form.sizes.length === 0) next.sizes = "اختر مقاس واحد على الأقل";
    if (form.colors.some((c) => !c.name.trim())) next.colors = "كل الألوان لازم يكون ليها اسم";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (stillUploading) return;
    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      images: images.filter((img) => !img.error).map((img) => img.url),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{initial ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
          <button className="btn-icon" onClick={onCancel} aria-label="إغلاق">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <div className="field">
              <label>اسم المنتج (عربي)</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="تيشيرت أوفرسايز" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="field">
              <label>اسم المنتج (إنجليزي)</label>
              <input value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} placeholder="Oversize Tee" />
              {errors.nameEn && <span className="field-error">{errors.nameEn}</span>}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>الفئة</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>السعر (ج.م)</label>
              <input type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="550" />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>الكمية بالمخزن</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} placeholder="30" />
            </div>
            <div className="field">
              <label style={{ marginBottom: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, height: 42 }}>
                  <input type="checkbox" checked={form.isNew} onChange={(e) => update("isNew", e.target.checked)} style={{ width: 16, height: 16 }} />
                  علّم كـ "جديد"
                </span>
              </label>
            </div>
          </div>

          <div className="field">
            <label>الوصف</label>
            <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="وصف قصير عن المنتج، القماش، القصة..." />
          </div>

          <div className="field">
            <label>المقاسات</label>
            <div className="chip-select">
              {ALL_SIZES.map((s) => (
                <button
                  type="button"
                  key={s}
                  className={`chip ${form.sizes.includes(s) ? "is-active" : ""}`}
                  onClick={() => toggleSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.sizes && <span className="field-error">{errors.sizes}</span>}
          </div>

          <div className="field">
            <label>الألوان</label>
            {form.colors.map((c, i) => (
              <div className="color-row" key={i}>
                <input type="color" value={c.hex} onChange={(e) => updateColor(i, { hex: e.target.value })} />
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateColor(i, { name: e.target.value })}
                  placeholder="اسم اللون (مثال: أسود)"
                />
                <button type="button" className="btn-icon" onClick={() => removeColor(i)} aria-label="إزالة اللون">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
            {errors.colors && <span className="field-error">{errors.colors}</span>}
            <button type="button" className="btn btn-outline btn-sm" onClick={addColor} style={{ marginTop: 6 }}>
              + إضافة لون
            </button>
          </div>

          <div className="field">
            <label>صور المنتج</label>

            {images.length > 0 && (
              <div className="image-grid">
                {images.map((img) => (
                  <div className="image-thumb" key={img.id}>
                    <img src={img.url} alt="" />
                    {img.uploading && (
                      <div className="image-thumb__overlay">
                        <span className="spinner-sm" />
                      </div>
                    )}
                    {img.error && (
                      <div className="image-thumb__overlay image-thumb__overlay--error">فشل الرفع</div>
                    )}
                    <button
                      type="button"
                      className="image-thumb__remove"
                      onClick={() => removeImage(img.id)}
                      aria-label="حذف الصورة"
                    >
                      <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              multiple
              onChange={handleFilesSelected}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current?.click()}
              style={{ marginTop: images.length > 0 ? 12 : 0 }}
            >
              ⬆ ارفع صور من الجهاز
            </button>
            <p style={{ fontSize: 12, color: "var(--text-low)", marginTop: 8 }}>
              الصورة بتتحط وبتتشاف على طول، وبترفع في الخلفية. JPG, PNG, WEBP, GIF — حتى 5MB للصورة.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={stillUploading}>
              {stillUploading ? "جاري رفع الصور..." : initial ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
