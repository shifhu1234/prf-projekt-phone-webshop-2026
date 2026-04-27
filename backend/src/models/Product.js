const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    specs: { type: [String], default: [] },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
