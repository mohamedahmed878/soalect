import express from "express";
import { register, login, googleAuth, adminLogin, adminGoogleAuth, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/admin-login", adminLogin);
router.post("/admin-google", adminGoogleAuth);
router.get("/me", protect, getMe);

export default router;
