import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "../StarRating/StarRating";
import Reveal from "../Reveal/Reveal";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { formatDate } from "../../utils/format";
import "./customerreviews.css";

export default function CustomerReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(null);
  const [stats, setStats] = useState({ count: 0, average: 0 });
  const [myReview, setMyReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    api.getReviews().then((data) => {
      setReviews(data.reviews);
      setStats(data.stats);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setMyReview(null);
      return;
    }
    api.getMyReview().then((r) => {
      setMyReview(r);
      if (r) {
        setRating(r.rating);
        setComment(r.comment);
      }
    }).catch(() => {});
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!rating) {
      setError("اختار تقييمك الأول بالنجوم");
      return;
    }
    if (!comment.trim()) {
      setError("اكتب رأيك في المتجر");
      return;
    }

    setSubmitting(true);
    try {
      const saved = await api.submitReview({ rating, comment });
      setMyReview(saved);
      setShowForm(false);
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);

      // Refresh the public list + stats so the new review appears immediately.
      const data = await api.getReviews();
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section container reviews-section">
      <Reveal>
        <div className="section-head">
          <div>
            <p className="eyebrow">آراء العملاء</p>
            <h2 className="section-title">إيه رأي اللي جربوا SOOLECT</h2>
          </div>

          {stats.count > 0 && (
            <div className="reviews-summary">
              <StarRating value={stats.average} size={18} />
              <span className="reviews-summary__text">
                {stats.average} من 5 · {stats.count} تقييم
              </span>
            </div>
          )}
        </div>
      </Reveal>

      {/* ---- Write a review CTA / form ---- */}
      <Reveal delay={0.05}>
        <div className="reviews-cta">
          {!user ? (
            <p className="reviews-cta__prompt">
              <Link to="/login" className="link-arrow">سجّل دخولك</Link> عشان تكتب رأيك في المتجر.
            </p>
          ) : justSubmitted ? (
            <p className="reviews-cta__success">تم حفظ رأيك، شكرًا ليك! ✓</p>
          ) : !showForm ? (
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)}>
              {myReview ? "عدّل رأيك" : "اكتب رأيك في المتجر"}
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="review-form"
              onSubmit={handleSubmit}
            >
              <div className="review-form__field">
                <span>تقييمك</span>
                <StarRating value={rating} onChange={setRating} interactive size={26} />
              </div>
              <textarea
                className="review-form__textarea"
                placeholder="إيه رأيك في المنتجات والخدمة؟"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
              />
              {error && <p className="field-error">{error}</p>}
              <div className="review-form__actions">
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? "جاري الحفظ..." : "نشر الرأي"}
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>
                  إلغاء
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </Reveal>

      {/* ---- Reviews list ---- */}
      {!reviews ? null : reviews.length === 0 ? (
        <p className="reviews-empty">لسه مفيش تقييمات — كن أول واحد يكتب رأيه!</p>
      ) : (
        <div className="reviews-grid">
          <AnimatePresence>
            {reviews.slice(0, 6).map((r, i) => (
              <Reveal key={r._id} delay={i * 0.06}>
                <div className="review-card">
                  <StarRating value={r.rating} size={16} />
                  <p className="review-card__comment">{r.comment}</p>
                  <div className="review-card__meta">
                    <span className="review-card__name">{r.name}</span>
                    <span className="review-card__date">{formatDate(r.createdAt)}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
