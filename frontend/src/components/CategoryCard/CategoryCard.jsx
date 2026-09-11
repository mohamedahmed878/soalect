import { Link } from "react-router-dom";
import { ICONS_BY_CATEGORY } from "../../assets/icons/garments";
import "./categoryCard.css";

export default function CategoryCard({ category }) {
  const Icon = ICONS_BY_CATEGORY[category.slug];
  return (
    <Link to={`/products?category=${category.slug}`} className="category-card">
      <Icon className="category-card__icon" />
      <div className="category-card__label">
        <h3>{category.name}</h3>
        <span className="link-arrow">تسوق الآن</span>
      </div>
    </Link>
  );
}
