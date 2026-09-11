import express from "express";
import {
  createOrder,
  getMyOrders,
  updateMyOrder,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", optionalAuth, createOrder);
router.get("/mine", protect, getMyOrders);
router.patch("/:id", protect, updateMyOrder);
router.patch("/:id/cancel", protect, cancelMyOrder);
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;
