import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Reveal from "../../components/Reveal/Reveal";
import GoogleButton from "../../components/GoogleButton/GoogleButton";
import SEO from "../../components/SEO/SEO";
import "./auth.css";

export default function Login() {
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(form);
      navigate(location.state?.from || "/account");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGoogle(credential) {
    setError(null);
    try {
      await loginWithGoogle(credential);
      navigate(location.state?.from || "/account");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="section container auth-page">
      <SEO title="تسجيل الدخول" path="/login" noindex />
      <Reveal className="auth-card">
        <p className="eyebrow">أهلًا بيك تاني</p>
        <h1 className="auth-title">تسجيل الدخول</h1>
        <p className="auth-sub">سجّل دخولك عشان تتابع طلباتك وتكمل تسوقك بسرعة.</p>

        <form onSubmit={handleSubmit} noValidate>
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="field-error" style={{ marginBottom: 14 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <GoogleButton onCredential={handleGoogle} />

        <p className="auth-switch">
          لسه معندكش حساب؟ <Link to="/register">إنشاء حساب جديد</Link>
        </p>
      </Reveal>
    </section>
  );
}
