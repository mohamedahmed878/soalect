import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // Arabic display name
    nameEn: { type: String, required: true, trim: true }, // English / logo-style name
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["tshirts", "hoodies", "pants", "accessories"],
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    isNew: { type: Boolean, default: false },
    description: { type: String, default: "" },
    colors: { type: [colorSchema], default: [] },
    sizes: { type: [String], default: [] },
    images: { type: [String], default: [] }, // URLs — real file upload comes with admin file storage
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });

// Expose a plain `id` alongside `_id` so the frontend/admin code
// (originally written against the mock API's `id` field) keeps working.
productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export default mongoose.model("Product", productSchema);
