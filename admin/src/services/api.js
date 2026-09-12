// Real API client for the SOOLECT backend (backend/). Replaces the old
// localStorage-only mock. Admin auth hits /api/auth/admin-login, which
// rejects any account that isn't role "admin" server-side.

// Real API client for the SOOLECT backend (backend/). Replaces the old
// localStorage-only mock. Admin auth hits /api/auth/admin-login, which
// rejects any account that isn't role "admin" server-side.

// Reads the backend URL from an environment variable — set VITE_API_URL
// in this project's Vercel settings (or admin/.env locally) instead of
// ever hardcoding a URL here. A hardcoded URL breaks the moment the
// backend gets redeployed under a different Vercel URL.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "soolect_admin_token";
const SESSION_KEY = "soolect_admin_session";
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(user, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
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
    throw new Error("مش قادرين نوصل للسيرفر. تأكد إن الباك إند شغال.");
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

function mapOrder(o) {
  return { ...o, id: o.orderNumber, totals: { subtotal: o.subtotal } };
}

export const adminApi = {
  // ---- Auth ----
  async login({ email, password }) {
    const data = await request("/auth/admin-login", { method: "POST", body: { email, password }, auth: false });
    setSession(data.user, data.token);
    return data.user;
  },
  async googleLogin(credential) {
    const data = await request("/auth/admin-google", { method: "POST", body: { credential }, auth: false });
    setSession(data.user, data.token);
    return data.user;
  },
  logout() {
    clearSession();
    return Promise.resolve(true);
  },
  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getToken,

  // ---- Products ----
  getProducts() {
    return request("/products", { auth: false });
  },
  createProduct(product) {
    return request("/products", { method: "POST", body: product });
  },
  updateProduct(id, patch) {
    return request(`/products/${id}`, { method: "PUT", body: patch });
  },
  deleteProduct(id) {
    return request(`/products/${id}`, { method: "DELETE" });
  },
  uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    return uploadRequest("/upload", formData);
  },

  // ---- Orders ----
  getOrders() {
    return request("/orders").then((orders) => orders.map(mapOrder));
  },
  updateOrderStatus(mongoId, status) {
    return request(`/orders/${mongoId}/status`, { method: "PATCH", body: { status } }).then(mapOrder);
  },

  // ---- Users ----
  getUsers() {
    return request("/users");
  },

  // ---- Affiliates / Marketers ----
  getAffiliates() {
    return request("/affiliates");
  },
  getAffiliateById(id) {
    return request(`/affiliates/${id}`);
  },
  updateAffiliateStatus(id, status) {
    return request(`/affiliates/${id}/status`, { method: "PATCH", body: { status } });
  },
  updateAffiliateCode(id, referralCode, { discountType, discountAmount, discountPercent } = {}) {
    return request(`/affiliates/${id}/code`, {
      method: "PATCH",
      body: { referralCode, discountType, discountAmount, discountPercent },
    });
  },
  clearAffiliateEarnings(id) {
    return request(`/affiliates/${id}/clear-earnings`, { method: "PATCH" });
  },

  // ---- Orders (delete) ----
  deleteOrder(id) {
    return request(`/orders/${id}`, { method: "DELETE" });
  },

  // ---- Site settings (hero editor) ----
  getSettings() {
    return request("/settings", { auth: false });
  },
  updateSettings(patch) {
    return request("/settings", { method: "PUT", body: patch });
  },

  // ---- Reviews (moderation) ----
  getReviews() {
    return request("/reviews", { auth: false });
  },
  deleteReview(id) {
    return request(`/reviews/${id}`, { method: "DELETE" });
  },
};