import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "../../utils/format";

const STATUS_CLASS = {
  New: "status-pill--new",
  Confirmed: "status-pill--confirmed",
  Shipped: "status-pill--shipped",
  Delivered: "status-pill--delivered",
  Cancelled: "status-pill--rejected",
};

export default function OrderDetailModal({ order, onClose, onStatusChange, onDelete, onPrintAndConfirm }) {
  if (!order) return null;

  const total = order.subtotal - (order.discountAmount || 0);
  const isCancelled = order.status === "Cancelled";
  const isLocked = order.status === "Delivered";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>طلب رقم {order.orderNumber || order.id}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="إغلاق">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="affiliate-detail__head">
          <div>
            <p className="affiliate-detail__meta">{formatDate(order.createdAt)}</p>
            {order.editedAt && (
              <p style={{ fontSize: 12, color: "var(--accent)", marginTop: 4 }}>✎ العميل عدّل الطلب ده بنفسه</p>
            )}
          </div>
          <span className={`status-pill ${STATUS_CLASS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
        </div>

        {/* ---- Customer details ---- */}
        <div className="affiliate-detail__section">
          <label>بيانات العميل</label>
          <p style={{ fontWeight: 700 }}>{order.customer.fullName}</p>
          <p>{order.customer.phone}{order.customer.email ? ` · ${order.customer.email}` : ""}</p>
          <p>{order.customer.governorate} — {order.customer.city}</p>
          <p style={{ color: "var(--text-mid)" }}>{order.customer.address}</p>
          {order.customer.notes && (
            <p style={{ color: "var(--text-low)", fontSize: 13, marginTop: 6 }}>ملاحظات: {order.customer.notes}</p>
          )}
        </div>

        {/* ---- Payment ---- */}
        <div className="affiliate-detail__section">
          <label>الدفع</label>
          {order.paymentMethod === "instapay" ? (
            <>
              <p style={{ color: "var(--accent)", fontWeight: 700, marginBottom: 8 }}>تم الدفع (تحويل InstaPay)</p>
              {order.paymentProofUrl && (
                <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={order.paymentProofUrl}
                    alt="إثبات التحويل"
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}
                  />
                </a>
              )}
            </>
          ) : (
            <p style={{ color: "var(--text-mid)" }}>الدفع عند الاستلام (COD)</p>
          )}
        </div>

        {/* ---- Items ---- */}
        <div className="affiliate-detail__section">
          <label>المنتجات</label>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={i}>
                    <td>
                      {it.name}
                      <div style={{ fontSize: 12, color: "var(--text-low)" }}>{it.color} · {it.size}</div>
                    </td>
                    <td>{it.qty}</td>
                    <td>{formatPrice(it.price)}</td>
                    <td>{formatPrice(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- Totals ---- */}
        <div className="affiliate-detail__section">
          <div className="row" style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
            <span>الإجمالي الفرعي</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4, color: "var(--accent)" }}>
              <span>خصم {order.discountCode ? `(${order.discountCode})` : ""}</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 6 }}>
            <span>الإجمالي النهائي</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* ---- Actions ---- */}
        <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
          {order.status === "New" && (
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => onPrintAndConfirm?.(order)}
            >
              🖨️ طباعة وتأكيد
            </button>
          )}

          {isLocked ? (
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-low)", alignSelf: "center" }}>
              تم التسليم — الحالة مقفولة، احذف الطلب لو محتاج تصححه
            </span>
          ) : order.status === "Confirmed" ? (
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => onStatusChange(order, "Shipped")}>
              ✓ تم الشحن
            </button>
          ) : order.status === "Shipped" ? (
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => onStatusChange(order, "Delivered")}>
              ✓ تم الاستلام
            </button>
          ) : isCancelled ? (
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-low)", alignSelf: "center" }}>ملغي من العميل</span>
          ) : null}

          {onDelete && (
            <button className="btn btn-danger" onClick={() => onDelete(order)}>
              حذف الطلب
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
