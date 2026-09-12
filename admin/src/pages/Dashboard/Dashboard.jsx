import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OrderTable from "../../components/OrderTable/OrderTable";
import { adminApi } from "../../services/api";
import { formatPrice } from "../../utils/format";

// كل 5 ثواني بنسأل الباك إند "فيه جديد؟" بدل الاعتماد على Socket.io —
// عشان يشتغل صح على استضافة serverless زي Vercel اللي مش بتدعم اتصالات دائمة.
const POLL_INTERVAL_MS = 5000;

export default function Dashboard() {
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);
  const [users, setUsers] = useState(null);

  useEffect(() => {
    adminApi.getProducts().then(setProducts);
    adminApi.getUsers().then(setUsers);

    let cancelled = false;

    // Live sync: نعمل fetch دوري للطلبات عشان الأرقام في النظرة العامة
    // تتحرك لوحدها لحظة ما عميل يعمل طلب، من غير ما تحتاج تعمل Refresh.
    async function refreshOrders() {
      let data;
      try {
        data = await adminApi.getOrders();
      } catch {
        return; // خطأ مؤقت في الشبكة — نسيب آخر بيانات معروفة زي ما هي
      }
      if (cancelled) return;
      setOrders(data.map((o) => ({ ...o, id: o.orderNumber, totals: { subtotal: o.subtotal } })));
    }

    refreshOrders();
    const interval = setInterval(refreshOrders, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    if (!orders || !products || !users) return null;
    const deliveredOrders = orders.filter((o) => o.status === "Delivered");
    const revenue = deliveredOrders.reduce((sum, o) => sum + (o.totals.subtotal - (o.discountAmount || 0)), 0);
    const newOrders = orders.filter((o) => o.status === "New").length;
    const pending = orders.filter((o) => o.status === "New" || o.status === "Confirmed").length;
    return {
      revenue,
      deliveredCount: deliveredOrders.length,
      orders: orders.length,
      products: products.length,
      users: users.length,
      pending,
      newOrders,
    };
  }, [orders, products, users]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>نظرة عامة</h1>
          <p>ملخص أداء المتجر — بيانات حية من قاعدة البيانات.</p>
        </div>
        <Link to="/products" className="btn btn-primary">+ إضافة منتج</Link>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-card__label">الأرباح المؤكدة</p>
            <p className="stat-card__value">{formatPrice(stats.revenue)}</p>
            <p className="stat-card__delta">من {stats.deliveredCount} طلب تم تسليمه</p>
          </div>

          <Link to="/orders" className="stat-card" style={stats.newOrders > 0 ? { borderColor: "var(--accent)" } : undefined}>
            <p className="stat-card__label">طلبات جديدة تحتاج تأكيد</p>
            <p className="stat-card__value" style={stats.newOrders > 0 ? { color: "var(--accent)" } : undefined}>
              {stats.newOrders}
            </p>
            <p className="stat-card__delta">دوس هنا عشان تفتح صفحة الطلبات</p>
          </Link>

          <div className="stat-card">
            <p className="stat-card__label">المنتجات</p>
            <p className="stat-card__value">{stats.products}</p>
            <p className="stat-card__delta">نشطة في المتجر</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">العملاء</p>
            <p className="stat-card__value">{stats.users}</p>
            <p className="stat-card__delta">مسجلين في المتجر</p>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 26 }}>
        <div className="page-head" style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 16 }}>أحدث الطلبات</h2>
          <Link to="/orders" className="btn btn-outline btn-sm">عرض كل الطلبات</Link>
        </div>
        {!orders ? (
          <p style={{ color: "var(--text-mid)" }}>جاري التحميل...</p>
        ) : (
          <OrderTable orders={orders.slice(0, 5)} compact />
        )}
      </div>
    </>
  );
}
