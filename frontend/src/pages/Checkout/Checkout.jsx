import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Reveal from "../../components/Reveal/Reveal";
import DiscountCodeField from "../../components/DiscountCodeField/DiscountCodeField";
import SEO from "../../components/SEO/SEO";
import { api } from "../../services/api";
import { formatPrice } from "../../utils/format";
import { isValidEmail, isValidPhone, required } from "../../utils/validators";
import { clearStoredReferral } from "../../utils/referral";
import "./checkout.css";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية", "الغربية",
  "المنوفية", "القليوبية", "بورسعيد", "الإسماعيلية", "السويس", "أسيوط",
  "سوهاج", "المنيا", "الفيوم", "بني سويف", "أخرى",
];

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  governorate: "",
  city: "",
  address: "",
  notes: "",
  payment: "cod",
};

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...emptyForm, fullName: user?.name || "", email: user?.email || "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [discount, setDiscount] = useState(null); // { code, ownerName, discountAmount } | null

  const [instapayNumber, setInstapayNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "instapay"
  const [proofUrl, setProofUrl] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofError, setProofError] = useState(null);

  useEffect(() => {
    api.getSettings().then((s) => setInstapayNumber(s.instapayNumber || "")).catch(() => {});
  }, []);

  async function handleProofSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofError(null);
    setUploadingProof(true);
    try {
      const { url } = await api.uploadPaymentProof(file);
      setProofUrl(url);
    } catch (err) {
      setProofError(err.message);
    } finally {
      setUploadingProof(false);
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!required(form.fullName)) next.fullName = "من فضلك ادخل الاسم الكامل";
    if (!isValidPhone(form.phone)) next.phone = "رقم موبايل مصري غير صحيح";
    if (form.email && !isValidEmail(form.email)) next.email = "بريد إلكتروني غير صحيح";
    if (!required(form.governorate)) next.governorate = "اختر المحافظة";
    if (!required(form.city)) next.city = "ادخل المدينة/المنطقة";
    if (!required(form.address)) next.address = "ادخل العنوان بالتفصيل";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const discountAmount = Math.min(discount?.discountAmount || 0, totals.subtotal);
  const finalTotal = totals.subtotal - discountAmount;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (paymentMethod === "instapay" && !proofUrl) {
      setSubmitError("ارفع صورة إثبات التحويل الأول");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await api.createOrder({
        items,
        totals,
        customer: form,
        paymentMethod,
        paymentProofUrl: paymentMethod === "instapay" ? proofUrl : undefined,
      });
      setConfirmedOrder(order);
      clearCart();
      clearStoredReferral(); // العميل لازم يكتب الكود تاني في الطلب الجاي
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedOrder) {
    return (
      <section className="section container checkout-confirm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="checkout-confirm__check"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M5 13 L10 18 L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <h1>تم استلام طلبك!</h1>
        <p className="checkout-confirm__order-id">رقم الطلب: <strong>{confirmedOrder.id}</strong></p>
        {confirmedOrder.discountAmount > 0 && (
          <p style={{ color: "var(--accent)", fontSize: 14, marginBottom: 14 }}>
            تم تطبيق خصم {formatPrice(confirmedOrder.discountAmount)} بكود {confirmedOrder.discountCode}
          </p>
        )}
        <p className="checkout-confirm__desc">
          {user ? (
            <>
              هنتواصل معاك على {form.phone} لتأكيد الطلب قبل الشحن. تقدر تتابع حالة طلبك من صفحة حسابي،
              وتقدر تلغيه أو تعدّله من هناك برضو لحد ما نأكده.
            </>
          ) : (
            <>هنتواصل معاك على {form.phone} لتأكيد الطلب قبل الشحن.</>
          )}
        </p>
        {!user && (
          <p style={{ color: "var(--text-low)", fontSize: 13, marginTop: -8, marginBottom: 20 }}>
            عايز تقدر تتابع الطلب وتعدّله لاحقًا؟{" "}
            <Link to="/register" className="link-arrow" style={{ display: "inline" }}>اعمل حساب</Link>
          </p>
        )}
        <div className="checkout-confirm__actions">
          {user && <Link to="/account" className="btn btn-primary">تتبع طلباتي</Link>}
          <Link to="/products" className="btn btn-outline">متابعة التسوق</Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="section container" style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: 16 }}>سلتك فارغة</h2>
        <p style={{ color: "var(--text-mid)", marginBottom: 24 }}>لازم تضيف منتجات للسلة الأول قبل إتمام الطلب.</p>
        <Link to="/products" className="btn btn-primary">تصفح المنتجات</Link>
      </section>
    );
  }

  return (
    <section className="section container">
      <SEO title="إتمام الطلب" path="/checkout" noindex />
      <Reveal>
        <p className="eyebrow">الخطوة الأخيرة</p>
        <h1 className="section-title" style={{ marginBottom: 32 }}>إتمام الطلب</h1>
      </Reveal>

      <form className="checkout-grid" onSubmit={handleSubmit} noValidate>
        <Reveal className="checkout-form" delay={0.05}>
          <h3 className="checkout-form__title">بيانات التوصيل</h3>

          <div className="field-row">
            <div className="field">
              <label>الاسم الكامل</label>
              <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="مثال: أحمد محمد" />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>
            <div className="field">
              <label>رقم الموبايل</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="01xxxxxxxxx" />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="field">
            <label>البريد الإلكتروني (اختياري)</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="example@email.com" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-row">
            <div className="field">
              <label>المحافظة</label>
              <select value={form.governorate} onChange={(e) => update("governorate", e.target.value)}>
                <option value="">اختر المحافظة</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.governorate && <span className="field-error">{errors.governorate}</span>}
            </div>
            <div className="field">
              <label>المدينة / المنطقة</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="مثال: مدينة نصر" />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
          </div>

          <div className="field">
            <label>العنوان بالتفصيل</label>
            <textarea rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="اسم الشارع، رقم العمارة، الدور، علامة مميزة..." />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="field">
            <label>ملاحظات إضافية (اختياري)</label>
            <textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="أي تفاصيل تساعد المندوب يوصلك بسهولة" />
          </div>

          <h3 className="checkout-form__title">طريقة الدفع</h3>
          <div className="payment-options">
            <button
              type="button"
              className={`payment-option ${paymentMethod === "cod" ? "is-active" : ""}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 8h12l-1.2 11.5a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span>الدفع عند الاستلام</span>
            </button>

            {instapayNumber && (
              <button
                type="button"
                className={`payment-option ${paymentMethod === "instapay" ? "is-active" : ""}`}
                onClick={() => setPaymentMethod("instapay")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10h18M7 15h2M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                <span>تحويل InstaPay / فودافون كاش</span>
              </button>
            )}
          </div>

          {paymentMethod === "instapay" && (
            <div className="instapay-proof">
              <p className="instapay-proof__instructions">
                حوّل مبلغ <strong>{formatPrice(finalTotal)}</strong> على الرقم:{" "}
                <strong dir="ltr" style={{ color: "var(--accent)" }}>{instapayNumber}</strong>، وبعدين ارفع صورة
                إثبات التحويل هنا.
              </p>

              {proofUrl ? (
                <div className="instapay-proof__preview">
                  <img src={proofUrl} alt="إثبات التحويل" />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setProofUrl(null)}>
                    استبدال الصورة
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleProofSelect}
                    disabled={uploadingProof}
                    id="payment-proof-input"
                    style={{ display: "none" }}
                  />
                  <label htmlFor="payment-proof-input" className="btn btn-outline btn-sm" style={{ cursor: "pointer" }}>
                    {uploadingProof ? "جاري الرفع..." : "⬆ رفع صورة إثبات التحويل"}
                  </label>
                </>
              )}
              {proofError && <p className="field-error" style={{ marginTop: 8 }}>{proofError}</p>}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1} className="checkout-summary">
          <h3>ملخص الطلب</h3>
          <div className="checkout-summary__items">
            {items.map((item) => (
              <div className="checkout-summary__item" key={`${item.productId}-${item.color}-${item.size}`}>
                <span>{item.name} × {item.qty}</span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <hr className="divider" />
          <div className="cart-summary__row">
            <span>المجموع الفرعي</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="cart-summary__row" style={{ color: "var(--accent)" }}>
              <span>الخصم (كود {discount.code})</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="cart-summary__row">
            <span>الشحن</span>
            <span>يتحدد حسب المحافظة</span>
          </div>
          <hr className="divider" />
          <div className="cart-summary__row cart-summary__row--total">
            <span>الإجمالي</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>

          <DiscountCodeField onChange={setDiscount} subtotal={totals.subtotal} />

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || uploadingProof}>
            {submitting ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
          </button>
          {submitError && <p className="field-error" style={{ textAlign: "center" }}>{submitError}</p>}
        </Reveal>
      </form>
    </section>
  );
}
