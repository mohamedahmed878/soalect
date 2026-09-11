import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref and adds
 * `.is-visible` (paired with the `.reveal` class in index.css) once the
 * element scrolls into view. Used for the "reveal on scroll" effect
 * across the site.
 */
export function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
