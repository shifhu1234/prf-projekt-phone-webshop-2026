const express = require("express");

const { requireAuth } = require("../middleware/auth");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      total,
      status: "placed",
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const filter = isAdmin ? {} : { user: req.user._id };

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      return res.status(404).json({ message: "Not found" });
    }

    const isOwner =
      order.user && order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
