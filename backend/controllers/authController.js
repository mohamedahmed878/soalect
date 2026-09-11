import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { isStrongPassword } from "../utils/validators.js";

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

// @route  POST /api/auth/register
// @access Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("من فضلك أكمل كل الحقول");
  }

  if (!isStrongPassword(password)) {
    res.status(400);
    throw new Error("كلمة المرور لازم تكون 8 حروف على الأقل وتحتوي على حرف ورقم");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error("البريد الإلكتروني ده مسجل بالفعل");
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    user: user.toJSON(),
    token: generateToken(user._id),
  });
});

// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("من فضلك ادخل البريد الإلكتروني وكلمة المرور");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(401);
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  if (!user.password) {
    res.status(401);
    throw new Error("الحساب ده اتعمل بجوجل — سجّل دخولك بزرار جوجل بدل كده");
  }

  if (!(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  res.json({
    user: user.toJSON(),
    token: generateToken(user._id),
  });
});

// @route  POST /api/auth/google
// @access Public
// Accepts the Google ID token from the frontend's Sign in with Google
// button, verifies it server-side, and finds-or-creates the matching user.
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!googleClient) {
    res.status(500);
    throw new Error("تسجيل الدخول بجوجل مش مفعّل — لازم تحط GOOGLE_CLIENT_ID في .env بتاع الباك إند");
  }
  if (!credential) {
    res.status(400);
    throw new Error("بيانات جوجل ناقصة");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, name, sub: googleId, email_verified } = payload;

  // Google can issue ID tokens for accounts whose email isn't verified yet
  // (e.g. some federated identity providers). Trusting an unverified email
  // to log someone into — or silently link to — an existing account would
  // let an attacker claim someone else's email. Refuse those.
  if (!email_verified) {
    res.status(403);
    throw new Error("إيميل جوجل ده غير موثّق — لازم توثّقه من إعدادات جوجل الأول");
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await User.create({ name, email, googleId, role: "customer" });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save({ validateBeforeSave: false });
  }

  res.json({
    user: user.toJSON(),
    token: generateToken(user._id),
  });
});

// @route  POST /api/auth/admin-login
// @access Public (but rejects non-admin accounts)
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("من فضلك ادخل البريد الإلكتروني وكلمة المرور");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  if (user.role !== "admin") {
    res.status(403);
    throw new Error("الحساب ده مش عنده صلاحية أدمن");
  }

  res.json({
    user: user.toJSON(),
    token: generateToken(user._id),
  });
});

// @route  POST /api/auth/admin-google
// @access Public (but rejects non-admin accounts — never creates a new one)
export const adminGoogleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!googleClient) {
    res.status(500);
    throw new Error("تسجيل الدخول بجوجل مش مفعّل — لازم تحط GOOGLE_CLIENT_ID في .env بتاع الباك إند");
  }
  if (!credential) {
    res.status(400);
    throw new Error("بيانات جوجل ناقصة");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    res.status(403);
    throw new Error("إيميل جوجل ده غير موثّق — لازم توثّقه من إعدادات جوجل الأول");
  }

  const user = await User.findOne({ email: payload.email.toLowerCase() });

  // Unlike the storefront's Google sign-in, this NEVER creates a new
  // account — only an existing account that's already role="admin" can
  // get in this way.
  if (!user || user.role !== "admin") {
    res.status(403);
    throw new Error("الحساب ده مش عنده صلاحية أدمن");
  }

  if (!user.googleId) {
    user.googleId = payload.sub;
    await user.save({ validateBeforeSave: false });
  }

  res.json({
    user: user.toJSON(),
    token: generateToken(user._id),
  });
});

// @route  GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user.toJSON());
});
