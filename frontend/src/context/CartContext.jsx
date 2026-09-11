import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "soolect_cart";

function readInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lineKey(item) {
  return `${item.productId}__${item.color}__${item.size}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readInitialCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product, { color, size, qty = 1 }) {
    setItems((prev) => {
      const incoming = {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        category: product.category,
        color,
        size,
        qty,
      };
      const key = lineKey(incoming);
      const existing = prev.find((it) => lineKey(it) === key);
      if (existing) {
        return prev.map((it) => (lineKey(it) === key ? { ...it, qty: it.qty + qty } : it));
      }
      return [...prev, incoming];
    });
    // Cart only becomes visible once something is actually added —
    // per spec, it should stay hidden until the first add-to-cart.
    setIsOpen(true);
  }

  function updateQty(item, qty) {
    if (qty < 1) return;
    setItems((prev) => prev.map((it) => (lineKey(it) === lineKey(item) ? { ...it, qty } : it)));
  }

  function removeItem(item) {
    setItems((prev) => prev.filter((it) => lineKey(it) !== lineKey(item)));
  }

  function clearCart() {
    setItems([]);
  }

  const totals = useMemo(() => {
    const count = items.reduce((sum, it) => sum + it.qty, 0);
    const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
    return { count, subtotal };
  }, [items]);

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    totals,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
