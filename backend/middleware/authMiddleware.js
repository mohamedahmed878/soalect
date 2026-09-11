import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// Verifies the Bearer token and attaches the user (without password) to req.user.
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("مش مسموح — لازم تسجل دخولك الأول");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error("المستخدم مش موجود");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("جلسة الدخول غير صحيحة أو منتهية");
  }
});

// Like protect, but never rejects the request — used for guest checkout.
// If a valid token is present, req.user is set (so a logged-in customer
// still gets the order linked to their account and visible in "حسابي").
// If not, req.user stays undefined and the request just continues as a
// guest order.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    } catch {
      // Invalid/expired token on a guest-friendly route — just proceed
      // as a guest instead of blocking the request.
    }
  }

  next();
});
