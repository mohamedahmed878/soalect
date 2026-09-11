import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";

// @route  GET /api/reviews
// @access Public
// Returns the latest reviews (for display) plus real, accurate stats
// computed across ALL reviews — not just the ones shown — for things
// like the homepage's "عميل راضي" counter.
export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({}).sort({ createdAt: -1 }).limit(50);
  const allRatings = await Review.find({}, "rating");

  const count = allRatings.length;
  const average = count ? allRatings.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const satisfiedCount = allRatings.filter((r) => r.rating >= 4).length;

  res.json({
    reviews,
    stats: { count, average: Math.round(average * 10) / 10, satisfiedCount },
  });
});

// @route  GET /api/reviews/mine
// @access Private
// Lets a logged-in customer check whether they've already left a review,
// so the frontend can pre-fill the form for editing instead of duplicating.
export const getMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ user: req.user._id });
  res.json(review);
});

// @route  POST /api/reviews
// @access Private
// A logged-in customer submits (or updates) their review of the store.
export const submitReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    res.status(400);
    throw new Error("لازم تختار تقييم من 1 لـ5 نجوم");
  }
  if (!comment || !comment.trim()) {
    res.status(400);
    throw new Error("اكتب رأيك في المتجر");
  }
  if (comment.trim().length > 500) {
    res.status(400);
    throw new Error("الرأي طويل أوي — حاول تختصره");
  }

  const review = await Review.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, name: req.user.name, rating: ratingNum, comment: comment.trim() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(review);
});

// @route  DELETE /api/reviews/:id
// @access Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("الريفيو غير موجود");
  }

  await review.deleteOne();
  res.json({ message: "تم حذف الريفيو" });
});
