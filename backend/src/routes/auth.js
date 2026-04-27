const bcrypt = require("bcryptjs");
const express = require("express");

const { requireAuth } = require("../middleware/auth");
const Cart = require("../models/Cart");
const Review = require("../models/Review");
const User = require("../models/User");

const router = express.Router();

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

router.get("/me", async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ user: null });
    }

    const user = await User.findById(req.session.userId).select(
      "-passwordHash",
    );
    if (!user) {
      return res.json({ user: null });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "customer",
    });

    req.session.userId = user._id.toString();
    req.session.role = user.role;

    res.status(201).json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user._id.toString();
    req.session.role = user.role;

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Missing name" });
    }

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { name: name.trim() },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.put("/password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordOk = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    await Cart.deleteOne({ user: userId });
    await Review.deleteMany({ user: userId });
    await User.deleteOne({ _id: userId });

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Account deletion failed" });
      }

      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

module.exports = router;
