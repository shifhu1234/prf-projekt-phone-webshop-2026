const express = require("express");

const { requireAuth } = require("../middleware/auth");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.product");
  }
  return cart;
};

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.post("/items", requireAuth, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Math.max(1, Number(quantity || 1));

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const cart = await findOrCreateCart(req.user._id);
    const existing = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        product: product._id,
        quantity: qty,
        priceAtAdd: product.price,
      });
    }

    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.put("/items/:itemId", requireAuth, async (req, res, next) => {
  try {
    const qty = Number(req.body.quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await findOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.quantity = qty;
    await cart.save();
    await cart.populate("items.product");

    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.delete("/items/:itemId", requireAuth, async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.deleteOne();
    await cart.save();
    await cart.populate("items.product");

    res.json(cart);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
