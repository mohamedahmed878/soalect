import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }, // snapshot of the customer's name at review time
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// One review per customer — resubmitting updates their existing review
// instead of piling up duplicates.
reviewSchema.index({ user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
