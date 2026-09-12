import asyncHandler from "express-async-handler";
import { put } from "@vercel/blob";
import crypto from "crypto";
import path from "path";

// Uploads the file straight to Vercel Blob storage (persistent,
// CDN-backed object storage) instead of writing to local disk — disk
// writes don't survive on Vercel's serverless functions. Requires the
// BLOB_READ_WRITE_TOKEN env var, which Vercel adds automatically once
// you connect a Blob store to this project: Vercel Dashboard → your
// backend project → Storage tab → Create Database → Blob.
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("مفيش صورة اتبعتت");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500);
    throw new Error(
      "تخزين الصور مش متفعّل على السيرفر — لازم تربط Vercel Blob بمشروع الباك إند من لوحة تحكم Vercel (Storage → Create Database → Blob)."
    );
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;

  const blob = await put(filename, req.file.buffer, {
    access: "public",
    contentType: req.file.mimetype,
  });

  res.json({ url: blob.url });
});
