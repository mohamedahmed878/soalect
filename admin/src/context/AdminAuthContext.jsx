import { createContext, useContext, useState } from "react";
import { adminApi } from "../services/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => adminApi.getSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function login(credentials) {
    setLoading(true);
    setError(null);
    try {
      const s = await adminApi.login(credentials);
      setSession(s);
      return s;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(credential) {
    setLoading(true);
    setError(null);
    try {
      const s = await adminApi.googleLogin(credential);
      setSession(s);
      return s;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await adminApi.logout();
    setSession(null);
  }

  return (
    <AdminAuthContext.Provider value={{ session, loading, error, login, loginWithGoogle, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
