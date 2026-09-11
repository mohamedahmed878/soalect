// Pure data-crunching helpers for the Reports page. Kept separate from
// the component so the math is easy to read/verify on its own.

export const RANGES = [
  { value: "24h", label: "آخر يوم" },
  { value: "7d", label: "آخر أسبوع" },
  { value: "30d", label: "آخر شهر" },
  { value: "365d", label: "آخر سنة" },
  { value: "all", label: "منذ الإنشاء" },
];

const PLANS = {
  "24h": { unit: "hour", step: 2, count: 12 },
  "7d": { unit: "day", step: 1, count: 7 },
  "30d": { unit: "day", step: 1, count: 30 },
  "365d": { unit: "month", step: 1, count: 12 },
  all: { unit: "month", step: 1, count: 12 },
};

function addUnit(date, unit, amount) {
  const d = new Date(date);
  if (unit === "hour") d.setHours(d.getHours() + amount);
  if (unit === "day") d.setDate(d.getDate() + amount);
  if (unit === "month") d.setMonth(d.getMonth() + amount);
  return d;
}

function formatBucketLabel(date, unit) {
  if (unit === "hour") return date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  if (unit === "day") return date.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
  return date.toLocaleDateString("ar-EG", { month: "short", year: "2-digit" });
}

export function getPlan(range, orders) {
  const plan = { ...PLANS[range] };
  // "all" spans from the earliest order to now, bucketed monthly (capped at 24 months).
  if (range === "all" && orders?.length) {
    const earliest = Math.min(...orders.map((o) => new Date(o.createdAt).getTime()));
    const months = Math.max(
      1,
      Math.min(24, Math.ceil((Date.now() - earliest) / (30 * 24 * 60 * 60 * 1000)))
    );
    plan.count = months;
  }
  return plan;
}

/** Builds ordered time buckets (oldest→newest) and sums orders into them. */
export function buildBuckets(orders, plan, now = new Date()) {
  const { unit, step, count } = plan;
  const buckets = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = addUnit(now, unit, -(i + 1) * step);
    const end = addUnit(now, unit, -i * step);
    buckets.push({ start, end, revenue: 0, orders: 0, label: formatBucketLabel(end, unit) });
  }
  orders.forEach((o) => {
    const t = new Date(o.createdAt);
    const bucket = buckets.find((b) => t >= b.start && t < b.end);
    if (bucket) {
      bucket.revenue += o.totals.subtotal;
      bucket.orders += 1;
    }
  });
  return buckets;
}

export function userKey(order) {
  return order.user?.id || order.user?._id || order.user;
}

export function percentDelta(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
