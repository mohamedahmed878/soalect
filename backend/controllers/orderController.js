import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Affiliate from "../models/Affiliate.js";
import Product from "../models/Product.js";
import { computeDiscountAmount } from "./affiliateController.js";
import { sendWhatsAppMessage, buildOrderConfirmedMessage } from "../utils/whatsapp.js";

function generateOrderNumber() {
  return "SLT-" + Math.floor(100000 + Math.random() * 900000);
}

// Atomically deducts stock for every item, refusing (and rolling back
// whatever already succeeded) if any single item doesn't have enough
// left. The { $gte: qty } guard makes each deduction safe even if two
// customers check out the same product at the same instant.
async function reserveStock(items) {
  const decremented = [];

  for (const it of items) {
    const result = await Product.updateOne(
      { _id: it.product, stock: { $gte: it.qty } },
      { $inc: { stock: -it.qty } }
    );

    if (result.matchedCount === 0) {
      // Not enough stock for this item — undo everything we already
      // deducted in this same order before reporting the failure.
      for (const done of decremented) {
        await Product.updateOne({ _id: done.product }, { $inc: { stock: done.qty } });
      }
      const product = await Product.findById(it.product);
      const error = new Error(
        product ? `الكمية المتاحة من "${product.name}" مش كفاية` : "منتج غير متاح"
      );
      error.status = 400;
      throw error;
    }

    decremented.push(it);
  }
}

// Puts stock back — used when an order is cancelled or removed before
// it was actually delivered, so the items become sellable again.
async function restoreStock(items) {
  for (const it of items) {
    await Product.updateOne({ _id: it.product }, { $inc: { stock: it.qty } });
  }
}

// @route  POST /api/orders
// @access Public (works both logged-in and as a guest — see optionalAuth)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, customer, referralCode, paymentMethod, paymentProofUrl } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("سلة المشتريات فارغة");
  }
  if (!customer || !customer.fullName || !customer.phone || !customer.address) {
    res.status(400);
    throw new Error("بيانات التوصيل ناقصة");
  }

  const safePaymentMethod = paymentMethod === "instapay" ? "instapay" : "cod";
  if (safePaymentMethod === "instapay") {
    if (!paymentProofUrl || typeof paymentProofUrl !== "string" || !paymentProofUrl.includes("/uploads/")) {
      res.status(400);
      throw new Error("ارفع صورة إثبات التحويل الأول");
    }
  }

  // ---- Price integrity: never trust the price/subtotal the browser sends.
  // Re-fetch every product from the database and rebuild each line item
  // (and the subtotal) from the real, current price. This is the only
  // way to stop a customer from editing the request in dev tools and
  // checking out at whatever price they want.
  const productIds = items.map((it) => it.product).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const verifiedItems = items.map((it) => {
    const product = productMap.get(String(it.product));
    if (!product) {
      res.status(400);
      throw new Error(`منتج غير موجود في الطلب`);
    }

    const qty = Math.max(1, Math.floor(Number(it.qty) || 1));

    return {
      product: product._id,
      name: product.name,
      color: it.color,
      size: it.size,
      qty,
      price: product.price, // ← real price from the DB, never from the client
    };
  });

  const subtotal = verifiedItems.reduce((sum, it) => sum + it.price * it.qty, 0);

  // ---- Stock: deduct what's being bought, refuse if not enough is left.
  try {
    await reserveStock(verifiedItems);
  } catch (err) {
    res.status(err.status || 400);
    throw err;
  }

  let affiliateId = null;
  let discountCode = null;
  let discountAmount = 0;

  if (referralCode) {
    const affiliate = await Affiliate.findOne({ referralCode: referralCode.trim().toUpperCase(), status: "approved" });
    if (affiliate) {
      affiliateId = affiliate._id;
      discountCode = affiliate.referralCode;
      // Never let the discount exceed the (server-verified) order value.
      discountAmount = computeDiscountAmount(affiliate, subtotal);
    }
  }

  let order;
  try {
    order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user?._id || null,
      items: verifiedItems,
      customer,
      subtotal,
      discountCode,
      discountAmount,
      status: "New",
      affiliate: affiliateId,
      paymentMethod: safePaymentMethod,
      paymentProofUrl: safePaymentMethod === "instapay" ? paymentProofUrl : null,
    });
  } catch (err) {
    // Order failed to save after stock was already deducted (e.g. a
    // validation error on the customer fields) — give the stock back.
    await restoreStock(verifiedItems);
    throw err;
  }

  res.status(201).json(order);
});

