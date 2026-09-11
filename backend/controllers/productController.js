import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// @route  GET /api/products?category=hoodies
// @access Public
export const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category && category !== "all" ? { category } : {};
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

// @route  GET /api/products/:slug
// @access Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    res.status(404);
    throw new Error("المنتج غير موجود");
  }
  res.json(product);
});

// @route  POST /api/products
// @access Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.slug) {
    data.slug = slugify(data.nameEn || data.name);
  }
  const product = await Product.create(data);
  res.status(201).json(product);
});

// @route  PUT /api/products/:id
// @access Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("المنتج غير موجود");
  }
  Object.assign(product, req.body);
  await product.save();
  res.json(product);
});

// @route  DELETE /api/products/:id
// @access Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("المنتج غير موجود");
  }
  await product.deleteOne();
  res.json({ message: "تم حذف المنتج" });
});
