const bcrypt = require("bcryptjs");

const Category = require("../models/Category");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");

const seedDemo = async () => {
  if (process.env.SEED_DEMO === "false") {
    return;
  }

  const productCount = await Product.countDocuments();
  if (productCount > 0) {
    return;
  }

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const customerPassword = await bcrypt.hash("Demo123!", 10);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@phone-shop.test",
    passwordHash: adminPassword,
    role: "admin",
  });

  const customer = await User.create({
    name: "Demo Buyer",
    email: "demo@phone-shop.test",
    passwordHash: customerPassword,
    role: "customer",
  });

  const categories = await Category.insertMany([
    {
      name: "Flagship",
      description: "Top tier phones with premium materials.",
    },
    { name: "Midrange", description: "Balanced performance and value." },
    { name: "Budget", description: "Affordable everyday devices." },
    { name: "Rugged", description: "Durable phones for harsh conditions." },
    { name: "Foldable", description: "Flexible screens and new form factors." },
  ]);

  const byName = Object.fromEntries(
    categories.map((category) => [category.name, category]),
  );

  const products = await Product.insertMany([
    {
      name: "Aurora X1",
      brand: "Aether",
      price: 999,
      stock: 12,
      category: byName.Flagship._id,
      specs: ["6.7 inch OLED", "512 GB storage", "Triple camera", "5G"],
      imageUrl: "https://placehold.co/600x800?text=Aurora+X1",
    },
    {
      name: "Volt S9",
      brand: "Volt",
      price: 699,
      stock: 18,
      category: byName.Midrange._id,
      specs: ["6.5 inch OLED", "256 GB storage", "Fast charge"],
      imageUrl: "https://placehold.co/600x800?text=Volt+S9",
    },
    {
      name: "Kobo Lite",
      brand: "Kobo",
      price: 299,
      stock: 42,
      category: byName.Budget._id,
      specs: ["6.1 inch LCD", "128 GB storage", "Dual camera"],
      imageUrl: "https://placehold.co/600x800?text=Kobo+Lite",
    },
    {
      name: "Ridge Pro",
      brand: "Terra",
      price: 649,
      stock: 9,
      category: byName.Rugged._id,
      specs: ["IP68 + MIL-STD", "7000 mAh battery", "Glove mode"],
      imageUrl: "https://placehold.co/600x800?text=Ridge+Pro",
    },
    {
      name: "Flexa Fold",
      brand: "Flexa",
      price: 1399,
      stock: 5,
      category: byName.Foldable._id,
      specs: ["7.4 inch foldable", "1 TB storage", "Hinge gen 3"],
      imageUrl: "https://placehold.co/600x800?text=Flexa+Fold",
    },
    {
      name: "Nimbus Mini",
      brand: "Nimbus",
      price: 499,
      stock: 25,
      category: byName.Midrange._id,
      specs: ["6.2 inch OLED", "256 GB storage", "Matte finish"],
      imageUrl: "https://placehold.co/600x800?text=Nimbus+Mini",
    },
    {
      name: "Atlas Max",
      brand: "Atlas",
      price: 899,
      stock: 7,
      category: byName.Flagship._id,
      specs: ["6.8 inch AMOLED", "512 GB storage", "Periscope zoom"],
      imageUrl: "https://placehold.co/600x800?text=Atlas+Max",
    },
    {
      name: "Canyon Go",
      brand: "Canyon",
      price: 379,
      stock: 33,
      category: byName.Budget._id,
      specs: ["6.3 inch LCD", "128 GB storage", "Dual SIM"],
      imageUrl: "https://placehold.co/600x800?text=Canyon+Go",
    },
  ]);

  await Review.insertMany([
    {
      user: customer._id,
      product: products[0]._id,
      rating: 5,
      comment: "Bright screen and fast performance.",
    },
    {
      user: customer._id,
      product: products[1]._id,
      rating: 4,
      comment: "Great value, battery could be bigger.",
    },
  ]);

  await User.updateOne({ _id: admin._id }, { $set: { createdAt: new Date() } });
};

module.exports = { seedDemo };
