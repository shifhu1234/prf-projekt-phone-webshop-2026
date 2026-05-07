const express = require("express");

const { requireAuth } = require("../middleware/auth");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

const getProductId = (item) => {
  if (!item?.product) {
    return null;
  }

  if (typeof item.product === "object" && item.product._id) {
    return item.product._id.toString();
  }

  return item.product.toString();
};

const normalizeCartItems = async (cart) => {
  const mergedItems = [];
  const itemsByProductId = new Map();
  let changed = false;

  for (const item of cart.items) {
    const productId = getProductId(item);
    if (!productId) {
      continue;
    }

    const existing = itemsByProductId.get(productId);
    if (existing) {
      existing.quantity += item.quantity;
      changed = true;
    } else {
      itemsByProductId.set(productId, item);
      mergedItems.push(item);
    }
  }

  if (changed) {
    cart.items = mergedItems;
    await cart.save();
  }

  return cart;
};

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.product");
  }
  return normalizeCartItems(cart);
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
      (item) => getProductId(item) === productId,
    );

    const currentQuantity = existing ? existing.quantity : 0;
    const availableQuantity = product.stock - currentQuantity;

    if (availableQuantity <= 0) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const addQuantity = Math.min(qty, availableQuantity);

    if (existing) {
      existing.quantity += addQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: addQuantity,
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

    if (product.stock < 1) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    item.quantity = Math.min(qty, product.stock);
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
