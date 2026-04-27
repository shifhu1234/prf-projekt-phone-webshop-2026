const express = require("express");

const { requireAuth } = require("../middleware/auth");
const Review = require("../models/Review");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.productId) {
      filter.product = req.query.productId;
    }

    const reviews = await Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!productId || Number.isNaN(numericRating)) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: numericRating,
      comment: comment || "",
    });

    await review.populate("user", "name");

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await review.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
