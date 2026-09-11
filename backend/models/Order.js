import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, trim: true, maxlength: 100 },
    governorate: { type: String, required: true, trim: true, maxlength: 50 },
    city: { type: String, required: true, trim: true, maxlength: 50 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    // Optional — guest checkout doesn't require an account. When present,
    // the order shows up in that customer's "حسابي" page; when absent,
    // it's still a completely valid order, just not tied to any account.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    items: { type: [orderItemSchema], required: true },
    customer: { type: customerSchema, required: true },
    subtotal: { type: Number, required: true },
    discountCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["New", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "New",
    },
    // "cod" = cash on delivery (default). "instapay" = the customer
    // transferred via InstaPay/Vodafone Cash etc. and uploaded a proof
    // screenshot — paymentProofUrl holds that image, and the admin sees
    // it marked "تم الدفع" once it's attached.
    paymentMethod: { type: String, enum: ["cod", "instapay"], default: "cod" },
    paymentProofUrl: { type: String, default: null },
    // Set when the customer edits their own order (only allowed while
    // it's still "New") — surfaced to the admin so an edited order gets
    // a fresh look before confirming.
    editedAt: { type: Date, default: null },
    // Set when the admin confirms the order (used to gate WhatsApp
    // notifications from firing more than once).
    confirmationNotifiedAt: { type: Date, default: null },
    // Set when the customer arrived via an affiliate's referral link
    // (?ref=CODE) or typed their discount code, so commission can be
    // attributed to that marketer.
    affiliate: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
