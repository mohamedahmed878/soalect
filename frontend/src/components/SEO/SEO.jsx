import { useEffect } from "react";

const SITE_NAME = "SOOLECT";
const DEFAULT_DESCRIPTION =
  "SOOLECT — ماركة ملابس ستريت وير مصرية. تيشيرتات، هوديز، وبناطيل كارجو بجودة عالية وتصميم مميز. شحن لكل محافظات مصر.";
const DEFAULT_IMAGE = "/images/og-cover.jpg";

function setMetaTag(selector, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, attrName, attrValue] = selector.match(/\[(.+?)="(.+?)"\]/) || [];
    if (attrName) el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Drop this at the top of any page to set that page's title, description,
 * Open Graph/Twitter tags, and canonical URL. No extra dependency (no
 * react-helmet) — just direct, idempotent DOM updates on mount/change.
 *
 * Note: since this is a client-rendered SPA, these tags update AFTER the
 * initial HTML loads. Search engines that execute JS (Google) pick this
 * up fine; link-preview bots that don't run JS (some old crawlers) will
 * only see the defaults in index.html. For maximum social-preview
 * fidelity per page, a prerendering/SSR layer would be the next step.
 */
export default function SEO({ title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, path, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — أسلوبك. هويتك.`;
    document.title = fullTitle;

    setMetaTag('meta[name="description"]', "content", description);
    setMetaTag('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");

    setMetaTag('meta[property="og:title"]', "content", fullTitle);
    setMetaTag('meta[property="og:description"]', "content", description);
    setMetaTag('meta[property="og:type"]', "content", "website");
    setMetaTag('meta[property="og:site_name"]', "content", SITE_NAME);
    if (image) {
      const fullImage = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      setMetaTag('meta[property="og:image"]', "content", fullImage);
      setMetaTag('meta[name="twitter:image"]', "content", fullImage);
    }

    setMetaTag('meta[name="twitter:card"]', "content", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "content", fullTitle);
    setMetaTag('meta[name="twitter:description"]', "content", description);

    const url = `${window.location.origin}${path || window.location.pathname}`;
    setMetaTag('meta[property="og:url"]', "content", url);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description, image, path, noindex]);

  return null;
}
