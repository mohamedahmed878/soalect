// Must run after `protect`, so req.user is already set.
export function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("الصفحة دي مخصصة للأدمن بس");
}
