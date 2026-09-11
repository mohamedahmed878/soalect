import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Reveal from "../../components/Reveal/Reveal";
import GoogleButton from "../../components/GoogleButton/GoogleButton";
import SEO from "../../components/SEO/SEO";
import { isStrongPassword } from "../../utils/validators";
import "../Login/auth.css";

export default function Register() {
  const { register, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!isStrongPassword(form.password)) {
      setError("كلمة المرور لازم تكون 8 حروف على الأقل وتحتوي على حرف ورقم");
      return;
    }

    try {
      await register(form);
      navigate("/account");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGoogle(credential) {
    setError(null);
    try {
      await loginWithGoogle(credential);
      navigate("/account");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="section container auth-page">
      <SEO title="إنشاء حساب" path="/register" noindex />
      <Reveal className="auth-card">
        <p className="eyebrow">انضم لينا</p>
        <h1 className="auth-title">إنشاء حساب</h1>
        <p className="auth-sub">اعمل حساب جديد عشان تتابع طلباتك وتحصل على عروض حصرية.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>الاسم الكامل</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="مثال: سارة أحمد"
              required
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="example@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="8 حروف على الأقل، حرف ورقم"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          {error && <p className="field-error" style={{ marginBottom: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>

        <GoogleButton onCredential={handleGoogle} />

        <p className="auth-switch">
          عندك حساب بالفعل؟ <Link to="/login" state={{ from: location.state?.from }}>تسجيل الدخول</Link>
        </p>
      </Reveal>
    </section>
  );
}
