import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "../../utils/format";
import "./orderTable.css";

const STATUS_CLASS = {
  New: "status-pill--new",
  Confirmed: "status-pill--confirmed",
  Shipped: "status-pill--shipped",
  Delivered: "status-pill--delivered",
  Cancelled: "status-pill--rejected",
};

export default function OrderTable({
  orders,
  onStatusChange,
  onDelete,
  onRowClick,
  onPrintAndConfirm,
  compact = false,
  highlightId = null,
  selectedIds = null,
  onToggleSelect,
  onToggleSelectAll,
}) {
  if (orders.length === 0) {
    return <div className="table-empty">مفيش طلبات لسه.</div>;
  }

  const selectable = Boolean(selectedIds && onToggleSelect);
  const allSelected = selectable && orders.length > 0 && orders.every((o) => selectedIds.has(o._id));

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: 36 }}>
                <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} />
              </th>
            )}
            <th>رقم الطلب</th>
            <th>العميل</th>
            <th>التاريخ</th>
            <th>المنتجات</th>
            <th>الإجمالي</th>
            <th>الدفع</th>
            <th>الحالة</th>
            {!compact && <th></th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const total = order.totals.subtotal - (order.discountAmount || 0);
            const isCancelled = order.status === "Cancelled";
            const isLocked = order.status === "Delivered"; // final state — status can't change anymore
            return (
              <tr
                key={order._id || order.id}
                className={highlightId === order.id ? "row-highlight" : ""}
                onClick={() => onRowClick?.(order)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {selectable && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order._id)}
                      onChange={() => onToggleSelect(order._id)}
                    />
                  </td>
                )}
                <td className="order-id-cell">{order.id}</td>
                <td>
                  <p className="order-customer__name">{order.customer.fullName}</p>
                  <p className="order-customer__meta">{order.customer.governorate} · {order.customer.phone}</p>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.items.length} منتج ({order.items.reduce((s, i) => s + i.qty, 0)} قطعة)</td>
                <td>
                  {formatPrice(total)}
                  {order.discountAmount > 0 && (
                    <div style={{ fontSize: 11, color: "var(--accent)" }}>خصم {order.discountCode}: -{formatPrice(order.discountAmount)}</div>
                  )}
                </td>
                <td>
                  {order.paymentMethod === "instapay" ? (
                    <span className="status-pill status-pill--confirmed">تم الدفع</span>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--text-low)" }}>عند الاستلام</span>
                  )}
                </td>
                <td>
                  <span className={`status-pill ${STATUS_CLASS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                  {order.editedAt && (
                    <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 3 }}>✎ معدّل من العميل</div>
                  )}
                </td>
                {!compact && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      {isLocked ? (
                        <span style={{ fontSize: 12, color: "var(--text-low)" }}>تم التسليم — لا يمكن التغيير</span>
                      ) : isCancelled ? (
                        <span style={{ fontSize: 12, color: "var(--text-low)" }}>ملغي من العميل</span>
                      ) : order.status === "New" ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onPrintAndConfirm?.(order)}
                        >
                          🖨️ طباعة وتأكيد
                        </button>
                      ) : order.status === "Confirmed" ? (
                        <button className="btn btn-outline btn-sm" onClick={() => onStatusChange(order, "Shipped")}>
                          ✓ تم الشحن
                        </button>
                      ) : order.status === "Shipped" ? (
                        <button className="btn btn-outline btn-sm" onClick={() => onStatusChange(order, "Delivered")}>
                          ✓ تم الاستلام
                        </button>
                      ) : null}
                      {onDelete && (
                        <button className="btn-icon" onClick={() => onDelete(order)} aria-label="حذف الطلب">
                          <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                            <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
