import { useEffect, useMemo, useRef, useState } from "react";

import { apiDelete, apiGet, apiPost, apiPut } from "./api";

const emptyProductForm = {
  name: "",
  brand: "",
  price: "",
  stock: "",
  category: "",
  specs: "",
  imageUrl: "",
};

const emptyCategoryForm = {
  name: "",
  description: "",
};

const normalizeSpec = (value) => value.toLowerCase().replace(/\s+/g, "");

const SCREEN_TYPE_ORDER = ["OLED", "AMOLED", "LCD", "IPS", "LTPO", "P-OLED"];

const detectScreenType = (spec) => {
  const upper = spec.toUpperCase();
  if (upper.includes("AMOLED")) {
    return "AMOLED";
  }
  if (upper.includes("P-OLED")) {
    return "P-OLED";
  }
  if (upper.includes("LTPO")) {
    return "LTPO";
  }
  if (upper.includes("OLED")) {
    return "OLED";
  }
  if (upper.includes("LCD")) {
    return "LCD";
  }
  if (upper.includes("IPS")) {
    return "IPS";
  }
  return null;
};

const collectScreenTypes = (specs = []) => {
  const types = new Set();
  specs.forEach((spec) => {
    const type = detectScreenType(spec);
    if (type) {
      types.add(type);
    }
  });
  return types;
};

