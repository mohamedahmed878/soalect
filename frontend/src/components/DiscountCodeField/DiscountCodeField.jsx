import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../../services/api";
import { getStoredReferral, setStoredReferral, clearStoredReferral } from "../../utils/referral";
import { formatPrice } from "../../utils/format";
import "./discountCodeField.css";

/**
 * Lets the customer type a marketer's discount/referral code (or arrives
 * with one already stored from a ?ref= link). Reports the applied state
 * up via onChange so the parent (Cart/Checkout) can recompute the total
 * instantly — this component never shows a price itself, just manages
 * the code.
 *
 * Deliberately NOT a <form> — this sits inside Checkout's own <form>,
 * and a nested <form> is invalid HTML that can hijack the outer submit.
 * Enter key + button click both call the same handler directly instead.
 */
export default function DiscountCodeField({ onChange, subtotal }) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null); // { code, ownerName, discountAmount } | null
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = getStoredReferral();
    if (stored) {
      api.validateReferralCode(stored, subtotal).then((res) => {
        if (res.valid) {
          const info = { code: stored, ownerName: res.ownerName, discountAmount: res.discountAmount || 0 };
          setApplied(info);
          onChange?.(info);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApply() {
    if (!code.trim() || checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await api.validateReferralCode(code, subtotal);
      if (res.valid) {
        const normalized = code.trim().toUpperCase();
        setStoredReferral(normalized);
        const info = { code: normalized, ownerName: res.ownerName, discountAmount: res.discountAmount || 0 };
        setApplied(info);
        onChange?.(info);
        setCode("");
      } else {
        setError("الكود ده مش صحيح أو مش شغال حاليًا");
      }
    } catch {
      setError("مش قادرين نتأكد من الكود دلوقتي");
    } finally {
      setChecking(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // never let Enter bubble up and submit the outer checkout form
      handleApply();
    }
  }

  function handleRemove() {
    clearStoredReferral();
    setApplied(null);
    onChange?.(null);
  }

  return (
    <AnimatePresence mode="wait">
      {applied ? (
        <motion.div
          key="applied"
          className="discount-applied"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="discount-applied__check">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M5 13 L10 18 L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            كود <strong>{applied.code}</strong>
            {applied.discountAmount > 0 ? ` — خصم ${formatPrice(applied.discountAmount)}` : " مفعّل"}
          </span>
          <button type="button" onClick={handleRemove}>إزالة</button>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          className="discount-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="عندك كود مسوق أو كود خصم؟"
            style={{ direction: "ltr", textAlign: "right" }}
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={handleApply} disabled={checking}>
            {checking ? "جاري التحقق..." : "تفعيل"}
          </button>
          {error && <span className="field-error">{error}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
