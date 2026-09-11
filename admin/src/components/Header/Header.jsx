import { useTheme } from "../../context/ThemeContext";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./header.css";

export default function Header({ title, subtitle, onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { session, logout } = useAdminAuth();

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button className="btn-icon admin-header__burger" onClick={onMenuClick} aria-label="فتح القائمة">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div>
          <h2 className="admin-header__title">{title}</h2>
          {subtitle && <p className="admin-header__subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="admin-header__actions">
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
                <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </button>

        <div className="admin-header__profile">
          <div className="admin-header__avatar">{session?.email?.[0]?.toUpperCase() || "A"}</div>
          <div className="admin-header__who">
            <strong>{session?.email || "Admin"}</strong>
            <span>مدير المتجر</span>
          </div>
        </div>

        <button className="btn btn-outline btn-sm" onClick={logout}>
          خروج
        </button>
      </div>
    </header>
  );
}
