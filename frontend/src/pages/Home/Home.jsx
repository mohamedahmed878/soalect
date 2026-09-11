import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Marquee from "../../components/Marquee/Marquee";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import ProductCard from "../../components/ProductCard/ProductCard";
import Reveal from "../../components/Reveal/Reveal";
import SEO from "../../components/SEO/SEO";
import JsonLd from "../../components/SEO/JsonLd";
import StatCounter from "../../components/StatCounter/StatCounter";
import CustomerReviews from "../../components/CustomerReviews/CustomerReviews";
import { ProductGridSkeleton } from "../../components/Loading/Loading";
import { CATEGORIES } from "../../data/categories";
import { api } from "../../services/api";
import "./home.css";

const FEATURES = [
  {
    label: "PREMIUM\nCOTTON",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3c-2 0-3 2-3 3-1-1-3-1-4 0-1.5 1.5-1 4 1 5-1 .5-2 2-1 4 1 1.5 3 1.5 4 .5.5 1.5 2 2 3 2s2.5-.5 3-2c1 1 3 1 4-.5 1-2 0-3.5-1-4 2-1 2.5-3.5 1-5-1-1-3-1-4 0 0-1-1-3-3-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 8v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "BREATHABLE\nFABRIC",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 8h2a3 3 0 1 0-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 13h13a3 3 0 1 1-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 18h10a3 3 0 1 0-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "DURABLE\nQUALITY",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "PERFECT\nFIT",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 4 6 6 4 9l2 2 1-1v9h10v-9l1 1 2-2-2-3-3-2c0 1.7-1.3 3-3 3s-3-1.3-3-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Home() {
  const [products, setProducts] = useState(null);
  const [productsCount, setProductsCount] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    api.getProducts().then((list) => {
      setProductsCount(list.length);
      setProducts(list.filter((p) => p.isNew).concat(list).slice(0, 4));
    });
    api.getSettings().then((s) => setHeroImage(s.heroImage || "")).catch(() => {});
    // Real numbers only — "عميل راضي" below comes from actual customer
    // reviews (rating ≥ 4), never a made-up figure.
    api.getReviews().then((d) => setReviewStats(d.stats)).catch(() => {});
  }, []);

  return (
    <>
      <SEO
        title="SOOLECT — أسلوبك. هويتك."
        description="SOOLECT — ماركة ملابس ستريت وير مصرية. تيشيرتات وهوديز وبناطيل كارجو بجودة عالية وتصميم مميز. شحن لكل محافظات مصر."
        path="/"
      />
      <JsonLd
        id="organization-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "ClothingStore",
          name: "SOOLECT",
          url: "https://www.soolect.com/",
          logo: "https://www.soolect.com/images/favicon.svg",
          description: "SOOLECT — ماركة ملابس ستريت وير مصرية. شحن لكل محافظات مصر.",
          areaServed: "EG",
          ...(reviewStats && reviewStats.count > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: reviewStats.average,
                  reviewCount: reviewStats.count,
                },
              }
            : {}),
        }}
      />
      <JsonLd
        id="website-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SOOLECT",
          url: "https://www.soolect.com/",
        }}
      />

      {/* ---------------- Hero ---------------- */}
      <section className="hero-v2">
        <div className="hero-v2__bg" aria-hidden="true" />

        <div className="container hero-v2__topbar">
          <span className="hero-v2__brand">SOOLECT</span>
          <span className="hero-v2__topbadge">NEW DROP – SS26</span>
        </div>

        <div className="container hero-v2__body">
          <motion.div
            className="hero-v2__copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="hero-v2__wordmark">SOOLECT</h1>
            <div className="hero-v2__subtitle">
              <span>ESSENTIALS SET</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="2.4" fill="currentColor" />
              </svg>
            </div>
            <p className="hero-v2__tagline">
              راحة في كل حركة.
              <br />
              ستايل يعكس شخصيتك.
            </p>

            <ul className="hero-v2__features">
              {FEATURES.map((f) => (
                <li key={f.label}>
                  <span className="hero-v2__feature-icon">{f.icon}</span>
                  <span className="hero-v2__feature-label">
                    {f.label.split("\n").map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>

            <div className="hero-v2__drop">
              <span className="hero-v2__drop-label">NEW DROP</span>
              <span className="hero-v2__drop-season">SS26</span>
            </div>

            <Link to="/products" className="hero-v2__cta">
              تسوق الآن
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 5l7 7-7 7M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <p className="hero-v2__url">WWW.SOOLECT.COM</p>
          </motion.div>

          <motion.div
            className="hero-v2__visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {heroImage ? (
              <img src={heroImage} alt="SOOLECT Essentials Set" className="hero-v2__img" />
            ) : (
              <div className="hero-v2__img-placeholder">
                <span>SOOLECT</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Marquee />

      {/* ---------------- Trust stats ---------------- */}
      <section className="stats-band">
        <div className="container stats-band__grid">
          <Reveal delay={0}>
            <div className="stats-band__item">
              <p className="stats-band__value">
                {reviewStats ? <StatCounter value={reviewStats.satisfiedCount} suffix="+" /> : "—"}
              </p>
              <p className="stats-band__label">عميل راضي</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="stats-band__item">
              <p className="stats-band__value">
                {productsCount !== null ? <StatCounter value={productsCount} /> : "—"}
              </p>
              <p className="stats-band__label">منتج في التشكيلة</p>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="stats-band__item">
              <p className="stats-band__value"><StatCounter value={27} suffix=" محافظة" /></p>
              <p className="stats-band__label">شحن لكل مصر</p>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="stats-band__item">
              <p className="stats-band__value"><StatCounter value={14} suffix=" يوم" /></p>
              <p className="stats-band__label">استبدال واسترجاع</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="section container">
        <Reveal>
          <div className="section-head">
            <h2 className="section-title">تسوق حسب الفئة</h2>
            <Link to="/products" className="link-arrow">عرض الكل</Link>
          </div>
        </Reveal>
        <div className="category-grid">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 0.08}>
              <CategoryCard category={cat} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- New arrivals ---------------- */}
      <section className="section container">
        <Reveal>
          <div className="section-head">
            <h2 className="section-title">وصل حديثًا</h2>
            <Link to="/products" className="link-arrow">عرض الكل</Link>
          </div>
        </Reveal>

        {!products ? (
          <ProductGridSkeleton />
        ) : (
          <div className="product-grid">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Customer reviews ---------------- */}
      <CustomerReviews />

      {/* ---------------- Story banner ---------------- */}
      <section className="story-banner">
        <span className="story-banner__watermark" aria-hidden="true">SOOLECT</span>
        <div className="container story-banner__inner">
          <Reveal>
            <p className="eyebrow">SOOLECT STORY</p>
            <h2>مش مجرد براند ملابس.</h2>
            <p className="story-banner__text">
              بدأنا SOOLECT من فكرة بسيطة: الملابس اللي بتلبسها لازم تحكي حاجة عنك.
              كل قطعة بنصممها بنركز فيها على القماش، القصة، والتفاصيل اللي هي فعلًا
              بتفرق — مش بس شكل خارجي.
            </p>
            <Link to="/about" className="link-arrow">اعرف أكتر عن SOOLECT</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
