import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ProductImage from "../../components/ProductCard/ProductImage";
import Reveal from "../../components/Reveal/Reveal";
import DiscountCodeField from "../../components/DiscountCodeField/DiscountCodeField";
import SEO from "../../components/SEO/SEO";
import { formatPrice } from "../../utils/format";
import "./cart.css";

export default function Cart() {
  const { items, updateQty, removeItem, totals } = useCart();
  const [discount, setDiscount] = useState(null); // { code, ownerName, discountAmount } | null

  if (items.length === 0) {
    return (
      <section className="section container cart-empty">
        <SEO title="سلة المشتريات" path="/cart" noindex />
        <Reveal>
          <p className="eyebrow">سلة المشتريات</p>
          <h1 className="section-title" style={{ marginBottom: 16 }}>
            سلتك فارغة
          </h1>
          <p style={{ color: "var(--text-mid)", marginBottom: 28 }}>
            لسه مافيش حاجة هنا. تصفح المنتجات وابدأ تجهّز أول أوردر.
          </p>
          <Link to="/products" className="btn btn-primary">تصفح المنتجات</Link>
        </Reveal>
      </section>
    );
  }

  const discountAmount = Math.min(discount?.discountAmount || 0, totals.subtotal);
  const finalTotal = totals.subtotal - discountAmount;

  return (
    <section className="section container">
      <SEO title="سلة المشتريات" path="/cart" noindex />
      <Reveal>
        <p className="eyebrow">سلة المشتريات</p>
        <h1 className="section-title" style={{ marginBottom: 32 }}>
          سلتك ({totals.count})
        </h1>
      </Reveal>

      <div className="cart-page">
        <Reveal className="cart-page__list" delay={0.05}>
          {items.map((item) => (
            <div className="cart-row" key={`${item.productId}-${item.color}-${item.size}`}>
              <div className="cart-row__img">
                <ProductImage product={{ category: item.category, colors: [{ hex: "#333" }] }} colorHex="#8a8a82" />
              </div>
              <div className="cart-row__info">
                <p className="cart-row__name">{item.name}</p>
                <p className="cart-row__meta">اللون: {item.color} · المقاس: {item.size}</p>
                <button className="cart-row__remove" onClick={() => removeItem(item)}>إزالة</button>
              </div>
              <div className="qty-stepper">
                <button onClick={() => updateQty(item, item.qty - 1)} aria-label="تقليل">−</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item, item.qty + 1)} aria-label="زيادة">+</button>
              </div>
              <p className="cart-row__price">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="cart-summary">
          <h3>ملخص الطلب</h3>
          <div className="cart-summary__row">
            <span>المجموع الفرعي</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="cart-summary__row" style={{ color: "var(--accent)" }}>
              <span>خصم كود {discount.code}</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="cart-summary__row">
            <span>الشحن</span>
            <span>يُحسب عند الدفع</span>
          </div>
          <hr className="divider" />
          <div className="cart-summary__row cart-summary__row--total">
            <span>الإجمالي</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>

          <DiscountCodeField onChange={setDiscount} subtotal={totals.subtotal} />

          <Link to="/checkout" className="btn btn-primary btn-block">إتمام الطلب</Link>
          <Link to="/products" className="btn btn-outline btn-block">متابعة التسوق</Link>
        </Reveal>
      </div>
    </section>
  );
}
