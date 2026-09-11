import { ICONS_BY_CATEGORY } from "../../assets/icons/garments";
import "./productImage.css";

/**
 * Product visual: shows the real uploaded photo (product.images[0]) once
 * the admin has uploaded one. Falls back to a stylized garment line-icon
 * (tinted by the selected color) for products that don't have a photo yet.
 */
export default function ProductImage({ product, colorHex, className = "" }) {
  const Icon = ICONS_BY_CATEGORY[product.category];
  const tone = colorHex || product.colors[0]?.hex || "#222";
  const photo = product.images?.[0];

  if (photo) {
    return (
      <div className={`product-image product-image--photo ${className}`}>
        <img src={photo} alt={product.name} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`product-image ${className}`} style={{ "--tone": tone }}>
      <div className="product-image__glow" />
      {Icon && <Icon className="product-image__icon" />}
    </div>
  );
}
