import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { uploadImage } from "../controllers/uploadController.js";

const router = express.Router();

// multer errors (bad file type, too large) throw synchronously inside
// upload.single, so wrap it to route into the error handler cleanly.
function handleUpload(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(err);
    }
    next();
  });
}

router.post("/", protect, adminOnly, handleUpload, uploadImage);

// Uploading a payment-transfer screenshot at checkout must work for
// guests too, since checkout no longer requires an account — it's
// still gated by uploadLimiter (server.js) against abuse, and still
// goes through the same file type/size checks as every other upload.
router.post("/payment-proof", handleUpload, uploadImage);

export default router;
