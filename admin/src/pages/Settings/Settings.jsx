import { useEffect, useRef, useState } from "react";
import { adminApi } from "../../services/api";
import "./settings.css";

export default function Settings() {
  const [heroImage, setHeroImage] = useState(null);
  const [instapayNumber, setInstapayNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    adminApi.getSettings().then((s) => {
      setHeroImage(s.heroImage || "");
      setInstapayNumber(s.instapayNumber || "");
    });
  }, []);

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setHeroImage(previewUrl);
    setSaved(false);
    setUploading(true);

    adminApi
      .uploadImage(file)
      .then(({ url }) => {
        setHeroImage(url);
        URL.revokeObjectURL(previewUrl);
      })
      .catch(() => setError("فشل رفع الصورة، حاول تاني"))
      .finally(() => setUploading(false));

    e.target.value = "";
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateSettings({ heroImage, instapayNumber });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (heroImage === null) {
    return <div className="table-empty">جاري التحميل...</div>;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>الإعدادات</h1>
          <p>غيّر صورة المنتج الأساسي في الصفحة الرئيسية — كل ما عندك دروب جديد، ارفع صورته هنا.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card settings-form">
          <h3>صورة الصفحة الرئيسية</h3>
          <p className="settings-form__hint">
            الكلام والتصميم في الصفحة الرئيسية ثابت — الصورة دي بس هي اللي بتتغير.
            مقاس مربّع أو طولي (Portrait) بيناسب التصميم أكتر من العريض (Landscape).
          </p>

          <div className="hero-image-picker">
            {heroImage ? (
              <img src={heroImage} alt="Hero" />
            ) : (
              <div className="hero-image-picker__empty">مفيش صورة لسه — هيظهر التصميم الافتراضي</div>
            )}
            {uploading && <div className="hero-image-picker__overlay"><span className="spinner-sm" /></div>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()}>
            ⬆ رفع صورة جديدة
          </button>

          {error && <p className="field-error" style={{ margin: "16px 0 0" }}>{error}</p>}
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSave} disabled={saving || uploading}>
            {saving ? "جاري الحفظ..." : saved ? "تم الحفظ ✓" : "حفظ التغييرات"}
          </button>
        </div>

        <div className="card settings-form">
          <h3>رقم استلام التحويلات (InstaPay / فودافون كاش)</h3>
          <p className="settings-form__hint">
            الرقم ده هيظهر للعميل في صفحة الدفع لو اختار "تحويل" بدل الدفع عند الاستلام،
            عشان يعرف يحوّل فلوسه فين. سيبه فاضي لو عايز تعطّل خيار التحويل خالص.
          </p>
          <div className="field" style={{ maxWidth: 280 }}>
            <input
              type="text"
              placeholder="01xxxxxxxxx"
              value={instapayNumber}
              onChange={(e) => setInstapayNumber(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </>
  );
}
