import { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "../../utils/format";

const STATUS_LABELS = { pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض" };

export default function AffiliateDetailModal({ affiliateId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [discountType, setDiscountType] = useState("fixed"); // "fixed" | "percentage"
  const [discountInput, setDiscountInput] = useState("0"); // ج.م value, used when type is fixed
  const [percentInput, setPercentInput] = useState("0"); // %, used when type is percentage
  const [codeError, setCodeError] = useState(null);
  const [savingCode, setSavingCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    adminApi.getAffiliateById(affiliateId).then((d) => {
      setData(d);
      setCodeInput(d.referralCode);
      setDiscountType(d.discountType || "fixed");
      setDiscountInput(String(d.discountAmount || 0));
      setPercentInput(String(d.discountPercent || 0));
    });
  }, [affiliateId]);

  async function handleStatus(status) {
    setBusy(true);
    try {
      await adminApi.updateAffiliateStatus(affiliateId, status);
      const refreshed = await adminApi.getAffiliateById(affiliateId);
      setData(refreshed);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveCode() {
    if (!codeInput.trim()) {
      setCodeError("اكتب كود صحيح");
      return;
    }
    setSavingCode(true);
    setCodeError(null);
    try {
      const updated = await adminApi.updateAffiliateCode(affiliateId, codeInput, {
        discountType,
        discountAmount: Number(discountInput) || 0,
        discountPercent: Number(percentInput) || 0,
      });
      setData((d) => ({
        ...d,
        referralCode: updated.referralCode,
        discountType: updated.discountType,
        discountAmount: updated.discountAmount,
        discountPercent: updated.discountPercent,
      }));
      onChanged?.();
    } catch (err) {
      setCodeError(err.message);
    } finally {
      setSavingCode(false);
    }
  }

  async function handleClearEarnings() {
    setClearing(true);
    try {
      const refreshed = await adminApi.clearAffiliateEarnings(affiliateId);
      setData(refreshed);
      setConfirmingClear(false);
      onChanged?.();
    } finally {
      setClearing(false);
    }
  }

  const referralLink = data ? `${window.location.origin.replace(":5174", ":5173")}/products?ref=${data.referralCode}` : "";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>بيانات المسوق</h3>
          <button className="btn-icon" onClick={onClose} aria-label="إغلاق">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {!data ? (
          <p style={{ color: "var(--text-mid)" }}>جاري التحميل...</p>
        ) : (
          <>
            <div className="affiliate-detail__head">
              <div>
                <p className="affiliate-detail__name">{data.user?.name}</p>
                <p className="affiliate-detail__meta">{data.user?.email} · {data.phone}</p>
              </div>
              <span className={`status-pill status-pill--${data.status === "approved" ? "delivered" : data.status === "rejected" ? "rejected" : "new"}`}>
                {STATUS_LABELS[data.status]}
              </span>
            </div>

            <div className="affiliate-detail__section">
              <label>رقم الطلب</label>
              <p>{data.requestNumber} · قدّم الطلب في {formatDate(data.createdAt)}</p>
            </div>

            <div className="affiliate-detail__section">
              <label>هيسوق إزاي</label>
              <p>{data.marketingPlan}</p>
            </div>

            <div className="affiliate-detail__section">
              <label>كود المسوق (رابط إحالة + كود خصم بالكارت)</label>
              <div className="color-row">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  style={{ direction: "ltr", textAlign: "right" }}
                />
                <button className="btn btn-outline btn-sm" onClick={handleSaveCode} disabled={savingCode}>
                  {savingCode ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
              {codeError && <span className="field-error">{codeError}</span>}
              <p style={{ fontSize: 12, color: "var(--text-low)", marginTop: 6, direction: "ltr", textAlign: "right" }}>
                {referralLink}
              </p>

              <label style={{ marginTop: 16 }}>نوع الخصم اللي بيدّيه الكود للعميل</label>
              <div className="chip-select">
                <button
                  type="button"
                  className={`chip ${discountType === "fixed" ? "is-active" : ""}`}
                  onClick={() => setDiscountType("fixed")}
                >
                  مبلغ ثابت (ج.م)
                </button>
                <button
                  type="button"
                  className={`chip ${discountType === "percentage" ? "is-active" : ""}`}
                  onClick={() => setDiscountType("percentage")}
                >
                  نسبة مئوية (%)
                </button>
              </div>

              {discountType === "fixed" ? (
                <>
                  <label style={{ marginTop: 12 }}>قيمة الخصم (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder="0"
                    style={{ maxWidth: 160 }}
                  />
                </>
              ) : (
                <>
                  <label style={{ marginTop: 12 }}>نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={percentInput}
                    onChange={(e) => setPercentInput(e.target.value)}
                    placeholder="0"
                    style={{ maxWidth: 160 }}
                  />
                </>
              )}
              <p style={{ fontSize: 12, color: "var(--text-low)", marginTop: 6 }}>
                لو حطيت 0، الكود هيشتغل بس كإحالة من غير خصم على العميل. دوس "حفظ" فوق عشان القيمة تتحفظ.
              </p>
            </div>

            <div className="affiliate-detail__stats">
              <div>
                <p className="stat-card__label">إجمالي الطلبات</p>
                <p className="stat-card__value">{data.stats.ordersCount}</p>
              </div>
              <div>
                <p className="stat-card__label">تم التسليم</p>
                <p className="stat-card__value">{data.stats.deliveredCount}</p>
              </div>
              <div>
                <p className="stat-card__label">عمولة مؤكدة</p>
                <p className="stat-card__value" style={{ color: "var(--accent)" }}>{formatPrice(data.stats.commission)}</p>
              </div>
              <div>
                <p className="stat-card__label">عمولة معلقة</p>
                <p className="stat-card__value" style={{ color: "var(--warn)" }}>{formatPrice(data.stats.pendingCommission)}</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-low)", marginBottom: 20 }}>
              العمولة بتتأكد بس لما الطلب يوصل لحالة "تم التسليم" — الطلبات لسه في الطريق بتتحسب "معلقة" لحد ما تتأكد.
            </p>

            {data.status === "approved" && (
              <div
                className="affiliate-detail__section"
                style={{
                  background: data.withdrawalRequestedAt ? "rgba(76, 111, 255, 0.08)" : "transparent",
                  border: data.withdrawalRequestedAt ? "1px solid var(--accent)" : "1px solid var(--line)",
                  borderRadius: "var(--radius-md)",
                  padding: 16,
                }}
              >
                {data.withdrawalRequestedAt ? (
                  <>
                    <label>طلب سحب أرباح معلّق</label>
                    <p style={{ fontSize: 13 }}>
                      طلب السحب اتبعت في {formatDate(data.withdrawalRequestedAt)} — بقيمة{" "}
                      <strong>{formatPrice(data.stats.commission)}</strong>.
                    </p>
                  </>
                ) : (
                  <>
                    <label>حالة الأرباح</label>
                    <p style={{ fontSize: 13, color: "var(--text-mid)" }}>
                      مفيش طلب سحب معلّق دلوقتي. لو حوّلتله فلوسه بنفسك، تقدر تصفّر رصيده من هنا.
                    </p>
                  </>
                )}

                {!confirmingClear ? (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: 10 }}
                    onClick={() => setConfirmingClear(true)}
                    disabled={data.stats.commission <= 0}
                  >
                    تأكيد الدفع ومسح الأرباح
                  </button>
                ) : (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 13, marginBottom: 10 }}>
                      متأكد إنك حوّلت له {formatPrice(data.stats.commission)}؟ العمولة هترجع 0 من دلوقتي —
                      الطلبات القديمة مش هتتمسح، بس مش هتتحسب في الرصيد تاني.
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn btn-primary btn-sm" onClick={handleClearEarnings} disabled={clearing}>
                        {clearing ? "جاري التأكيد..." : "أيوه، اتدفعت"}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => setConfirmingClear(false)}>
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {data.orders?.length > 0 && (
              <div className="affiliate-detail__section">
                <label>الطلبات المحوّلة من خلاله</label>
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>رقم الطلب</th>
                        <th>التاريخ</th>
                        <th>القيمة</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((o) => (
                        <tr key={o._id}>
                          <td className="order-id-cell">{o.orderNumber}</td>
                          <td>{formatDate(o.createdAt)}</td>
                          <td>{formatPrice(o.subtotal)}</td>
                          <td>{ORDER_STATUS_LABELS[o.status]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {data.status !== "approved" && (
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy} onClick={() => handleStatus("approved")}>
                  قبول المسوق
                </button>
              )}
              {data.status !== "rejected" && (
                <button className="btn btn-danger" style={{ flex: 1 }} disabled={busy} onClick={() => handleStatus("rejected")}>
                  {data.status === "approved" ? "إيقاف المسوق" : "رفض الطلب"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
