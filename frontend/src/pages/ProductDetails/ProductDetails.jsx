import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import ProductImage from "../../components/ProductCard/ProductImage";
import ProductCard from "../../components/ProductCard/ProductCard";
import SwingTag from "../../components/SwingTag/SwingTag";
import AddToCartButton from "../../components/Button/AddToCartButton";
import Reveal from "../../components/Reveal/Reveal";
import SEO from "../../components/SEO/SEO";
import JsonLd from "../../components/SEO/JsonLd";
import { PageLoading } from "../../components/Loading/Loading";
import { useCart } from "../../context/CartContext";
import { api } from "../../services/api";
import { formatPrice } from "../../utils/format";
import "./productDetails.css";

const CATEGORY_LABELS = {
  tshirts: "تيشيرتات",
  hoodies: "هوديز",
  pants: "بنطلونات",
  accessories: "إكسسوارات",
};

export default function ProductDetails() {
  const { slug } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(undefined); // undefined = loading, null = not found
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [tab, setTab] = useState("details");
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setProduct(undefined);
    setRelated([]);
    api.getProductBySlug(slug).then((p) => {
      setProduct(p);
      if (p) {
        setColor(p.colors[0]);
        setSize(null);
        setQty(1);
        api.getProducts({ category: p.category }).then((list) => {
          setRelated(list.filter((item) => item.id !== p.id).slice(0, 4));
        });
      }
    });
    window.scrollTo(0, 0);
  }, [slug]);

  if (product === undefined) return <PageLoading />;

  if (product === null) {
    return (
      <section className="section container" style={{ textAlign: "center" }}>
        <h2>المنتج مش موجود</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
          الرجوع للمنتجات
        </Link>
      </section>
    );
  }

  function handleAdd() {
    if (!size) {
      setSizeError(true);
      return;
    }
    addItem(product, { color: color.name, size, qty });
  }

  return (
    <section className="section container product-details">
      <SEO
        title={product.name}
        description={product.description}
        image={product.images?.[0]}
        path={`/products/${product.slug}`}
      />
      <JsonLd
        id="product-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images?.[0] ? [product.images[0]] : undefined,
          sku: product.id,
          offers: {
            "@type": "Offer",
            priceCurrency: "EGP",
            price: product.price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${window.location.origin}/products/${product.slug}`,
          },
        }}
      />
      <div className="pd-grid">
        <Reveal className="pd-gallery">
          <ProductImage product={product} colorHex={color.hex} className="pd-gallery__main" />
          {product.isNew && <SwingTag className="pd-gallery__tag">جديد</SwingTag>}
        </Reveal>

        <Reveal delay={0.1} className="pd-info">
          <p className="eyebrow">{CATEGORY_LABELS[product.category] || product.category}</p>
          <h1 className="pd-name">{product.name}</h1>
          <p className="pd-price">{formatPrice(product.price)}</p>

          <p className="pd-desc">{product.description}</p>

          <div className="pd-option">
            <span className="pd-option__label">اللون: <strong>{color.name}</strong></span>
            <div className="pd-swatches">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  className={`swatch swatch--lg ${color.name === c.name ? "is-active" : ""}`}
                  style={{ "--swatch": c.hex }}
                  aria-label={c.name}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="pd-option">
            <span className="pd-option__label">
              المقاس {sizeError && !size && <em className="field-error">— اختر مقاس</em>}
            </span>
            <div className="pd-sizes">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  className={`size-pill ${size === s ? "is-active" : ""}`}
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pd-option">
            <span className="pd-option__label">الكمية</span>
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="تقليل">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="زيادة">+</button>
            </div>
          </div>

          <div className="pd-actions">
            <AddToCartButton onAdd={handleAdd} block />
            <button className="btn-icon" aria-label="أضف للمفضلة">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.3 4.5 6 4c2.2-.3 4 .9 6 3.3C14 4.9 15.8 3.7 18 4c3.7.5 5.5 4 4 7.7C19.5 16.4 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
          </div>

          <div className="pd-tabs">
            <div className="pd-tabs__head">
              <button className={tab === "details" ? "is-active" : ""} onClick={() => setTab("details")}>
                المواصفات
              </button>
              <button className={tab === "shipping" ? "is-active" : ""} onClick={() => setTab("shipping")}>
                الشحن والاسترجاع
              </button>
            </div>
            {tab === "details" ? (
              <ul className="pd-tabs__list">
                <li>{product.description}</li>
                <li>الألوان المتاحة: {product.colors.map((c) => c.name).join("، ")}</li>
                <li>المقاسات المتاحة: {product.sizes.join("، ")}</li>
              </ul>
            ) : (
              <ul className="pd-tabs__list">
                <li>الشحن خلال 2-5 أيام عمل داخل مصر</li>
                <li>استبدال أو استرجاع خلال 14 يوم من الاستلام</li>
                <li>المنتج لازم يكون بحالته الأصلية وبالتيكيت</li>
              </ul>
            )}
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <div className="pd-related">
          <Reveal>
            <div className="section-head">
              <h2 className="section-title">قد يعجبك أيضًا</h2>
            </div>
          </Reveal>
          <div className="product-grid">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
