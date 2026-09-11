// @route  POST /api/upload
// @access Private/Admin
export function uploadImage(req, res) {
  if (!req.file) {
    res.status(400);
    throw new Error("مفيش ملف اتبعت");
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
}
