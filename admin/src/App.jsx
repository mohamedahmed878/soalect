import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Orders from "./pages/Orders/Orders";
import Users from "./pages/Users/Users";
import Marketers from "./pages/Marketers/Marketers";
import Reviews from "./pages/Reviews/Reviews";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Login/Login";
import { useAdminAuth } from "./context/AdminAuthContext";

const TITLES = {
  "/": { title: "الرئيسية", subtitle: "نظرة عامة على المتجر" },
  "/products": { title: "المنتجات", subtitle: "إدارة كتالوج المنتجات" },
  "/orders": { title: "الطلبات", subtitle: "تتبع وإدارة الطلبات" },
  "/users": { title: "العملاء", subtitle: "قائمة عملاء المتجر" },
  "/marketers": { title: "المسوقين", subtitle: "برنامج التسويق بعمولة" },
  "/reviews": { title: "آراء العملاء", subtitle: "تقييمات وريفيوهات العملاء على الصفحة الرئيسية" },
  "/reports": { title: "التقارير والتحليلات", subtitle: "أداء المتجر والمبيعات" },
  "/settings": { title: "الإعدادات", subtitle: "الصورة الرئيسية للموقع" },
};

function ProtectedLayout() {
  const { session } = useAdminAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const meta = TITLES[location.pathname] || { title: "لوحة التحكم" };

  return (
    <div className="admin-shell">
      <Sidebar className={menuOpen ? "is-open" : ""} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="admin-shell__backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="admin-main">
        <Header title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setMenuOpen((v) => !v)} />
        <div className="admin-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/marketers" element={<Marketers />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
