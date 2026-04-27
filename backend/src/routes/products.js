const express = require("express");

const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const Category = require("../models/Category");
const Product = require("../models/Product");

const router = express.Router();

const buildPayload = (body) => ({
  name: body.name ? body.name.trim() : "",
  brand: body.brand ? body.brand.trim() : "",
  price: Number(body.price),
  stock: Number(body.stock),
  category: body.category,
  imageUrl: body.imageUrl || "",
  specs: Array.isArray(body.specs) ? body.specs.filter(Boolean) : [],
});

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).populate("category");
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const payload = buildPayload(req.body);
    if (!payload.name || !payload.brand || !payload.category) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      return res.status(400).json({ message: "Invalid price or stock" });
    }

    const categoryExists = await Category.exists({ _id: payload.category });
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }

    const product = await Product.create(payload);
    await product.populate("category");
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const payload = buildPayload(req.body);
      if (!payload.name || !payload.brand || !payload.category) {
        return res.status(400).json({ message: "Missing fields" });
      }

      if (Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
        return res.status(400).json({ message: "Invalid price or stock" });
      }

      const categoryExists = await Category.exists({ _id: payload.category });
      if (!categoryExists) {
        return res.status(400).json({ message: "Category not found" });
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
        new: true,
      }).populate("category");

      if (!updated) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Not found" });
      }

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
