const express = require("express");

const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const Category = require("../models/Category");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Missing name" });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || "",
    });

    res.status(201).json(category);
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
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Missing name" });
      }

      const updated = await Category.findByIdAndUpdate(
        req.params.id,
        { name: name.trim(), description: description || "" },
        { new: true },
      );

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
      const deleted = await Category.findByIdAndDelete(req.params.id);
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
