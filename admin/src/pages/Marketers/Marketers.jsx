import { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import { formatPrice } from "../../utils/format";
import AffiliateDetailModal from "./AffiliateDetailModal";

const STATUS_LABELS = { pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض" };
const STATUS_CLASS = { pending: "status-pill--new", approved: "status-pill--delivered", rejected: "status-pill--rejected" };

export default function Marketers() {
  const [affiliates, setAffiliates] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [openId, setOpenId] = useState(null);

  function reload() {
    adminApi.getAffiliates().then(setAffiliates);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleStatus(e, affiliate, status) {
    e.stopPropagation();
    setBusyId(affiliate.id);
    try {
      const updated = await adminApi.updateAffiliateStatus(affiliate.id, status);
      setAffiliates((prev) => prev.map((a) => (a.id === affiliate.id ? { ...a, status: updated.status } : a)));
    } finally {
      setBusyId(null);
    }
  }

  const filtered = affiliates ? (filter === "all" ? affiliates : affiliates.filter((a) => a.status === filter)) : null;

  const totals = affiliates
    ? {
        approved: affiliates.filter((a) => a.status === "approved").length,
        pending: affiliates.filter((a) => a.status === "pending").length,
        commission: affiliates.reduce((sum, a) => sum + (a.stats?.commission || 0), 0),
        pendingCommission: affiliates.reduce((sum, a) => sum + (a.stats?.pendingCommission || 0), 0),
        pendingWithdrawals: affiliates.filter((a) => a.withdrawalRequestedAt).length,
      }
    : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>المسوقين</h1>
          <p>راجع طلبات الانضمام لبرنامج التسويق بعمولة وتابع أداء كل مسوق. دوس على أي مسوق لتفاصيله كاملة.</p>
        </div>
      </div>

      {totals && (
        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-card__label">مسوقين نشطين</p>
            <p className="stat-card__value">{totals.approved}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">طلبات قيد المراجعة</p>
            <p className="stat-card__value">{totals.pending}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">عمولات مؤكدة (تم التسليم)</p>
            <p className="stat-card__value">{formatPrice(totals.commission)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">عمولات معلقة</p>
            <p className="stat-card__value">{formatPrice(totals.pendingCommission)}</p>
          </div>
          <div className="stat-card" style={totals.pendingWithdrawals > 0 ? { borderColor: "var(--accent)" } : undefined}>
            <p className="stat-card__label">طلبات سحب معلّقة</p>
            <p className="stat-card__value" style={totals.pendingWithdrawals > 0 ? { color: "var(--accent)" } : undefined}>
              {totals.pendingWithdrawals}
            </p>
          </div>
        </div>
      )}

      <div className="chip-select" style={{ marginBottom: 20 }}>
        <button className={`chip ${filter === "all" ? "is-active" : ""}`} onClick={() => setFilter("all")}>الكل</button>
        <button className={`chip ${filter === "pending" ? "is-active" : ""}`} onClick={() => setFilter("pending")}>قيد المراجعة</button>
        <button className={`chip ${filter === "approved" ? "is-active" : ""}`} onClick={() => setFilter("approved")}>مقبولين</button>
        <button className={`chip ${filter === "rejected" ? "is-active" : ""}`} onClick={() => setFilter("rejected")}>مرفوضين</button>
      </div>

      <div className="card">
        {!filtered ? (
          <div className="table-empty">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">مفيش طلبات في القسم ده.</div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>المسوق</th>
                  <th>الكود</th>
                  <th>مبيعات</th>
                  <th>عمولة مؤكدة</th>
                  <th>الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="row-clickable" onClick={() => setOpenId(a.id)}>
                    <td className="order-id-cell">{a.requestNumber}</td>
                    <td>
                      <p className="order-customer__name">{a.user?.name}</p>
                      <p className="order-customer__meta">{a.user?.email} · {a.phone}</p>
                    </td>
                    <td style={{ direction: "ltr", textAlign: "right", fontSize: 12 }}>{a.referralCode}</td>
                    <td>
                      {a.status === "approved" ? (
                        <>
                          {a.stats.productsSold} منتج
                          <br />
                          <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{formatPrice(a.stats.revenue)}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {a.status === "approved" ? formatPrice(a.stats.commission) : "—"}
                      {a.withdrawalRequestedAt && (
                        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, marginTop: 2 }}>
                          طلب سحب معلّق
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${STATUS_CLASS[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                    </td>
                    <td>
                      {a.status === "pending" && (
                        <div className="row-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={busyId === a.id}
                            onClick={(e) => handleStatus(e, a, "approved")}
                          >
                            قبول
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={busyId === a.id}
                            onClick={(e) => handleStatus(e, a, "rejected")}
                          >
                            رفض
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openId && (
        <AffiliateDetailModal affiliateId={openId} onClose={() => setOpenId(null)} onChanged={reload} />
      )}
    </>
  );
}
