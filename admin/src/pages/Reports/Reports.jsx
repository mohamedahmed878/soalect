import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { adminApi } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { formatPrice, CATEGORY_LABELS } from "../../utils/format";
import { RANGES, getPlan, buildBuckets, userKey, percentDelta } from "./reportsMath";
import "./reports.css";

const CHART_PALETTE = ["#4C6FFF", "#ffb84d", "#7ee787", "#ff6b6b", "#a78bfa", "#5da9ff"];

function StatCard({ icon, label, value, delta }) {
  return (
    <div className="report-stat">
      <span className="report-stat__icon">{icon}</span>
      <div>
        <p className="report-stat__label">{label}</p>
        <p className="report-stat__value">{value}</p>
        {delta !== undefined && (
          <p className={`report-stat__delta ${delta < 0 ? "is-down" : ""}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% عن الفترة السابقة
          </p>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, action, children }) {
  return (
    <div className="report-card">
      <div className="report-card__head">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Reports() {
  const { theme } = useTheme();
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState(null);
  const [users, setUsers] = useState(null);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    adminApi.getOrders().then(setOrders);
    adminApi.getProducts().then(setProducts);
    adminApi.getUsers().then(setUsers);
  }, []);

  const axisColor = theme === "light" ? "#8a8f9c" : "rgba(243,245,250,0.42)";
  const gridColor = theme === "light" ? "rgba(15,23,42,0.08)" : "rgba(243,245,250,0.08)";
  const primaryLine = theme === "light" ? "#2743D1" : "#4C6FFF";

  const analytics = useMemo(() => {
    if (!orders || !products || !users) return null;

    const now = new Date();
    const plan = getPlan(range, orders);
    const buckets = buildBuckets(orders, plan, now);
    const rangeStart = buckets[0].start;
    const spanMs = now - rangeStart;
    const prevStart = new Date(rangeStart.getTime() - spanMs);

    const inRange = orders.filter((o) => new Date(o.createdAt) >= rangeStart);
    const prevRange = orders.filter((o) => {
      const t = new Date(o.createdAt);
      return t >= prevStart && t < rangeStart;
    });

    // ---- Top stat cards ----
    const revenue = inRange.reduce((s, o) => s + o.totals.subtotal, 0);
    const prevRevenue = prevRange.reduce((s, o) => s + o.totals.subtotal, 0);
    const avgOrder = inRange.length ? Math.round(revenue / inRange.length) : 0;
    const prevAvgOrder = prevRange.length ? Math.round(prevRevenue / prevRange.length) : 0;
    const productsSold = inRange.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0);
    const prevProductsSold = prevRange.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0);

    // first-ever order date per customer, from the FULL order history
    const firstOrderByUser = new Map();
    [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach((o) => {
      const key = userKey(o);
      if (key && !firstOrderByUser.has(key)) firstOrderByUser.set(key, o._id);
    });
    const isFirstOrder = (o) => firstOrderByUser.get(userKey(o)) === o._id;

    const newCustomers = new Set(inRange.filter(isFirstOrder).map(userKey)).size;
    const prevNewCustomers = new Set(prevRange.filter(isFirstOrder).map(userKey)).size;

    // ---- Sales by category ----
    const productById = new Map(products.map((p) => [p.id, p]));
    const categoryTotals = {};
    inRange.forEach((o) => {
      o.items.forEach((item) => {
        const category = productById.get(item.product)?.category || "أخرى";
        categoryTotals[category] = (categoryTotals[category] || 0) + item.price * item.qty;
      });
    });
    const categoryData = Object.entries(categoryTotals)
      .map(([key, value]) => ({ name: CATEGORY_LABELS[key] || key, value }))
      .sort((a, b) => b.value - a.value);

    // ---- Top products ----
    const productTotals = {};
    inRange.forEach((o) => {
      o.items.forEach((item) => {
        if (!productTotals[item.name]) productTotals[item.name] = { name: item.name, qty: 0, revenue: 0 };
        productTotals[item.name].qty += item.qty;
        productTotals[item.name].revenue += item.price * item.qty;
      });
    });
    const topProducts = Object.values(productTotals).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // ---- New vs returning (by order count in range) ----
    const newOrdersCount = inRange.filter(isFirstOrder).length;
    const returningOrdersCount = inRange.length - newOrdersCount;
    const customerSplit = [
      { name: "عملاء جدد", value: newOrdersCount },
      { name: "عملاء عائدون", value: returningOrdersCount },
    ];

    // ---- Sales by governorate ----
    const cityTotals = {};
    inRange.forEach((o) => {
      const city = o.customer?.governorate || "غير محدد";
      cityTotals[city] = (cityTotals[city] || 0) + o.totals.subtotal;
    });
    const cityData = Object.entries(cityTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    const cityMax = cityData[0]?.value || 1;

    // ---- Payment method ----
    const paymentTotals = { cod: 0, card: 0 };
    inRange.forEach((o) => {
      const method = o.customer?.payment === "card" ? "card" : "cod";
      paymentTotals[method] += o.totals.subtotal;
    });
    const paymentData = [
      { name: "الدفع عند الاستلام", value: paymentTotals.cod },
      { name: "بطاقة ائتمان", value: paymentTotals.card },
    ].filter((d) => d.value > 0);

    // ---- Bottom strip ----
    const delivered = inRange.filter((o) => o.status === "Delivered").length;
    const completionRate = inRange.length ? Math.round((delivered / inRange.length) * 100) : 0;
    const affiliateOrders = inRange.filter((o) => o.affiliate).length;
    const affiliateRate = inRange.length ? Math.round((affiliateOrders / inRange.length) * 100) : 0;

    return {
      buckets,
      revenue, avgOrder, productsSold, newCustomers, ordersCount: inRange.length,
      deltas: {
        revenue: percentDelta(revenue, prevRevenue),
        orders: percentDelta(inRange.length, prevRange.length),
        avgOrder: percentDelta(avgOrder, prevAvgOrder),
        newCustomers: percentDelta(newCustomers, prevNewCustomers),
        productsSold: percentDelta(productsSold, prevProductsSold),
      },
      categoryData, topProducts, customerSplit, cityData, cityMax, paymentData,
      completionRate, affiliateRate,
      totalProducts: products.length,
      totalUsers: users.length,
    };
  }, [orders, products, users, range]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>التقارير والتحليلات</h1>
          <p>نظرة عامة على أداء المتجر والمبيعات والعملاء.</p>
        </div>
        <div className="chip-select">
          {RANGES.map((r) => (
            <button key={r.value} className={`chip ${range === r.value ? "is-active" : ""}`} onClick={() => setRange(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!analytics ? (
        <div className="table-empty">جاري تحميل التحليلات...</div>
      ) : (
        <>
          {/* ---- Top stat cards ---- */}
          <div className="report-stats-grid">
            <StatCard
              icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 3h9l3 3v15H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>}
              label="إجمالي الطلبات" value={analytics.ordersCount} delta={analytics.deltas.orders}
            />
            <StatCard
              icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}
              label="إجمالي المبيعات" value={formatPrice(analytics.revenue)} delta={analytics.deltas.revenue}
            />
            <StatCard
              icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              label="متوسط قيمة الطلب" value={formatPrice(analytics.avgOrder)} delta={analytics.deltas.avgOrder}
            />
            <StatCard
              icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 20c1.2-3.5 3.6-5.3 6-5.3S13.8 16.5 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}
              label="عملاء جدد" value={analytics.newCustomers} delta={analytics.deltas.newCustomers}
            />
            <StatCard
              icon={<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>}
              label="منتجات مباعة" value={analytics.productsSold} delta={analytics.deltas.productsSold}
            />
          </div>

          {/* ---- Charts row 1 ---- */}
          <div className="report-grid report-grid--3">
            <ChartCard title="المبيعات خلال الفترة">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.buckets}>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ background: "var(--charcoal)", border: "1px solid var(--line)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke={primaryLine} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="الطلبات خلال الفترة">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.buckets}>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ background: "var(--charcoal)", border: "1px solid var(--line)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="orders" stroke="#5da9ff" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="طريقة الدفع">
              {analytics.paymentData.length === 0 ? (
                <p className="report-empty">مفيش طلبات في الفترة دي</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={analytics.paymentData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                      {analytics.paymentData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ background: "var(--charcoal)", border: "1px solid var(--line)", borderRadius: 8 }} />
                    <Legend verticalAlign="bottom" height={36} formatter={(v) => <span style={{ color: "var(--text-mid)", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ---- Row 2 ---- */}
          <div className="report-grid report-grid--4">
            <ChartCard title="الأكثر مبيعًا">
              {analytics.topProducts.length === 0 ? (
                <p className="report-empty">مفيش مبيعات في الفترة دي</p>
              ) : (
                <ol className="top-products-list">
                  {analytics.topProducts.map((p, i) => (
                    <li key={p.name}>
                      <span className="top-products-list__rank">{i + 1}</span>
                      <div>
                        <p className="top-products-list__name">{p.name}</p>
                        <p className="top-products-list__meta">{formatPrice(p.revenue)}</p>
                      </div>
                      <span className="top-products-list__qty">{p.qty}</span>
                    </li>
                  ))}
                </ol>
              )}
            </ChartCard>

            <ChartCard title="المبيعات حسب الفئة">
              {analytics.categoryData.length === 0 ? (
                <p className="report-empty">مفيش بيانات كفاية</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={analytics.categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                      {analytics.categoryData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ background: "var(--charcoal)", border: "1px solid var(--line)", borderRadius: 8 }} />
                    <Legend verticalAlign="bottom" height={50} formatter={(v) => <span style={{ color: "var(--text-mid)", fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="عملاء جدد مقابل عائدين">
              {analytics.customerSplit.every((d) => d.value === 0) ? (
                <p className="report-empty">مفيش طلبات في الفترة دي</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={analytics.customerSplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                      <Cell fill={CHART_PALETTE[0]} />
                      <Cell fill={CHART_PALETTE[1]} />
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--charcoal)", border: "1px solid var(--line)", borderRadius: 8 }} />
                    <Legend verticalAlign="bottom" height={50} formatter={(v) => <span style={{ color: "var(--text-mid)", fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="المبيعات حسب المحافظة">
              {analytics.cityData.length === 0 ? (
                <p className="report-empty">مفيش بيانات كفاية</p>
              ) : (
                <div className="city-bars">
                  {analytics.cityData.map((c, i) => (
                    <div className="city-bar" key={c.name}>
                      <div className="city-bar__head">
                        <span>{c.name}</span>
                        <span>{formatPrice(c.value)}</span>
                      </div>
                      <div className="city-bar__track">
                        <div
                          className="city-bar__fill"
                          style={{ width: `${(c.value / analytics.cityMax) * 100}%`, background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>

          {/* ---- Bottom strip ---- */}
          <div className="report-bottom-strip">
            <div>
              <span className="report-bottom-strip__icon">✓</span>
              <div>
                <p className="report-bottom-strip__label">معدل إتمام الطلب</p>
                <p className="report-bottom-strip__value">{analytics.completionRate}%</p>
              </div>
            </div>
            <div>
              <span className="report-bottom-strip__icon">◆</span>
              <div>
                <p className="report-bottom-strip__label">المنتجات المتاحة</p>
                <p className="report-bottom-strip__value">{analytics.totalProducts}</p>
              </div>
            </div>
            <div>
              <span className="report-bottom-strip__icon">◈</span>
              <div>
                <p className="report-bottom-strip__label">إجمالي العملاء</p>
                <p className="report-bottom-strip__value">{analytics.totalUsers}</p>
              </div>
            </div>
            <div>
              <span className="report-bottom-strip__icon">★</span>
              <div>
                <p className="report-bottom-strip__label">مبيعات عن طريق مسوقين</p>
                <p className="report-bottom-strip__value">{analytics.affiliateRate}%</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
