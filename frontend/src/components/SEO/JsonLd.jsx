import { useEffect } from "react";

/**
 * Injects a <script type="application/ld+json"> into <head> with the
 * given structured data object, keyed by `id` so it can be replaced
 * cleanly when the data changes (e.g. navigating between products)
 * instead of piling up duplicate script tags.
 */
export default function JsonLd({ id, data }) {
  useEffect(() => {
    if (!data) return;

    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);

    return () => {
      script?.remove();
    };
  }, [id, data]);

  return null;
}
