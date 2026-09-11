import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../../components/ProductCard/ProductCard";
import Reveal from "../../components/Reveal/Reveal";
import SEO from "../../components/SEO/SEO";
import { ProductGridSkeleton } from "../../components/Loading/Loading";
import { CATEGORIES } from "../../data/categories";
import { api } from "../../services/api";
import "./products.css";

const SORTS = [
  { value: "featured", label: "الأكثر تميزًا" },
  { value: "price-asc", label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState(null);

  useEffect(() => {
    setProducts(null);
    api.getProducts({ category: activeCategory }).then(setProducts);
  }, [activeCategory]);

  const sorted = useMemo(() => {
    if (!products) return null;
    const list = [...products];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sort]);

  function setCategory(slug) {
    if (slug === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  }

  return (
    <section className="section container">
      <SEO
        title="المنتجات"
        description="تسوق تشكيلة SOOLECT الكاملة: تيشيرتات، هوديز، بناطيل كارجو، وإكسسوارات ستريت وير."
        path="/products"
      />
      <Reveal>
        <p className="eyebrow">كل المنتجات</p>
        <div className="products-head">
          <h1 className="section-title">المنتجات</h1>

          <select className="products-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="products-filters">
          <button
            className={`filter-pill ${activeCategory === "all" ? "is-active" : ""}`}
            onClick={() => setCategory("all")}
          >
            الكل
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              className={`filter-pill ${activeCategory === cat.slug ? "is-active" : ""}`}
              onClick={() => setCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </Reveal>

      {!sorted ? (
        <ProductGridSkeleton count={8} />
      ) : sorted.length === 0 ? (
        <p className="products-empty">مفيش منتجات في الفئة دي حاليًا.</p>
      ) : (
        <div className="product-grid">
          {sorted.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
