import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";

const API = "http://127.0.0.1:8000";

function SkeletonCard() {
  return (
    <div className="card skeleton">
      <div className="skeleton-img" />
      <div className="card-body">
        <div className="skeleton-line long" />
        <div className="skeleton-line short" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const initials = product.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="card">
      <div className="card-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="card-img-placeholder">{initials}</div>
        )}
      </div>
      <div className="card-body">
        <span className="badge">{product.category}</span>
        <h3 className="card-title">{product.name}</h3>
        {product.description && (
          <p className="card-desc">{product.description}</p>
        )}
        <div className="card-footer">
          <span className="price">${Number(product.price).toFixed(2)}</span>
          <button className="btn-primary">View</button>
        </div>
      </div>
    </div>
  );
}

function AddProductModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "", price: "", category: "", description: "", image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      setError("Name, price and category are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      if (!res.ok) throw new Error("Server error");
      onAdded(await res.json());
      onClose();
    } catch {
      setError("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add product</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-grid">
          {[
            { label: "Product name *", name: "name", placeholder: "e.g. Wireless Headphones" },
            { label: "Price ($) *", name: "price", placeholder: "e.g. 49.99", type: "number" },
            { label: "Category *", name: "category", placeholder: "e.g. Electronics" },
            { label: "Description", name: "description", placeholder: "Short description..." },
            { label: "Image URL", name: "image_url", placeholder: "https://..." },
          ].map(({ label, name, placeholder, type }) => (
            <div className="form-field" key={name}>
              <label>{label}</label>
              <input
                type={type || "text"}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (activeCategory) params.append("category", activeCategory);
      const res = await fetch(`${API}/products?${params}`);
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      setError("Could not reach the backend. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/products/categories`);
      if (res.ok) setCategories(await res.json());
    } catch {}
  };

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  useEffect(() => { fetchCategories(); }, [products]);

  if (authLoading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
        <p style={{ color:"#6b6960" }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🛍</span>
            <span className="logo-text">ShopAI</span>
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="header-right">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add product
            </button>
            <div className="user-menu">
              <span className="user-name">👋 {user.name}</span>
              <button className="btn-ghost" onClick={logout}>Sign out</button>
            </div>
          </div>
        </div>
      </header>

      {categories.length > 0 && (
        <div className="filter-bar">
          <button className={`pill ${activeCategory === "" ? "active" : ""}`} onClick={() => setActiveCategory("")}>All</button>
          {categories.map((cat) => (
            <button key={cat} className={`pill ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>
      )}

      <main className="main">
        {error && <div className="error-banner"><span>⚠️</span><span>{error}</span></div>}

        {!loading && !error && (
          <p className="stats">
            {products.length === 0 ? "No products found"
              : `${products.length} product${products.length !== 1 ? "s" : ""}${activeCategory ? ` in ${activeCategory}` : ""}${search ? ` matching "${search}"` : ""}`}
          </p>
        )}

        <div className="grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {!loading && !error && products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products yet</h3>
            <p>{search || activeCategory ? "Try a different search or category." : "Click \"+ Add product\" to add your first product."}</p>
            {!search && !activeCategory && (
              <button className="btn-primary" onClick={() => setShowModal(true)}>Add your first product</button>
            )}
          </div>
        )}
      </main>

      {showModal && (
        <AddProductModal onClose={() => setShowModal(false)} onAdded={(p) => setProducts((prev) => [p, ...prev])} />
      )}
    </div>
  );
}