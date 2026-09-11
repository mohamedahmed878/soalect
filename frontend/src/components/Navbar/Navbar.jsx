import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./navbar.css";

const LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المنتجات" },
  { to: "/about", label: "من نحن" },
  { to: "/affiliate", label: "تسويق بعمولة" },
];

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";

export default function Navbar() {
  const { totals, openCart } = useCart();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // The cart panel is only meaningful once something has been added —
  // with an empty cart, the icon just routes to browsing instead.
  function handleCartClick() {
    if (totals.count > 0) {
      openCart();
    } else {
      navigate("/products");
    }
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        <button
          className="navbar__burger"
          aria-label="فتح القائمة"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link to="/" className="navbar__logo">
          SOOLECT
        </Link>

        <nav className="navbar__links">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar__link ${isActive ? "is-active" : ""}`}
              end={link.to === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          {user?.role === "admin" && (
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar__admin-link"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              <span className="navbar__admin-link-text">لوحة التحكم</span>
            </a>
          )}

          <button
            type="button"
            className="theme-toggle"
            data-on={theme === "light"}
            role="switch"
            aria-checked={theme === "light"}
            aria-label="تبديل الوضع النهاري"
            onClick={toggleTheme}
          >
            <span className="theme-toggle__thumb">
              {theme === "light" ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>

          <Link to="/account" className="btn-icon" aria-label="حسابي">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 20c1.6-4 5-6 8-6s6.4 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>

          <button className="btn-icon navbar__cart" aria-label="سلة المشتريات" onClick={handleCartClick}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 8h12l-1.2 11.5a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" />
            </svg>
            {/* Badge only renders once the cart actually has items */}
            {totals.count > 0 && <span className="navbar__cart-badge">{totals.count}</span>}
          </button>
        </div>
      </div>

      <div className={`navbar__mobile ${menuOpen ? "is-open" : ""}`}>
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
        <NavLink to={user ? "/account" : "/login"} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
          {user ? "حسابي" : "تسجيل الدخول"}
        </NavLink>
        {user?.role === "admin" && (
          <a
            href={ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__mobile-link"
            style={{ color: "var(--accent)" }}
          >
            لوحة التحكم
          </a>
        )}
      </div>
    </header>
  );
}
