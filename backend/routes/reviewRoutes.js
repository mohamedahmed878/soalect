import express from "express";
import { getReviews, getMyReview, submitReview, deleteReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/mine", protect, getMyReview);
router.post("/", protect, submitReview);
router.delete("/:id", protect, adminOnly, deleteReview);

export default router;
