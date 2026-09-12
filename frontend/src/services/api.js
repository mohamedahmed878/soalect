// Real API client for the SOOLECT backend (backend/).
// Replaces the old localStorage-only mock. Auth uses a JWT stored in
// localStorage and sent as a Bearer token on every request that needs it.

const API_URL = "https://soalect-kr8m.vercel.app/api";
const TOKEN_KEY = "soolect_token";
const USER_KEY = "soolect_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(user, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error("مش قادرين نوصل للسيرفر. تأكد إن الباك إند شغال (npm run dev في مجلد backend).");
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.message || "حصل خطأ غير متوقع");
  }

  return data;
}

// Separate from request() because file uploads must NOT set
// Content-Type: application/json — the browser needs to set its own
// multipart boundary header when sending FormData.
async function uploadRequest(path, formData) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body: formData });
  } catch (err) {
    throw new Error("مش قادرين نوصل للسيرفر. تأكد إن الباك إند شغال.");
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.message || "فشل رفع الصورة");
  }

  return data;
}

export const api = {
  // ---- Products ----
  getProducts({ category } = {}) {
    const query = category && category !== "all" ? `?category=${category}` : "";
    return request(`/products${query}`);
  },
  getProductBySlug(slug) {
    return request(`/products/${slug}`).catch(() => null);
  },

  // ---- Auth ----
  async register({ name, email, password }) {
    const data = await request("/auth/register", { method: "POST", body: { name, email, password } });
    setSession(data.user, data.token);
    return data.user;
  },
  async login({ email, password }) {
    const data = await request("/auth/login", { method: "POST", body: { email, password } });
    setSession(data.user, data.token);
    return data.user;
  },
  async googleLogin(credential) {
    const data = await request("/auth/google", { method: "POST", body: { credential } });
    setSession(data.user, data.token);
    return data.user;
  },
  logout() {
    clearSession();
    return Promise.resolve(true);
  },
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getToken,

  // ---- Orders ----
  createOrder({ items, customer, totals, paymentMethod, paymentProofUrl }) {
    return request("/orders", {
      method: "POST",
      auth: true,
      body: {
        items: items.map((it) => ({
          product: it.productId,
          name: it.name,
          color: it.color,
          size: it.size,
          qty: it.qty,
          price: it.price,
        })),
        customer,
        subtotal: totals.subtotal,
        referralCode: localStorage.getItem("soolect_ref") || undefined,
        paymentMethod,
        paymentProofUrl,
      },
    }).then((order) => ({ ...order, id: order.orderNumber }));
  },
  uploadPaymentProof(file) {
    const formData = new FormData();
    formData.append("image", file);
    return uploadRequest("/upload/payment-proof", formData);
  },
  getMyOrders() {
    return request("/orders/mine", { auth: true }).then((orders) =>
      orders.map((o) => ({ ...o, id: o.orderNumber, totals: { subtotal: o.subtotal } }))
    );
  },
  updateMyOrder(mongoId, { customer, items }) {
    return request(`/orders/${mongoId}`, { method: "PATCH", auth: true, body: { customer, items } }).then((o) => ({
      ...o,
      id: o.orderNumber,
      totals: { subtotal: o.subtotal },
    }));
  },

  // ---- Affiliate program ----
  applyAsAffiliate({ phone, marketingPlan }) {
    return request("/affiliates/apply", { method: "POST", auth: true, body: { phone, marketingPlan } });
  },
  getMyAffiliateStatus() {
    return request("/affiliates/mine", { auth: true });
  },
  requestWithdrawal() {
    return request("/affiliates/withdraw", { method: "PATCH", auth: true });
  },
  validateReferralCode(code, subtotal) {
    const query = subtotal ? `?subtotal=${encodeURIComponent(subtotal)}` : "";
    return request(`/affiliates/validate/${encodeURIComponent(code)}${query}`);
  },

  // ---- Orders (cancel) ----
  cancelOrder(id) {
    return request(`/orders/${id}/cancel`, { method: "PATCH", auth: true }).then((o) => ({
      ...o, id: o.orderNumber, totals: { subtotal: o.subtotal },
    }));
  },

  // ---- Site settings (hero) ----
  getSettings() {
    return request("/settings");
  },

  // ---- Reviews (homepage "آراء العملاء") ----
  getReviews() {
    return request("/reviews");
  },
  getMyReview() {
    return request("/reviews/mine", { auth: true });
  },
  submitReview({ rating, comment }) {
    return request("/reviews", { method: "POST", auth: true, body: { rating, comment } });
  },
};
