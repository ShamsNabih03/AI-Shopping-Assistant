import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const res = await fetch(`${API}/auth/login`, { method: "POST", body: form });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Login failed"); }
    const { access_token } = await res.json();
    localStorage.setItem("token", access_token);
    const meRes = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${access_token}` } });
    setUser(await meRes.json());
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Registration failed"); }
    await login(email, password);
  };

  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }