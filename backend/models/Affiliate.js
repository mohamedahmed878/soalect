import mongoose from "mongoose";

const affiliateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    requestNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    marketingPlan: { type: String, required: true }, // "هيسوق إزاي" — free text from the applicant
    referralCode: { type: String, required: true, unique: true },
    // The code can give either a flat currency amount OR a percentage off.
    discountType: { type: String, enum: ["fixed", "percentage"], default: "fixed" },
    discountAmount: { type: Number, default: 0, min: 0 }, // used when discountType === "fixed"
    discountPercent: { type: Number, default: 0, min: 0, max: 100 }, // used when discountType === "percentage"
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    // Set when the marketer taps "طلب سحب الأرباح" — cleared again once
    // the admin pays them out and clears their earnings.
    withdrawalRequestedAt: { type: Date, default: null },
    // Commission is computed live from delivered orders (see
    // computeAffiliateStats), not stored as a running balance. Once the
    // admin actually pays a marketer, we don't touch old orders — we
    // just record the cutoff date here, so only orders AFTER it count
    // toward commission from then on. That keeps the order history
    // intact while "resetting" what the marketer sees as owed to them.
    payoutsClearedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

affiliateSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export default mongoose.model("Affiliate", affiliateSchema);
