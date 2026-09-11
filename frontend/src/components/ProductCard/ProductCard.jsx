import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductImage from "./ProductImage";
import SwingTag from "../SwingTag/SwingTag";
import { formatPrice } from "../../utils/format";
import "./productCard.css";

export default function ProductCard({ product }) {
  const [activeColor, setActiveColor] = useState(product.colors[0]);
  const [liked, setLiked] = useState(false);

  return (
    <motion.article
      className="product-card"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Link to={`/products/${product.slug}`} className="product-card__media">
        <ProductImage product={product} colorHex={activeColor.hex} />

        {product.isNew && (
          <SwingTag className="product-card__tag">جديد</SwingTag>
        )}

        <button
          className={`product-card__like ${liked ? "is-liked" : ""}`}
          aria-label="أضف للمفضلة"
          onClick={(e) => {
            e.preventDefault();
            setLiked((v) => !v);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"}>
            <path
              d="M12 21s-7.5-4.6-10-9.3C.5 8 2.3 4.5 6 4c2.2-.3 4 .9 6 3.3C14 4.9 15.8 3.7 18 4c3.7.5 5.5 4 4 7.7C19.5 16.4 12 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </Link>

      <div className="product-card__body">
        <Link to={`/products/${product.slug}`} className="product-card__name">
          {product.nameEn}
        </Link>
        <p className="product-card__price">{formatPrice(product.price)}</p>

        <div className="product-card__colors">
          {product.colors.map((color) => (
            <button
              key={color.name}
              className={`swatch ${activeColor.name === color.name ? "is-active" : ""}`}
              style={{ "--swatch": color.hex }}
              aria-label={color.name}
              onClick={(e) => {
                e.preventDefault();
                setActiveColor(color);
              }}
            />
          ))}
        </div>
      </div>
    </motion.article>
  );
}
