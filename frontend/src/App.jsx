import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

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

const groupReviewsByProduct = (reviews = []) =>
  reviews.reduce((groups, review) => {
    const productId = review.product;
    if (!groups[productId]) {
      groups[productId] = [];
    }
    groups[productId].push(review);
    return groups;
  }, {});

const ShopPage = ({ focus = "shop" }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
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
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [selectedReviewProductId, setSelectedReviewProductId] = useState(null);

  const catalogRef = useRef(null);
  const authRef = useRef(null);
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";
  const canBuy = isCustomer || isAdmin;

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

  const reviewsByProduct = useMemo(() => groupReviewsByProduct(reviews), [reviews]);

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

  const updateFilterWithoutScrollJump = (updateFn) => {
    const currentScrollY = window.scrollY;
    updateFn();
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: "auto" });
    });
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

  const loadReviews = async () => {
    const reviewsData = await apiGet("/reviews");
    setReviews(reviewsData);
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
        setAuthMode("login");
        await loadCatalog();
        await loadReviews();
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
      setAuthMode("login");
    }
  }, [user]);

  useEffect(() => {
    if (focus === "auth") {
      setAuthMode("login");
      setTimeout(() => {
        authRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } else {
      setTimeout(() => {
        catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [focus]);

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
      setAuthMode("login");
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
      await loadCatalog();
      notify("Order placed.");
    } catch (err) {
      fail(err.message);
    }
  };

  const handleReviewSubmit = async (productId) => {
    try {
      const draft = reviewDrafts[productId] || { rating: "5", comment: "" };
      await apiPost("/reviews", {
        productId,
        rating: Number(draft.rating),
        comment: draft.comment,
      });
      setReviewDrafts((prev) => ({
        ...prev,
        [productId]: { rating: "5", comment: "" },
      }));
      await loadReviews();
      notify("Review posted.");
    } catch (err) {
      fail(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await apiDelete(`/reviews/${reviewId}`);
      await loadReviews();
      notify("Review deleted.");
    } catch (err) {
      fail(err.message);
    }
  };

  const openProductReviews = (productId) => {
    setSelectedReviewProductId(productId);
  };

  const selectedReviewProduct = products.find(
    (product) => product._id === selectedReviewProductId,
  );

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
    navigate("/shop");
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToAuth = () => {
    setAuthMode("register");
    navigate("/auth");
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

      if (editingProductId && editingProductId !== "new") {
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
      if (editingCategoryId && editingCategoryId !== "new") {
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
          <div className="header-switcher">
            <button className="ghost" type="button" onClick={() => navigate("/shop")}>
              Shop
            </button>
            <button className="ghost" type="button" onClick={() => navigate("/auth")}>
              Auth
            </button>
          </div>
          {/* <span className="chip">Guest ready</span> */}
          {/* Remove admin dashboard button, only show Shop if needed */}
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
              <span className="linkHover" onClick={scrollToAuth}>
                Sign in to buy
              </span>
            </div>
          )}
        </div>
      </header>

      {status && <div className="toast">{status}</div>}
      {error && <div className="toast error">{error}</div>}

        {/* Catalog/shop view for all users, with admin inline editing and add buttons */}
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
                {!user && (
                  <button className="secondary" onClick={scrollToAuth}>
                    Create account
                  </button>
                )}
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
                      type="button"
                      className={
                        selectedCategory === "all" ? "filter active" : "filter"
                      }
                      onClick={() =>
                        updateFilterWithoutScrollJump(() => setSelectedCategory("all"))
                      }
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        type="button"
                        key={category._id}
                        className={
                          selectedCategory === category._id
                            ? "filter active"
                            : "filter"
                        }
                        onClick={() =>
                          updateFilterWithoutScrollJump(() =>
                            setSelectedCategory(category._id),
                          )
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                    {storageOptions.length > 0 && (
                      <label className="storage-filter">
                        <span>Storage</span>
                        <select
                          value={specFilter}
                          onChange={(event) =>
                            updateFilterWithoutScrollJump(() =>
                              setSpecFilter(event.target.value),
                            )
                          }
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
                          onChange={(event) =>
                            updateFilterWithoutScrollJump(() =>
                              setScreenFilter(event.target.value),
                            )
                          }
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
                  {/* Add product button - always first, styled as panel */}
                  {isAdmin && editingProductId !== "new" && (
                    <div
                      className="product-card add-product-card"
                      onClick={() => {
                        setEditingProductId("new");
                        setProductForm(emptyProductForm);
                      }}
                    >
                      + Add Product
                    </div>
                  )}
                  {/* Inline add form for new product - always at the top */}
                  {isAdmin && editingProductId === "new" && (
                    <form
                      key="new-product"
                      className="product-card editing"
                      style={{ animationDelay: `0ms` }}
                      onSubmit={e => {
                        e.preventDefault();
                        if (!productForm.category || productForm.category === "new") {
                          fail("Please select a valid category.");
                          return;
                        }
                        handleProductSubmit(e);
                      }}
                    >
                      <div className="product-image" style={{ backgroundImage: `url(${productForm.imageUrl || ""})` }} />
                      <div className="product-body">
                        <div className="product-inline-fields">
                          <input
                            value={productForm.name}
                            onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Name"
                            required
                          />
                          <input
                            value={productForm.brand}
                            onChange={e => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                            placeholder="Brand"
                            required
                          />
                        </div>
                        <div className="price-row">
                          <input
                            type="number"
                            value={productForm.price}
                            onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="Price"
                            required
                          />
                          <input
                            type="number"
                            value={productForm.stock}
                            onChange={e => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                            placeholder="Stock"
                            required
                          />
                        </div>
                        <div className="specs">
                          <input
                            value={productForm.specs}
                            onChange={e => setProductForm(prev => ({ ...prev, specs: e.target.value }))}
                            placeholder="Specs (comma separated)"
                          />
                        </div>
                        <div className="product-footer">
                          <select
                            value={productForm.category}
                            onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                            required
                          >
                            <option value="">Select category</option>
                            {categories.map(category => (
                              <option key={category._id} value={category._id}>{category.name}</option>
                            ))}
                          </select>
                          <input
                            value={productForm.imageUrl}
                            onChange={e => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                            placeholder="Image URL"
                          />
                        </div>
                        <div className="row-actions">
                          <button className="primary" type="submit">Add</button>
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => {
                              setEditingProductId(null);
                              setProductForm(emptyProductForm);
                            }}
                          >Cancel</button>
                        </div>
                      </div>
                    </form>
                  )}
                  {visibleProducts.map((product, index) =>
                    isAdmin && editingProductId === product._id ? (
                      <form
                        key={product._id}
                        className="product-card editing"
                        style={{ animationDelay: `${index * 70}ms` }}
                        onSubmit={handleProductSubmit}
                      >
                        <div className="product-image" style={{ backgroundImage: `url(${productForm.imageUrl || ""})` }} />
                        <div className="product-body">
                          <div>
                            <input
                              value={productForm.name}
                              onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Name"
                              required
                            />
                            <input
                              value={productForm.brand}
                              onChange={e => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                              placeholder="Brand"
                              required
                            />
                          </div>
                          <div className="price-row">
                            <input
                              type="number"
                              value={productForm.price}
                              onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                              placeholder="Price"
                              required
                            />
                            <input
                              type="number"
                              value={productForm.stock}
                              onChange={e => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                              placeholder="Stock"
                              required
                            />
                          </div>
                          <div className="specs">
                            <input
                              value={productForm.specs}
                              onChange={e => setProductForm(prev => ({ ...prev, specs: e.target.value }))}
                              placeholder="Specs (comma separated)"
                            />
                          </div>
                          <div className="product-footer">
                            <select
                              value={productForm.category}
                              onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                              required
                            >
                              <option value="">Select category</option>
                              {categories.map(category => (
                                <option key={category._id} value={category._id}>{category.name}</option>
                              ))}
                            </select>
                            <input
                              value={productForm.imageUrl}
                              onChange={e => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                              placeholder="Image URL"
                            />
                          </div>
                          <div className="row-actions">
                            <button className="primary" type="submit">Save</button>
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => {
                                setEditingProductId(null);
                                setProductForm(emptyProductForm);
                              }}
                            >Cancel</button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div
                        key={product._id}
                        className="product-card"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <div className="product-image" style={{ backgroundImage: `url(${product.imageUrl || ""})` }} />
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
                            <div className="product-actions">
                              {canBuy ? (
                                <button
                                  className="primary"
                                  type="button"
                                  onClick={() => handleAddToCart(product._id)}
                                >
                                  Add to cart
                                </button>
                              ) : (
                                <span className="muted">Login to buy</span>
                              )}
                              <button
                                className="ghost"
                                type="button"
                                onClick={() => openProductReviews(product._id)}
                              >
                                Reviews ({reviewsByProduct[product._id]?.length || 0})
                              </button>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="row-actions">
                              <button
                                className="ghost"
                                type="button"
                                onClick={() => handleEditProduct(product)}
                              >Edit</button>
                              <button
                                className="danger"
                                type="button"
                                onClick={() => handleDeleteProduct(product._id)}
                              >Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <aside className="side-panels">
                <div className="panel reviews-panel">
                  <div className="panel-head">
                    <h3>Reviews</h3>
                    <span className="chip">Separate view</span>
                  </div>
                  {selectedReviewProduct ? (
                    <div className="panel-body review-drawer">
                      <div className="review-drawer-head">
                        <div>
                          <strong>{selectedReviewProduct.name}</strong>
                          <p className="muted small">{selectedReviewProduct.brand}</p>
                        </div>
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => setSelectedReviewProductId(null)}
                        >
                          Close
                        </button>
                      </div>
                      {reviewsByProduct[selectedReviewProduct._id]?.length ? (
                        <div className="reviews-list reviews-list--drawer">
                          {reviewsByProduct[selectedReviewProduct._id].map((review) => (
                            <div key={review._id} className="review-item">
                              <div className="review-item-head">
                                <span>{review.user?.name || "Member"}</span>
                                <span>{"★".repeat(review.rating)}</span>
                              </div>
                              {review.comment && (
                                <p className="muted small">{review.comment}</p>
                              )}
                              {(isAdmin || review.user?._id === user?._id) && (
                                <button
                                  className="ghost review-delete"
                                  type="button"
                                  onClick={() => handleDeleteReview(review._id)}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="muted small">No reviews yet.</p>
                      )}
                      {user && (
                        <div className="review-form">
                          <select
                            value={reviewDrafts[selectedReviewProduct._id]?.rating || "5"}
                            onChange={(event) =>
                              setReviewDrafts((prev) => ({
                                ...prev,
                                [selectedReviewProduct._id]: {
                                  ...(prev[selectedReviewProduct._id] || { comment: "" }),
                                  rating: event.target.value,
                                },
                              }))
                            }
                          >
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating} stars
                              </option>
                            ))}
                          </select>
                          <input
                            value={reviewDrafts[selectedReviewProduct._id]?.comment || ""}
                            onChange={(event) =>
                              setReviewDrafts((prev) => ({
                                ...prev,
                                [selectedReviewProduct._id]: {
                                  ...(prev[selectedReviewProduct._id] || { rating: "5" }),
                                  comment: event.target.value,
                                },
                              }))
                            }
                            placeholder="Leave a short review"
                          />
                          <button
                            className="ghost"
                            type="button"
                            onClick={() => handleReviewSubmit(selectedReviewProduct._id)}
                          >
                            Post
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="muted small">
                      Choose a product review button to read or add feedback.
                    </p>
                  )}
                </div>

                {/* Add category panel */}
                {isAdmin && editingCategoryId !== "new" && (
                  <button
                    className="panel add-category-btn"
                    type="button"
                    onClick={() => {
                      setEditingCategoryId("new");
                      setCategoryForm(emptyCategoryForm);
                    }}
                  >
                    + Add Category
                  </button>
                )}
                {/* Inline add form for new category - styled like old sideboard */}
                {isAdmin && editingCategoryId === "new" && (
                  <form
                    className="category-form panel"
                    onSubmit={e => {
                      e.preventDefault();
                      if (!categoryForm.name.trim()) {
                        fail("Category name is required.");
                        return;
                      }
                      handleCategorySubmit(e);
                    }}
                  >
                    <h3>Add Category</h3>
                    <div className="category-form-fields">
                      <label>
                        <span>Name</span>
                        <input
                          value={categoryForm.name}
                          onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Category name"
                          required
                        />
                      </label>
                      <label>
                        <span>Description (optional)</span>
                        <input
                          value={categoryForm.description}
                          onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe this category"
                        />
                      </label>
                      <div className="row-actions">
                        <button className="primary" type="submit">Add</button>
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setCategoryForm(emptyCategoryForm);
                          }}
                        >Cancel</button>
                      </div>
                    </div>
                  </form>
                )}
                {/* Cart panel (single instance) */}
                <div className="panel cart">
                  <div className="panel-head">
                    <h3>Cart</h3>
                    <span className="chip">Buyer access</span>
                  </div>
                  {canBuy ? (
                    <div className="panel-body">
                      {cart?.items?.length ? (
                        <div className="cart-items">
                          {cart.items.map((item) => (
                            <div key={item._id} className="cart-item">
                              <div className="cart-item-info">
                                <strong>{item.product?.name || ""}</strong>
                                <span className="muted">
                                  {formatPrice(item.product?.price || 0)}
                                </span>
                              </div>
                              <div className="cart-controls">
                                <input
                                  type="number"
                                  min="1"
                                  max={item.product?.stock || 1}
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
                        Sign in to use the cart and checkout.
                      </p>
                    </div>
                  )}
                </div>

                {/* Orders panel (single instance) */}
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
                                  {order.items.reduce(
                                    (sum, item) => sum + (item.quantity || 0),
                                    0,
                                  )} items
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

                {/* Profile panel */}
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

                {/* Auth panel */}
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
              </aside>
            </section>
    </div>
  );
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/shop" replace />} />
    <Route path="/shop" element={<ShopPage focus="shop" />} />
    <Route path="/auth" element={<ShopPage focus="auth" />} />
    <Route path="*" element={<Navigate to="/shop" replace />} />
  </Routes>
);

export default App;
