import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Reveal from "../../components/Reveal/Reveal";
import SEO from "../../components/SEO/SEO";
import { api } from "../../services/api";
import { formatDate, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from "../../utils/format";
import "./account.css";

// كل 5 ثواني بنسأل الباك إند "فيه جديد؟" بدل الاعتماد على Socket.io —
// عشان يشتغل صح على استضافة serverless زي Vercel اللي مش بتدعم اتصالات دائمة.
const POLL_INTERVAL_MS = 5000;

function OrderStatusTracker({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="status-cancelled">
        <span className="status-cancelled__dot" />
        ملغي
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_STEPS.indexOf(status);
  return (
    <div className="status-tracker">
      {ORDER_STATUS_STEPS.map((step, i) => (
        <div className={`status-step ${i <= currentIndex ? "is-done" : ""}`} key={step}>
          <span className="status-step__dot" />
          <span className="status-step__label">{ORDER_STATUS_LABELS[step]}</span>
          {i < ORDER_STATUS_STEPS.length - 1 && <span className="status-step__line" />}
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [justUpdated, setJustUpdated] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  const [editingId, setEditingId] = useState(null); // order.id currently being edited
  const [editQtys, setEditQtys] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    // Live updates: نعمل fetch دوري لطلبات العميل، ولو حالة أي طلب اتغيّرت
    // (مثلاً الأدمن أكّده أو غيّر حالته) بنبيّن نفس الأنميشن اللي كانت
    // بتظهر مع Socket.io، من غير ما العميل يحتاج يعمل Refresh بنفسه.
    async function refresh() {
      let data;
      try {
        data = await api.getMyOrders();
      } catch {
        return; // خطأ مؤقت في الشبكة — نسيب آخر بيانات معروفة زي ما هي
      }
      if (cancelled) return;

      setOrders((prev) => {
        if (prev) {
          data.forEach((updatedOrder) => {
            const prevOrder = prev.find((o) => o.orderNumber === updatedOrder.orderNumber);
            if (prevOrder && prevOrder.status !== updatedOrder.status) {
              setJustUpdated(updatedOrder.orderNumber);
              setTimeout(() => setJustUpdated(null), 3000);
            }
          });
        }
        return data;
      });
    }

    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  async function handleCancel(order) {
    if (!window.confirm(`متأكد إنك عايز تلغي طلب رقم ${order.id}؟`)) return;
    setCancellingId(order.id);
    setCancelError(null);
    try {
      const updated = await api.cancelOrder(order._id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  function startEdit(order) {
    setEditingId(order.id);
    setEditError(null);
    setEditQtys(order.items.map((it) => it.qty));
    setEditCustomer({ ...order.customer });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQtys([]);
    setEditCustomer(null);
    setEditError(null);
  }

  async function saveEdit(order) {
    setSavingEdit(true);
    setEditError(null);
    try {
      const updated = await api.updateMyOrder(order._id, {
        customer: editCustomer,
        items: order.items.map((it, i) => ({
          product: it.product,
          color: it.color,
          size: it.size,
          qty: editQtys[i],
        })),
      });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      cancelEdit();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  if (!user) {
    return (
      <section className="section container" style={{ textAlign: "center" }}>
        <p className="eyebrow" style={{ justifyContent: "center" }}>حسابي</p>
        <h1 className="section-title" style={{ marginBottom: 16 }}>سجّل دخولك الأول</h1>
        <p style={{ color: "var(--text-mid)", marginBottom: 26 }}>
          لازم تسجل الدخول عشان تشوف بياناتك وطلباتك السابقة.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Link to="/login" className="btn btn-primary">تسجيل الدخول</Link>
          <Link to="/register" className="btn btn-outline">إنشاء حساب</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section container">
      <SEO title="حسابي" path="/account" noindex />
      <Reveal>
        <div className="account-head">
          <div>
            <p className="eyebrow">حسابي</p>
            <h1 className="section-title">أهلًا، {user.name}</h1>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </Reveal>

      <div className="account-grid">
        <Reveal delay={0.05} className="account-card">
          <h3>بياناتي</h3>
          <div className="account-field">
            <span>الاسم</span>
            <strong>{user.name}</strong>
          </div>
          <div className="account-field">
            <span>البريد الإلكتروني</span>
            <strong>{user.email}</strong>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="account-orders">
          <h3>طلباتي السابقة</h3>
          {cancelError && <p className="field-error" style={{ marginBottom: 14 }}>{cancelError}</p>}

          {!orders ? (
            <p style={{ color: "var(--text-mid)" }}>جاري التحميل...</p>
          ) : orders.length === 0 ? (
            <div className="account-orders__empty">
              <p>لسه معملتش أي طلب.</p>
              <Link to="/products" className="btn btn-primary btn-sm">ابدأ التسوق</Link>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((order) => (
                <div className={`order-card ${justUpdated === order.orderNumber ? "order-card--pulse" : ""}`} key={order.id}>
                  <div className="order-card__head">
                    <div>
                      <p className="order-card__id">طلب رقم {order.id}</p>
                      <p className="order-card__date">{formatDate(order.createdAt)}</p>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      {order.discountAmount > 0 && (
                        <p className="order-card__discount">خصم كود {order.discountCode}: -{formatPrice(order.discountAmount)}</p>
                      )}
                      <p className="order-card__total">{formatPrice(order.totals.subtotal - (order.discountAmount || 0))}</p>
                    </div>
                  </div>

                  <OrderStatusTracker status={order.status} />

                  {editingId === order.id ? (
                    <div className="order-edit-form">
                      <div className="order-edit-form__items">
                        {order.items.map((item, i) => (
                          <div className="order-edit-form__item" key={`${item.product}-${item.color}-${item.size}-${i}`}>
                            <span>{item.name} · {item.color} · {item.size}</span>
                            <div className="qty-stepper">
                              <button
                                type="button"
                                onClick={() => setEditQtys((q) => q.map((v, idx) => (idx === i ? Math.max(1, v - 1) : v)))}
                              >
                                −
                              </button>
                              <span>{editQtys[i]}</span>
                              <button
                                type="button"
                                onClick={() => setEditQtys((q) => q.map((v, idx) => (idx === i ? v + 1 : v)))}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-edit-form__fields">
                        <input
                          placeholder="الاسم بالكامل"
                          value={editCustomer.fullName}
                          onChange={(e) => setEditCustomer((c) => ({ ...c, fullName: e.target.value }))}
                        />
                        <input
                          placeholder="رقم الموبايل"
                          value={editCustomer.phone}
                          onChange={(e) => setEditCustomer((c) => ({ ...c, phone: e.target.value }))}
                          dir="ltr"
                        />
                        <input
                          placeholder="المحافظة"
                          value={editCustomer.governorate}
                          onChange={(e) => setEditCustomer((c) => ({ ...c, governorate: e.target.value }))}
                        />
                        <input
                          placeholder="المدينة/المنطقة"
                          value={editCustomer.city}
                          onChange={(e) => setEditCustomer((c) => ({ ...c, city: e.target.value }))}
                        />
                        <input
                          placeholder="العنوان بالتفصيل"
                          value={editCustomer.address}
                          onChange={(e) => setEditCustomer((c) => ({ ...c, address: e.target.value }))}
                          style={{ gridColumn: "1 / -1" }}
                        />
                        <textarea
                          placeholder="ملاحظات (اختياري)"
                          value={editCustomer.notes || ""}
                          onChange={(e) => setEditCustomer((c) => ({ ...c, notes: e.target.value }))}
                          rows={2}
                          style={{ gridColumn: "1 / -1" }}
                        />
                      </div>

                      {editError && <p className="field-error">{editError}</p>}

                      <div className="order-edit-form__actions">
                        <button className="btn btn-primary btn-sm" onClick={() => saveEdit(order)} disabled={savingEdit}>
                          {savingEdit ? "جاري الحفظ..." : "حفظ التعديل"}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={cancelEdit} disabled={savingEdit}>
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul className="order-card__items">
                      {order.items.map((item, i) => (
                        <li key={`${item.product}-${item.color}-${item.size}-${i}`}>
                          {item.name} · {item.color} · {item.size} × {item.qty}
                        </li>
                      ))}
                    </ul>
                  )}

                  {order.status === "New" && editingId !== order.id && (
                    <div className="order-card__actions">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(order)}>
                        تعديل الطلب
                      </button>
                      <button
                        className="order-card__cancel"
                        onClick={() => handleCancel(order)}
                        disabled={cancellingId === order.id}
                      >
                        {cancellingId === order.id ? "جاري الإلغاء..." : "إلغاء الطلب"}
                      </button>
                    </div>
                  )}
                  {order.status === "New" && editingId !== order.id && (
                    <p className="order-card__cancel-note">تقدر تعدّل أو تلغي طلبك قبل ما الإدارة تأكده</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}