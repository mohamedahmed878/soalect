import { useState } from "react";
import "./starrating.css";

// value: 0-5 (can be a fraction for read-only display, e.g. 4.8)
// interactive: if true, renders clickable/hoverable stars and calls onChange
export default function StarRating({ value = 0, onChange, interactive = false, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  const display = interactive && hovered ? hovered : value;

  return (
    <div
      className={`star-rating ${interactive ? "star-rating--interactive" : ""}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "اختر تقييمك" : `تقييم ${value} من 5`}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(display);
        return (
          <button
            key={star}
            type="button"
            className={`star-rating__star ${filled ? "is-filled" : ""}`}
            style={{ width: size, height: size, cursor: interactive ? "pointer" : "default" }}
            onMouseEnter={() => interactive && setHovered(star)}
            onClick={() => interactive && onChange && onChange(star)}
            disabled={!interactive}
            aria-label={`${star} نجوم`}
            tabIndex={interactive ? 0 : -1}
          >
            <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <path
                d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.5 6.9L12 17.8l-6.1 3.4 1.5-6.9-5.2-4.7 6.9-.7L12 2.5Z"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
