import rateLimit from "express-rate-limit";

// Applies to /api/auth/* — login, register, admin-login, google.
// Generous enough for normal use, tight enough to slow down brute force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "محاولات كتير — استنى شوية وحاول تاني" },
});

// A tighter limiter specifically for admin login attempts — the admin
// account is the single highest-value target, so it gets fewer tries
// than a normal customer login.
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "محاولات دخول كتير — استنى شوية وحاول تاني" },
});

// A looser limiter for the rest of the API, mostly to blunt scripted abuse.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "طلبات كتير من نفس الجهاز — استنى شوية" },
});

// Uploads (product images, payment-proof screenshots) can be up to 5MB
// each — the generic apiLimiter's 300 req/15min would still allow up to
// ~1.5GB of uploads from one IP in that window, so this caps it much
// tighter specifically for the upload routes.
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "رفعت صور كتير من نفس الجهاز — استنى شوية وحاول تاني" },
});
