import multer from "multer";
import path from "path";

// Memory storage — NOT disk storage. Vercel's serverless functions run
// on an ephemeral filesystem that doesn't persist between requests, so
// anything written to disk here would fail or vanish immediately. We
// keep the file in memory as a Buffer and hand it straight to Vercel
// Blob storage in the controller instead.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("الملف لازم يكون صورة (jpg, png, webp, gif)"));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
