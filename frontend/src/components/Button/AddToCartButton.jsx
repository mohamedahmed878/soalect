import { useState, useRef } from "react";

/**
 * "أضف إلى السلة" button that morphs into a check mark briefly
 * after a successful add, then reverts. Purely presentational —
 * the actual cart mutation happens in onAdd.
 */
export default function AddToCartButton({ onAdd, disabled, block, size }) {
  const [added, setAdded] = useState(false);
  const timeoutRef = useRef(null);

  function handleClick() {
    if (disabled) return;
    onAdd?.();
    setAdded(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      className={`btn btn-primary btn-add ${added ? "is-added" : ""} ${block ? "btn-block" : ""} ${
        size === "sm" ? "btn-sm" : ""
      }`}
      onClick={handleClick}
      disabled={disabled}
      aria-live="polite"
    >
      <span className="btn-add__label">أضف إلى السلة</span>
      <span className="btn-add__check" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 13 L10 18 L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        أُضيف
      </span>
    </button>
  );
}