const formatPrice = (value) => {
  if (Number.isNaN(value)) {
    return "0.00 EUR";
  }
  return `${Number(value).toFixed(2)} EUR`;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [specFilter, setSpecFilter] = useState("all");
  const [screenFilter, setScreenFilter] = useState("all");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [profileForm, setProfileForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const catalogRef = useRef(null);
  const authRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";

  const storageOptions = useMemo(() => {
    const options = new Set();
    products.forEach((product) => {
      (product.specs || []).forEach((spec) => {
        const match = spec.match(/\b(\d+\s?GB|\d+\s?TB)\b/i);
        if (match) {
          options.add(match[1].replace(/\s+/g, "").toUpperCase());
        }
      });
    });
    return Array.from(options).sort((a, b) => {
      const toSize = (value) => {
        const numeric = Number(value.replace(/[^0-9]/g, ""));
        return value.includes("TB") ? numeric * 1024 : numeric;
      };
      return toSize(a) - toSize(b);
    });
  }, [products]);

  const screenOptions = useMemo(() => {
    const options = new Set();
    products.forEach((product) => {
      collectScreenTypes(product.specs || []).forEach((type) => {
        options.add(type);
      });
    });
    return Array.from(options).sort(
      (a, b) => SCREEN_TYPE_ORDER.indexOf(a) - SCREEN_TYPE_ORDER.indexOf(b),
    );
  }, [products]);

  const visibleProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category?._id === selectedCategory,
      );
    }
    if (specFilter !== "all") {
      const target = normalizeSpec(specFilter);
      filtered = filtered.filter((product) =>
        (product.specs || []).some((spec) =>
          normalizeSpec(spec).includes(target),
        ),
      );
    }
    if (screenFilter !== "all") {
      filtered = filtered.filter((product) =>
        collectScreenTypes(product.specs || []).has(screenFilter),
      );
    }
    return filtered;
  }, [products, selectedCategory, specFilter, screenFilter]);

  const notify = (message) => {
    setError("");
    setStatus(message);
    setTimeout(() => setStatus(""), 2500);
  };

  const fail = (message) => {
    setStatus("");
    setError(message);
    setTimeout(() => setError(""), 4000);
  };

  const loadCatalog = async () => {
    const [productsData, categoriesData] = await Promise.all([
      apiGet("/products"),
      apiGet("/categories"),
    ]);
    setProducts(productsData);
    setCategories(categoriesData);
    if (categoriesData.length && !productForm.category) {
      setProductForm((prev) => ({ ...prev, category: categoriesData[0]._id }));
    }
  };

  const loadCart = async () => {
    if (!user) {
      return;
    }
    const cartData = await apiGet("/cart");
    setCart(cartData);
  };

  const loadOrders = async () => {
    if (!user) {
      return;
    }
    const ordersData = await apiGet("/orders");
    setOrders(ordersData);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const me = await apiGet("/auth/me");
        setUser(me.user);
        await loadCatalog();
      } catch (err) {
        fail(err.message);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (user) {
      loadCart().catch((err) => fail(err.message));
      loadOrders().catch((err) => fail(err.message));
      setProfileForm({ name: user.name || "" });
    } else {
      setCart(null);
      setOrders([]);
      setProfileForm({ name: "" });
    }
  }, [user]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    try {
      if (authMode === "register") {
        await apiPost("/auth/register", authForm);
      }
      const loginData = await apiPost("/auth/login", {
        email: authForm.email,
        password: authForm.password,
      });
      setUser(loginData.user);
      setAuthForm({ name: "", email: "", password: "" });
      notify("Welcome back.");
    } catch (err) {
      fail(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await apiPost("/auth/logout", {});
      setUser(null);
      notify("Logged out.");
    } catch (err) {
      fail(err.message);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await apiPost("/cart/items", { productId, quantity: 1 });
      await loadCart();
      notify("Added to cart.");
    } catch (err) {
      fail(err.message);
    }
  };

  const handleCartQuantity = async (itemId, quantity) => {
    try {
      await apiPut(`/cart/items/${itemId}`, { quantity });
      await loadCart();
    } catch (err) {
      fail(err.message);
    }
  };

  const handleRemoveCartItem = async (itemId) => {
    try {
      await apiDelete(`/cart/items/${itemId}`);
      await loadCart();
    } catch (err) {
      fail(err.message);
    }
  };

  const handleCheckout = async () => {
    try {
      await apiPost("/orders", {});
      await loadCart();
      await loadOrders();
      notify("Order placed.");
    } catch (err) {
      fail(err.message);
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    try {
      const response = await apiPut("/auth/me", {
        name: profileForm.name,
      });
      setUser(response.user);
      notify("Profile updated.");
    } catch (err) {
      fail(err.message);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    try {
      await apiPut("/auth/password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      notify("Password updated.");
    } catch (err) {
      fail(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account? This cannot be undone.")) {
      return;
    }
    try {
      await apiDelete("/auth/me");
      setUser(null);
      notify("Account deleted.");
    } catch (err) {
      fail(err.message);
    }
  };

  const scrollToCatalog = () => {
    setSelectedCategory("all");
    setSpecFilter("all");
    setScreenFilter("all");
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToAuth = () => {
    setAuthMode("register");
    authRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        specs: productForm.specs
          .split(",")
          .map((spec) => spec.trim())
          .filter(Boolean),
      };

      if (editingProductId) {
        await apiPut(`/products/${editingProductId}`, payload);
        notify("Product updated.");
      } else {
        await apiPost("/products", payload);
        notify("Product added.");
      }

      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await loadCatalog();
    } catch (err) {
      fail(err.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || "",
      specs: product.specs?.join(", ") || "",
      imageUrl: product.imageUrl || "",
    });
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await apiDelete(`/products/${productId}`);
      notify("Product deleted.");
      await loadCatalog();
    } catch (err) {
      fail(err.message);
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: categoryForm.name,
        description: categoryForm.description,
      };
      if (editingCategoryId) {
        await apiPut(`/categories/${editingCategoryId}`, payload);
        notify("Category updated.");
      } else {
        await apiPost("/categories", payload);
        notify("Category added.");
      }
      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      await loadCatalog();
    } catch (err) {
      fail(err.message);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
    });
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await apiDelete(`/categories/${categoryId}`);
      notify("Category deleted.");
      await loadCatalog();
    } catch (err) {
      fail(err.message);
    }
  };

  const cartTotal = cart?.items?.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <header className="header">
        <div className="brand">
          <span className="brand-mark">Pulse</span>
          <span className="brand-sub">Mobile Webshop</span>
        </div>
        <div className="header-actions">
          <span className="chip">Guest ready</span>
          {user ? (
            <div className="user-pill">
              <span>{user.name}</span>
              <span className="role">{user.role}</span>
              <button className="ghost" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="user-pill">
              <span>Sign in to buy</span>
            </div>
          )}
        </div>
      </header>

      {status && <div className="toast">{status}</div>}
      {error && <div className="toast error">{error}</div>}

      <section className="hero">
        <div className="hero-text">
          <p className="hero-tag">New drop 2026</p>
          <h1>Phones that feel like tomorrow.</h1>
          <p className="hero-copy">
            Explore curated mobile devices with bold specs. Guests can browse,
            registered shoppers can build a cart and place orders, and admins
            can manage the whole catalog.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={scrollToCatalog}>
              Browse catalog
            </button>
            <button className="secondary" onClick={scrollToAuth}>
              Create account
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <strong>8</strong>
              <span>Demo products</span>
            </div>
            <div>
              <strong>5</strong>
              <span>Collections</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Session auth</span>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top">
            <span>Flagship highlight</span>
            <span className="accent">Aurora X1</span>
          </div>
          <div className="hero-card-body">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="phone-dot" />
                <div className="phone-info">
                  <p>OLED 6.7</p>
                  <p>512 GB</p>
                  <p>Triple cam</p>
                </div>
              </div>
            </div>
            <div className="hero-card-meta">
              <p>
                Ultra smooth glass, pro grade optics, and a frame built for
                speed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="products-section scroll-target" ref={catalogRef}>
          <div className="section-head">
            <div>
              <h2>Catalog</h2>
              <p>Filter by collection to explore your next device.</p>
            </div>
            <div className="filters">
              <button
                className={
                  selectedCategory === "all" ? "filter active" : "filter"
                }
                onClick={() => setSelectedCategory("all")}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  className={
                    selectedCategory === category._id
                      ? "filter active"
                      : "filter"
                  }
                  onClick={() => setSelectedCategory(category._id)}
                >
                  {category.name}
                </button>
              ))}
              {storageOptions.length > 0 && (
                <label className="storage-filter">
                  <span>Storage</span>
                  <select
                    value={specFilter}
                    onChange={(event) => setSpecFilter(event.target.value)}
                  >
                    <option value="all">All</option>
                    {storageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {screenOptions.length > 0 && (
                <label className="screen-filter">
                  <span>Screen</span>
                  <select
                    value={screenFilter}
                    onChange={(event) => setScreenFilter(event.target.value)}
                  >
                    <option value="all">All</option>
                    {screenOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>

          <div className="product-grid">
            {visibleProducts.map((product, index) => (
              <div
                key={product._id}
                className="product-card"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div
                  className="product-image"
                  style={{ backgroundImage: `url(${product.imageUrl || ""})` }}
                />
                <div className="product-body">
                  <div>
                    <h3>{product.name}</h3>
                    <p className="muted">{product.brand}</p>
                  </div>
                  <div className="price-row">
                    <span>{formatPrice(product.price)}</span>
                    <span className="stock">Stock {product.stock}</span>
                  </div>
                  <div className="specs">
                    {product.specs?.slice(0, 3).map((spec) => (
                      <span key={spec}>{spec}</span>
                    ))}
                  </div>
                  <div className="product-footer">
                    <span className="pill">{product.category?.name || ""}</span>
                    {isCustomer ? (
                      <button
                        className="primary"
                        onClick={() => handleAddToCart(product._id)}
                      >
                        Add to cart
                      </button>
                    ) : (
                      <span className="muted">Login to buy</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="side-panels">
          {isAdmin && (
            <div className="panel admin">
              <div className="panel-head">
                <h3>Admin Studio</h3>
                <span className="chip">CRUD</span>
              </div>
              <form className="panel-body" onSubmit={handleProductSubmit}>
                <label>
                  Product name
                  <input
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Brand
                  <input
                    value={productForm.brand}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        brand: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <div className="grid-two">
                  <label>
                    Price
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm((prev) => ({
                          ...prev,
                          price: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Stock
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(event) =>
                        setProductForm((prev) => ({
                          ...prev,
                          stock: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                </div>
                <label>
                  Category
                  <select
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Specs (comma separated)
                  <input
                    value={productForm.specs}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        specs: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Image URL
                  <input
                    value={productForm.imageUrl}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        imageUrl: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="panel-actions">
                  <button className="primary" type="submit">
                    {editingProductId ? "Update product" : "Add product"}
                  </button>
                  {editingProductId && (
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm(emptyProductForm);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="admin-list">
                  {products.map((product) => (
                    <div key={product._id} className="admin-row">
                      <div className="admin-meta">
                        <strong>{product.name}</strong>
                        <span className="muted">{product.category?.name}</span>
                      </div>
                      <div className="row-actions">
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </form>

              <form className="panel-body" onSubmit={handleCategorySubmit}>
                <h4>Categories</h4>
                <label>
                  Name
                  <input
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Description
                  <input
                    value={categoryForm.description}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="panel-actions">
                  <button className="primary" type="submit">
                    {editingCategoryId ? "Update category" : "Add category"}
                  </button>
                  {editingCategoryId && (
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setCategoryForm(emptyCategoryForm);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="admin-list">
                  {categories.map((category) => (
                    <div key={category._id} className="admin-row">
                      <div className="admin-meta">
                        <strong>{category.name}</strong>
                        <span className="muted">
                          {category.description || ""}
                        </span>
                      </div>
                      <div className="row-actions">
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => handleEditCategory(category)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          )}

          <div className="panel auth scroll-target" ref={authRef}>
            <div className="panel-head">
              <h3>{user ? "Session" : "Account"}</h3>
              <span className="chip">Session auth</span>
            </div>
            {user ? (
              <div className="panel-body">
                <p className="muted">You are signed in as {user.email}.</p>
                <div className="panel-actions">
                  <button className="ghost" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <form className="panel-body" onSubmit={handleAuthSubmit}>
                {authMode === "register" && (
                  <label>
                    Name
                    <input
                      value={authForm.name}
                      onChange={(event) =>
                        setAuthForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Your name"
                      required
                    />
                  </label>
                )}
                <label>
                  Email
                  <input
                    value={authForm.email}
                    onChange={(event) =>
                      setAuthForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(event) =>
                      setAuthForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Min 6 chars"
                    required
                  />
                </label>
                <button className="primary" type="submit">
                  {authMode === "register" ? "Register and login" : "Login"}
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    setAuthMode(authMode === "login" ? "register" : "login")
                  }
                >
                  {authMode === "login" ? "Need an account?" : "Back to login"}
                </button>
                <p className="muted small">
                  Demo buyer: demo@phone-shop.test / Demo123!
                </p>
              </form>
            )}
          </div>

          <div className="panel cart">
            <div className="panel-head">
              <h3>Cart</h3>
              <span className="chip">Customer only</span>
            </div>
            {isCustomer ? (
              <div className="panel-body">
                {cart?.items?.length ? (
                  <div className="cart-items">
                    {cart.items.map((item) => (
                      <div key={item._id} className="cart-item">
                        <div>
                          <strong>{item.product?.name || ""}</strong>
                          <span className="muted">
                            {formatPrice(item.product?.price || 0)}
                          </span>
                        </div>
                        <div className="cart-controls">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              handleCartQuantity(
                                item._id,
                                Number(event.target.value),
                              )
                            }
                          />
                          <button
                            className="ghost"
                            onClick={() => handleRemoveCartItem(item._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="cart-total">
                      <span>Total</span>
                      <strong>{formatPrice(cartTotal)}</strong>
                    </div>
                    <button className="primary" onClick={handleCheckout}>
                      Checkout
                    </button>
                  </div>
                ) : (
                  <p className="muted">
                    Your cart is empty. Add a product to start.
                  </p>
                )}
              </div>
            ) : (
              <div className="panel-body">
                <p className="muted">
                  Sign in as a customer to use the cart and checkout.
                </p>
              </div>
            )}
          </div>

          {user && (
            <div className="panel orders">
              <div className="panel-head">
                <h3>Orders</h3>
                <span className="chip">{isAdmin ? "Admin" : "Customer"}</span>
              </div>
              <div className="panel-body">
                {orders.length ? (
                  <div className="order-list">
                    {orders.slice(0, 4).map((order) => (
                      <div key={order._id} className="order-item">
                        <div className="order-meta">
                          <strong>#{order._id.slice(-6)}</strong>
                          <span className="muted">
                            {order.items.length} items
                          </span>
                        </div>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No orders yet.</p>
                )}
              </div>
            </div>
          )}

          {user && (
            <div className="panel profile">
              <div className="panel-head">
                <h3>Profile</h3>
                <span className="chip">Account</span>
              </div>
              <form className="panel-body" onSubmit={handleProfileUpdate}>
                <label>
                  Name
                  <input
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm({ name: event.target.value })
                    }
                    required
                  />
                </label>
                <button className="primary" type="submit">
                  Update name
                </button>
              </form>
              <form className="panel-body" onSubmit={handlePasswordChange}>
                <label>
                  Current password
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  New password
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <button className="primary" type="submit">
                  Change password
                </button>
              </form>
              <div className="panel-body">
                <button
                  className="danger"
                  type="button"
                  onClick={handleDeleteAccount}
                >
                  Delete account
                </button>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default App;
