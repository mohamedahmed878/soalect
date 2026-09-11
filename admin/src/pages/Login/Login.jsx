import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import GoogleButton from "../../components/GoogleButton/GoogleButton";
import "./login.css";

export default function Login() {
  const { login, loginWithGoogle, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGoogle(credential) {
    setError(null);
    try {
      await loginWithGoogle(credential);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__logo">
          SOOLECT<span>ADMIN</span>
        </div>
        <h1>تسجيل دخول لوحة التحكم</h1>
        <p className="admin-login__sub">
          سجّل دخولك بحساب الأدمن بتاعك. الدخول بجوجل شغال بس مع حسابات عندها
          صلاحية أدمن بالفعل — مش هيعمل حساب جديد.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@soolect.com"
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
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <GoogleButton onCredential={handleGoogle} />
      </div>
    </div>
  );
}
