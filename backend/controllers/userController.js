import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Order from "../models/Order.js";

// @route  GET /api/users
// @access Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "customer" }).sort({ createdAt: -1 });

  // Attach an order count per user for the admin table.
  const withCounts = await Promise.all(
    users.map(async (u) => {
      const ordersCount = await Order.countDocuments({ user: u._id });
      return { ...u.toJSON(), ordersCount, joinedAt: u.createdAt };
    })
  );

  res.json(withCounts);
});
