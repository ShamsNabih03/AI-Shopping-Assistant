import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (mode === "register" && !form.name) { setError("Name is required."); return; }
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🛍</span>
          <span className="auth-logo-text">ShopAI</span>
        </div>
        <h1 className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="auth-subtitle">{mode === "login" ? "Sign in to your account to continue" : "Sign up to start shopping"}</p>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-form">
          {mode === "register" && (
            <div className="auth-field">
              <label>Full name</label>
              <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </div>
        <p className="auth-switch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button className="auth-switch-btn" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setForm({ name: "", email: "", password: "" }); }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}