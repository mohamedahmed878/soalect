import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { authLimiter, apiLimiter, adminLoginLimiter, uploadLimiter } from "./middleware/rateLimitMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  const message =
    "❌ JWT_SECRET مش موجود أو قصير أوي (لازم 32 حرف على الأقل). " +
    "حط قيمة عشوائية طويلة وسرية في متغيرات البيئة قبل ما تشغّل السيرفر.";
  console.error(message);
  if (process.env.NODE_ENV !== "production") process.exit(1);
  throw new Error(message);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

connectDB().catch((err) => {
  console.error("Startup DB connection failed (will retry per-request):", err.message);
});

const app = express();

// ---- Security hardening ----
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// السماح لجميع الـ Origins مؤقتاً لحل مشكلة الـ CORS تماماً
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(mongoSanitize());
app.use(hpp()); 
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.use(["/api/auth/admin-login", "/api/auth/admin-google"], adminLoginLimiter);
app.use("/api/upload", uploadLimiter);

// Serve uploaded product images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.json({ status: "SOOLECT API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/affiliates", affiliateRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use(sitemapRoutes);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 SOOLECT API running on http://localhost:${PORT}`);
  });
}

export default app;