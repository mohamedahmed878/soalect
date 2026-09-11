// Run with: npm run seed:products
// Populates (or refreshes) the 6 demo products used to test the full
// browse → cart → checkout flow. Safe to re-run — it clears and re-inserts.

import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

const PRODUCTS = [
  {
    name: "تيشيرت أوفرسايز SOOLECT",
    nameEn: "SOOLECT Oversize Tee",
    slug: "oversize-tee",
    category: "tshirts",
    price: 550,
    stock: 42,
    isNew: true,
    colors: [
      { name: "أسود", hex: "#111111" },
      { name: "أبيض", hex: "#efeee6" },
      { name: "رمادي", hex: "#8a8a82" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [],
    description: "تيشيرت أوفرسايز بقصة مريحة وقماش قطن ثقيل 240 جم، طبعة ظهر مميزة بخط SOOLECT.",
  },
  {
    name: "هودي SOOLECT الأساسي",
    nameEn: "SOOLECT Hoodie",
    slug: "signature-hoodie",
    category: "hoodies",
    price: 850,
    stock: 27,
    isNew: true,
    colors: [
      { name: "أسود", hex: "#111111" },
      { name: "رمادي فحمي", hex: "#3a3b36" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [],
    description: "هودي شتوي بقماش فليس كثيف 380 جم وقلنسوة مبطنة، مع طبعة جرافيك مركزية.",
  },
  {
    name: "تيشيرت مينيمال أبيض",
    nameEn: "Minimal Tee — White",
    slug: "minimal-tee-white",
    category: "tshirts",
    price: 450,
    stock: 60,
    isNew: false,
    colors: [
      { name: "أبيض", hex: "#efeee6" },
      { name: "أسود", hex: "#111111" },
    ],
    sizes: ["S", "M", "L", "XL"],
    images: [],
    description: "تيشيرت أساسي بقصة عادية وطبعة صغيرة على الصدر.",
  },
  {
    name: "بنطلون كارجو أسود",
    nameEn: "Cargo Pants — Black",
    slug: "cargo-pants-black",
    category: "pants",
    price: 900,
    stock: 15,
    isNew: true,
    colors: [
      { name: "أسود", hex: "#111111" },
      { name: "كاكي", hex: "#77714f" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [],
    description: "بنطلون كارجو بقصة واسعة وجيوب عملية، حزام قابل للتعديل.",
  },
  {
    name: "كاب SOOLECT",
    nameEn: "SOOLECT Cap",
    slug: "signature-cap",
    category: "accessories",
    price: 350,
    stock: 34,
    isNew: false,
    colors: [
      { name: "أسود", hex: "#111111" },
      { name: "أخضر ليموني", hex: "#d4ff3f" },
    ],
    sizes: ["One Size"],
    images: [],
    description: "كاب قطن بمقدمة منحنية وتطريز شعار SOOLECT.",
  },
  {
    name: "بنطلون جوجر",
    nameEn: "Jogger Pants",
    slug: "jogger-pants",
    category: "pants",
    price: 800,
    stock: 5,
    isNew: false,
    colors: [
      { name: "أسود", hex: "#111111" },
      { name: "رمادي", hex: "#8a8a82" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [],
    description: "جوجر رياضي مريح بخصر مطاطي وحبل تعديل، نهايات أنكل مضلعة.",
  },
];

async function run() {
  await connectDB();
  await Product.deleteMany({ slug: { $in: PRODUCTS.map((p) => p.slug) } });
  await Product.insertMany(PRODUCTS);
  console.log(`✅ Seeded ${PRODUCTS.length} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
