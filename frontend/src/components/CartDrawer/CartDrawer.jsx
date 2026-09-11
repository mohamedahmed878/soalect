import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ProductImage from "../ProductCard/ProductImage";
import { formatPrice } from "../../utils/format";
import "./cartDrawer.css";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, totals } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-drawer__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            role="dialog"
            aria-label="سلة المشتريات"
          >
            <div className="cart-drawer__head">
              <h3>سلة مشترياتك {totals.count > 0 && `(${totals.count})`}</h3>
              <button className="btn-icon" onClick={closeCart} aria-label="إغلاق">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="cart-drawer__empty">
                <p>سلتك فارغة لسه.</p>
                <Link to="/products" className="btn btn-primary" onClick={closeCart}>
                  ابدأ التسوق
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-drawer__list">
                  {items.map((item) => (
                    <div className="cart-line" key={`${item.productId}-${item.color}-${item.size}`}>
                      <div className="cart-line__img">
                        <ProductImage
                          product={{ category: item.category, colors: [{ hex: "#333" }] }}
                          colorHex="#8a8a82"
                        />
                      </div>
                      <div className="cart-line__info">
                        <p className="cart-line__name">{item.name}</p>
                        <p className="cart-line__meta">
                          اللون: {item.color} · المقاس: {item.size}
                        </p>
                        <div className="cart-line__row">
                          <div className="qty-stepper qty-stepper--sm">
                            <button onClick={() => updateQty(item, item.qty - 1)} aria-label="تقليل">
                              −
                            </button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateQty(item, item.qty + 1)} aria-label="زيادة">
                              +
                            </button>
                          </div>
                          <button className="cart-line__remove" onClick={() => removeItem(item)}>
                            إزالة
                          </button>
                        </div>
                      </div>
                      <p className="cart-line__price">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>

                <div className="cart-drawer__footer">
                  <div className="cart-drawer__total">
                    <span>الإجمالي</span>
                    <strong>{formatPrice(totals.subtotal)}</strong>
                  </div>
                  <Link to="/checkout" className="btn btn-primary btn-block" onClick={closeCart}>
                    إتمام الطلب
                  </Link>
                  <Link to="/products" className="btn btn-outline btn-block" onClick={closeCart}>
                    متابعة التسوق
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