// @route  GET /api/orders/mine
// @access Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @route  PATCH /api/orders/:id
// @access Private (order owner only, only while status is still "New")
// The customer can fix their delivery details and change item
// QUANTITIES — not swap products, colors, or sizes, since that would
// reopen the same price-tampering surface createOrder guards against.
// Any qty change re-verifies and adjusts stock the same safe way as a
// fresh order.
export const updateMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("الطلب غير موجود");
  }
  if (String(order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error("مش مسموح تعدل طلب مش بتاعك");
  }
  if (order.status !== "New") {
    res.status(400);
    throw new Error("مش ممكن تعدل الطلب بعد ما يتأكد من الإدارة");
  }

  const { customer, items } = req.body;

  if (customer) {
    if (!customer.fullName || !customer.phone || !customer.address) {
      res.status(400);
      throw new Error("بيانات التوصيل ناقصة");
    }
    order.customer.fullName = customer.fullName;
    order.customer.phone = customer.phone;
    order.customer.email = customer.email || "";
    order.customer.governorate = customer.governorate;
    order.customer.city = customer.city;
    order.customer.address = customer.address;
    order.customer.notes = customer.notes || "";
  }

  if (items) {
    if (items.length !== order.items.length) {
      res.status(400);
      throw new Error("مش ممكن تضيف أو تشيل منتجات من الطلب — بس تقدر تغيّر الكمية");
    }

    const newQtys = [];
    const deltas = []; // { product, delta } — positive delta = needs MORE stock

    for (let i = 0; i < items.length; i++) {
      const existing = order.items[i];
      if (
        String(items[i].product) !== String(existing.product) ||
        items[i].color !== existing.color ||
        items[i].size !== existing.size
      ) {
        res.status(400);
        throw new Error("مش ممكن تغيّر المنتج أو اللون أو المقاس — بس الكمية");
      }
      const requestedQty = Math.max(1, Math.floor(Number(items[i].qty) || 1));
      newQtys.push(requestedQty);
      const delta = requestedQty - existing.qty;
      if (delta !== 0) deltas.push({ product: existing.product, delta });
    }

    const applied = [];
    try {
      for (const d of deltas) {
        if (d.delta > 0) {
          const result = await Product.updateOne(
            { _id: d.product, stock: { $gte: d.delta } },
            { $inc: { stock: -d.delta } }
          );
          if (result.matchedCount === 0) {
            const product = await Product.findById(d.product);
            const error = new Error(
              product ? `الكمية المتاحة من "${product.name}" مش كفاية` : "منتج غير متاح"
            );
            error.status = 400;
            throw error;
          }
        } else {
          await Product.updateOne({ _id: d.product }, { $inc: { stock: -d.delta } }); // -delta is positive here
        }
        applied.push(d);
      }
    } catch (err) {
      for (const d of applied) {
        await Product.updateOne({ _id: d.product }, { $inc: { stock: d.delta } }); // undo
      }
      res.status(err.status || 400);
      throw err;
    }

    order.items.forEach((it, i) => {
      it.qty = newQtys[i];
    });
    order.subtotal = order.items.reduce((sum, it) => sum + it.price * it.qty, 0);

    if (order.discountCode) {
      const affiliate = await Affiliate.findOne({ referralCode: order.discountCode, status: "approved" });
      order.discountAmount = computeDiscountAmount(affiliate, order.subtotal);
    }
  }

  order.editedAt = new Date();
  await order.save();

  res.json(order);
});

// @route  PATCH /api/orders/:id/cancel
// @access Private (must own the order, and it must still be "New")
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("الطلب غير موجود");
  }
  if (String(order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error("مش مسموح تلغي طلب مش بتاعك");
  }
  if (order.status !== "New") {
    res.status(400);
    throw new Error("مش ممكن تلغي الطلب بعد ما يتأكد من الإدارة");
  }

  order.status = "Cancelled";
  await order.save();
  await restoreStock(order.items);

  res.json(order);
});

// @route  GET /api/orders
// @access Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

// @route  PATCH /api/orders/:id/status
// @access Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["New", "Confirmed", "Shipped", "Delivered"];

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error("حالة الطلب غير صحيحة");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("الطلب غير موجود");
  }
  if (order.status === "Cancelled") {
    res.status(400);
    throw new Error("الطلب ده ملغي من العميل، مش ممكن تغيّر حالته");
  }
  if (order.status === "Delivered") {
    res.status(400);
    throw new Error("الطلب ده وصل بالفعل، مش ممكن تغيّر حالته تاني — احذفه لو محتاج تصححه");
  }

  order.status = status;

  // First time an order is confirmed, let the customer know on WhatsApp.
  // Never blocks the response — a failed/unconfigured send is logged and
  // ignored, the status change itself always succeeds.
  if (status === "Confirmed" && !order.confirmationNotifiedAt) {
    order.confirmationNotifiedAt = new Date();
    sendWhatsAppMessage(order.customer.phone, buildOrderConfirmedMessage(order)).catch(() => {});
  }

  await order.save();

  res.json(order);
});

// @route  DELETE /api/orders/:id
// @access Private/Admin
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("الطلب غير موجود");
  }

  // Only give the stock back if it hasn't already been accounted for —
  // a Delivered order's items are genuinely gone, and a Cancelled
  // order's stock was already restored when it was cancelled.
  if (order.status !== "Delivered" && order.status !== "Cancelled") {
    await restoreStock(order.items);
  }

  await order.deleteOne();
  res.json({ message: "تم حذف الطلب" });
});
