import { useEffect, useState } from "react";
import OrderTable from "../../components/OrderTable/OrderTable";
import OrderDetailModal from "./OrderDetailModal";
import { adminApi } from "../../services/api";
import { ORDER_STATUS_LABELS } from "../../utils/format";
import { printOrderReceipts } from "../../utils/printReceipt";

const FILTERS = ["New", "Confirmed", "Shipped", "Delivered", "Cancelled"];

// كل 5 ثواني بنسأل الباك إند "فيه جديد؟" بدل الاعتماد على Socket.io —
// عشان يشتغل صح على استضافة serverless زي Vercel اللي مش بتدعم اتصالات دائمة.
const POLL_INTERVAL_MS = 5000;

// نغمة تنبيه قصيرة مولّدة بالكود (Web Audio API) — من غير ملف صوت
// خارجي. بتتشغل لما يوصل طلب جديد والأدمن مديله الإذن.
function playNewOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Some browsers block audio without a prior user interaction — fine
    // to just skip the sound in that case, the visual highlight still works.
  }
}

function notifyNewOrder(order) {
  playNewOrderChime();
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    new Notification("طلب جديد في SOOLECT", {
      body: `${order.customer.fullName} — ${order.items.length} منتج`,
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [newOrderId, setNewOrderId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    function mapIncoming(o) {
      return { ...o, id: o.orderNumber, totals: { subtotal: o.subtotal } };
    }

    // Live sync: نعمل fetch دوري لكل الطلبات — أي طلب جديد من المتجر أو
    // تغيير حالة من شاشة أدمن تانية بيظهر هنا خلال ثواني قليلة من غير
    // ما تحتاج تعمل Refresh بنفسك.
    async function refresh() {
      let data;
      try {
        data = await adminApi.getOrders();
      } catch {
        return; // خطأ مؤقت في الشبكة — نسيب آخر بيانات معروفة زي ما هي
      }
      if (cancelled) return;

      const mapped = data.map(mapIncoming);

      setOrders((prev) => {
        if (prev) {
          const prevIds = new Set(prev.map((o) => o._id));
          const newlyArrived = mapped.find((o) => !prevIds.has(o._id));
          if (newlyArrived) {
            setNewOrderId(newlyArrived.id);
            setTimeout(() => setNewOrderId(null), 3000);
            notifyNewOrder(newlyArrived);
          }
        }
        return mapped;
      });
    }

    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function handleStatusChange(order, newStatus) {
    const updated = await adminApi.updateOrderStatus(order._id, newStatus);
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? { ...updated, id: updated.orderNumber, totals: { subtotal: updated.subtotal } } : o)));
  }

  async function handleDelete() {
    await adminApi.deleteOrder(confirmDelete._id);
    setOrders((prev) => prev.filter((o) => o._id !== confirmDelete._id));
    setConfirmDelete(null);
    setSelectedId(null);
  }

  function handleDeleteRequest(order) {
    setSelectedId(null); // close the detail modal so the confirm dialog isn't stacked behind it
    setConfirmDelete(order);
  }

  function toggleSelect(orderId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (filtered.every((o) => prev.has(o._id))) return new Set();
      return new Set(filtered.map((o) => o._id));
    });
  }

  const selectedOrders = orders ? orders.filter((o) => selectedIds.has(o._id)) : [];

  // Confirming IS the printing step now — one click marks the order
  // Confirmed (if it's still New) and immediately opens the receipt to
  // print, instead of two separate actions.
  async function printAndConfirm(order) {
    let toPrint = order;
    if (order.status === "New") {
      await handleStatusChange(order, "Confirmed");
      toPrint = { ...order, status: "Confirmed" };
    }
    printOrderReceipts([toPrint]);
  }

  // Same idea for a whole batch: select a bunch of "طلب جديد" orders,
  // confirm them all, and print every receipt in one print job.
  async function handleBulkConfirmAndPrint() {
    setBulkBusy(true);
    try {
      for (const order of selectedOrders) {
        if (order.status === "New") {
          await handleStatusChange(order, "Confirmed");
        }
      }
      const fresh = orders.filter((o) => selectedIds.has(o._id)).map((o) => ({ ...o, status: "Confirmed" }));
      printOrderReceipts(fresh);
    } finally {
      setBulkBusy(false);
    }
  }

  const filtered = orders
    ? orders.filter((o) => {
        if (status !== "all" && o.status !== status) return false;
        const orderDate = o.createdAt.slice(0, 10); // "YYYY-MM-DD"
        if (dateFrom && orderDate < dateFrom) return false;
        if (dateTo && orderDate > dateTo) return false;
        return true;
      })
    : null;
  // Always looked up fresh from `orders` so the modal reflects live-synced
  // status changes instead of a stale snapshot from the moment it opened.
  const selectedOrder = orders?.find((o) => o._id === selectedId) || null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>الطلبات</h1>
          <p>طلب جديد ← دوس طباعة وتأكيد ← تم الشحن ← تم الاستلام.</p>
        </div>

        <div className="date-range-filter">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            max={dateTo || undefined}
            aria-label="من تاريخ"
          />
          <span>إلى</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            aria-label="إلى تاريخ"
          />
          {(dateFrom || dateTo) && (
            <button
              className="btn-icon"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              aria-label="إلغاء فلتر التاريخ"
              title="إلغاء فلتر التاريخ"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="chip-select" style={{ marginBottom: 20 }}>
        <button className={`chip ${status === "all" ? "is-active" : ""}`} onClick={() => setStatus("all")}>
          الكل
        </button>
        {FILTERS.map((s) => (
          <button key={s} className={`chip ${status === s ? "is-active" : ""}`} onClick={() => setStatus(s)}>
            {ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="bulk-toolbar">
          <span>{selectedIds.size} طلب محدد</span>
          <button className="btn btn-primary btn-sm" onClick={handleBulkConfirmAndPrint} disabled={bulkBusy}>
            {bulkBusy ? "جاري التجهيز..." : "🖨️ تأكيد وطباعة المحدد"}
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setSelectedIds(new Set())}>
            إلغاء التحديد
          </button>
        </div>
      )}

      <div className="card">
        {!filtered ? (
          <div className="table-empty">جاري التحميل...</div>
        ) : (
          <OrderTable
            orders={filtered}
            onStatusChange={handleStatusChange}
            onDelete={setConfirmDelete}
            onRowClick={(order) => setSelectedId(order._id)}
            onPrintAndConfirm={printAndConfirm}
            highlightId={newOrderId}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteRequest}
          onPrintAndConfirm={printAndConfirm}
        />
      )}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>حذف الطلب رقم {confirmDelete.id}؟</h3>
            <p style={{ color: "var(--text-mid)", fontSize: 14, marginBottom: 24 }}>
              الإجراء ده مش هينفع يتراجع فيه. الطلب هيتشال نهائيًا من قاعدة البيانات.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>
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