import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Reveal from "../../components/Reveal/Reveal";
import SwingTag from "../../components/SwingTag/SwingTag";
import SEO from "../../components/SEO/SEO";
import { PageLoading } from "../../components/Loading/Loading";
import { api } from "../../services/api";
import { formatPrice } from "../../utils/format";
import "./affiliate.css";

const STATUS_LABELS = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

export default function Affiliate() {
  const { user } = useAuth();
  const [status, setStatus] = useState(undefined); // undefined = loading, null = no application yet
  const [form, setForm] = useState({ phone: "", marketingPlan: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }
    api.getMyAffiliateStatus().then(setStatus);
  }, [user]);

  async function handleWithdraw() {
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      const updated = await api.requestWithdrawal();
      setStatus((s) => ({ ...s, withdrawalRequestedAt: updated.withdrawalRequestedAt }));
    } catch (err) {
      setWithdrawError(err.message);
    } finally {
      setWithdrawing(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.phone.trim() || !form.marketingPlan.trim()) {
      setError("من فضلك أكمل رقم الموبايل وإزاي هتسوق للمنتجات");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.applyAsAffiliate(form);
      const updated = await api.getMyAffiliateStatus();
      setStatus(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!user) {
    return (
      <section className="section container" style={{ textAlign: "center" }}>
        <SEO
          title="تسويق بعمولة"
          description="انضم لبرنامج المسوقين بتاع SOOLECT واكسب عمولة على كل عملية بيع من خلال رابطك."
          path="/affiliate"
        />
        <p className="eyebrow" style={{ justifyContent: "center" }}>تسويق بعمولة</p>
        <h1 className="section-title" style={{ marginBottom: 16 }}>سجّل دخولك الأول</h1>
        <p style={{ color: "var(--text-mid)", marginBottom: 26 }}>
          لازم يكون عندك حساب في SOOLECT عشان تقدر تنضم لبرنامج التسويق بعمولة.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Link to="/login" state={{ from: "/affiliate" }} className="btn btn-primary">تسجيل الدخول</Link>
          <Link to="/register" className="btn btn-outline">إنشاء حساب</Link>
        </div>
      </section>
    );
  }

  if (status === undefined) return <PageLoading />;

  // ---- No application yet: show the pitch + application form ----
  if (status === null) {
    return (
      <section className="section container affiliate-page">
        <SEO
          title="تسويق بعمولة"
          description="انضم لبرنامج المسوقين بتاع SOOLECT واكسب عمولة على كل عملية بيع من خلال رابطك."
          path="/affiliate"
        />
        <Reveal>
          <SwingTag>تسويق بعمولة</SwingTag>
          <h1 className="affiliate-title">سوّق منتجات SOOLECT واكسب عمولة</h1>
          <p className="affiliate-desc">
            انضم لبرنامج المسوقين بتاعنا. هتاخد رابط خاص بيك، وأي عملية شراء تتم من خلاله
            هتاخد عليها عمولة. سهل، من غير أي مصاريف، ابدأ في أي وقت.
          </p>
        </Reveal>

        <div className="affiliate-grid">
          <Reveal delay={0.05} className="affiliate-info">
            <h3>إزاي هيشتغل الموضوع؟</h3>
            <ul className="affiliate-steps">
              <li>
                <strong>1. قدّم طلبك</strong>
                <span>اكتب بياناتك وإزاي هتسوق (فيسبوك، إنستجرام، تيك توك، أصدقاء...)</span>
              </li>
              <li>
                <strong>2. استنى الموافقة</strong>
                <span>هنراجع طلبك ونرد عليك بأسرع وقت</span>
              </li>
              <li>
                <strong>3. شارك رابطك</strong>
                <span>هتاخد رابط تحويل خاص بيك تشاركه مع متابعينك</span>
              </li>
              <li>
                <strong>4. اكسب عمولة</strong>
                <span>على كل عملية شراء حقيقية تتم من خلال رابطك</span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="affiliate-form-card">
            <h3>قدّم طلب الانضمام</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label>رقم الموبايل</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="01xxxxxxxxx"
                />
              </div>
              <div className="field">
                <label>هتسوق إزاي للمنتجات؟</label>
                <textarea
                  rows={4}
                  value={form.marketingPlan}
                  onChange={(e) => setForm((f) => ({ ...f, marketingPlan: e.target.value }))}
                  placeholder="مثال: هعمل ريلز على إنستجرام وأشارك المنتجات مع متابعيني..."
                />
              </div>
              {error && <p className="field-error" style={{ marginBottom: 14 }}>{error}</p>}
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? "جاري الإرسال..." : "قدّم الطلب"}
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    );
  }

  // ---- Has an application: pending / approved / rejected ----
  const referralLink = status.referralCode
    ? `${window.location.origin}/products?ref=${status.referralCode}`
    : "";

  return (
    <section className="section container affiliate-page">
      <SEO title="طلب التسويق بعمولة" path="/affiliate" noindex />
      <Reveal>
        <p className="eyebrow">تسويق بعمولة</p>
        <div className="affiliate-status-head">
          <h1 className="section-title">طلب رقم {status.requestNumber}</h1>
          <span className={`status-chip status-chip--${status.status}`}>{STATUS_LABELS[status.status]}</span>
        </div>
        <p style={{ color: "var(--text-mid)" }}>{user.email}</p>
      </Reveal>

      {status.status === "pending" && (
        <Reveal delay={0.05} className="affiliate-pending-card">
          <h3>طلبك قيد المراجعة</h3>
          <p>هنراجع بياناتك ونرد عليك بأقرب وقت. تقدر ترجع للصفحة دي في أي وقت لمتابعة حالة طلبك.</p>
        </Reveal>
      )}

      {status.status === "rejected" && (
        <Reveal delay={0.05} className="affiliate-pending-card affiliate-pending-card--rejected">
          <h3>للأسف طلبك اترفض</h3>
          <p>لو حابب تعرف التفاصيل، تقدر تكلمنا عن طريق واتساب أو الإيميل الموجودين في أسفل الصفحة.</p>
        </Reveal>
      )}

      {status.status === "approved" && (
        <>
          <Reveal delay={0.05} className="affiliate-link-card">
            <h3>رابطك الخاص</h3>
            <p style={{ color: "var(--text-mid)", marginBottom: 14 }}>
              شارك الرابط ده مع متابعينك — أي عملية شراء تتم من خلاله هتتحسب لحسابك.
            </p>
            <div className="affiliate-link-row">
              <input readOnly value={referralLink} onFocus={(e) => e.target.select()} />
              <button className="btn btn-primary btn-sm" onClick={() => copyLink(referralLink)}>
                {copied ? "اتنسخ ✓" : "نسخ الرابط"}
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="affiliate-stats-grid">
            <div className="affiliate-stat">
              <p className="affiliate-stat__label">عدد الطلبات</p>
              <p className="affiliate-stat__value">{status.stats.ordersCount}</p>
            </div>
            <div className="affiliate-stat">
              <p className="affiliate-stat__label">منتجات اتباعت (تم التسليم)</p>
              <p className="affiliate-stat__value">{status.stats.productsSold}</p>
            </div>
            <div className="affiliate-stat affiliate-stat--highlight">
              <p className="affiliate-stat__label">عمولة مؤكدة</p>
              <p className="affiliate-stat__value">{formatPrice(status.stats.commission)}</p>
            </div>
            <div className="affiliate-stat">
              <p className="affiliate-stat__label">عمولة معلقة</p>
              <p className="affiliate-stat__value">{formatPrice(status.stats.pendingCommission)}</p>
            </div>
          </Reveal>

          <Reveal delay={0.14} className="affiliate-withdraw-card">
            {status.withdrawalRequestedAt ? (
              <>
                <h3>طلب السحب قيد المراجعة</h3>
                <p style={{ color: "var(--text-mid)" }}>
                  بعتنا طلب سحب أرباحك ({formatPrice(status.stats.commission)}) — هنحوّلها لك ونأكد
                  الطلب من لوحة التحكم بأقرب وقت.
                </p>
              </>
            ) : (
              <>
                <h3>عايز تسحب أرباحك؟</h3>
                <p style={{ color: "var(--text-mid)", marginBottom: 14 }}>
                  عندك {formatPrice(status.stats.commission)} عمولة مؤكدة جاهزة للسحب. دوس الزرار
                  وهنبدأ نجهّز تحويلها لك.
                </p>
                {withdrawError && <p className="field-error" style={{ marginBottom: 12 }}>{withdrawError}</p>}
                <button
                  className="btn btn-primary"
                  onClick={handleWithdraw}
                  disabled={withdrawing || status.stats.commission <= 0}
                >
                  {withdrawing ? "جاري الإرسال..." : "طلب سحب الأرباح"}
                </button>
              </>
            )}
          </Reveal>

          <p className="affiliate-note">
            العمولة بتتأكد بس لما الطلب يوصل لحالة "تم التسليم" — الطلبات لسه في الطريق بتظهر كـ "معلقة" لحد ما توصل.
          </p>
        </>
      )}
    </section>
  );
}
