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

  // Add a few more demo customers for additional reviews
  const moreUsers = await User.insertMany([
    { name: "Jamie Shopper", email: "jamie@phone-shop.test", passwordHash: customerPassword, role: "customer" },
    { name: "Pat Tester", email: "pat@phone-shop.test", passwordHash: customerPassword, role: "customer" },
    { name: "Alex Shopper", email: "alex@phone-shop.test", passwordHash: customerPassword, role: "customer" },
  ]);

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
      specs: ["6.7 inch OLED", "1 TB storage", "Triple camera", "5G"],
      imageUrl: "https://images.stockcake.com/public/1/4/c/14c27bd4-26cd-4681-b55c-3136a03da60e_large/futuristic-smartphone-technology-stockcake.jpg",
    },
    {
      name: "Volt S9",
      brand: "Volt",
      price: 699,
      stock: 18,
      category: byName.Midrange._id,
      specs: ["6.5 inch OLED", "256 GB storage", "Fast charge"],
      imageUrl: "https://images.stockcake.com/public/9/d/5/9d54b7ec-bfed-4a1d-9cfc-1693534b9383_large/glowing-phone-edge-stockcake.jpg",
    },
    {
      name: "Kobo Lite",
      brand: "Kobo",
      price: 299,
      stock: 42,
      category: byName.Budget._id,
      specs: ["6.1 inch LCD", "128 GB storage", "Dual camera"],
      imageUrl: "https://images.stockcake.com/public/e/6/c/e6cd64cb-796b-47cb-a13b-4756e212c099_large/smartphone-glow-display-stockcake.jpg",
    },
    {
      name: "Ridge Pro",
      brand: "Terra",
      price: 649,
      stock: 9,
      category: byName.Rugged._id,
      specs: ["IP68 + MIL-STD", "7000 mAh battery", "Glove mode"],
      imageUrl: "https://images.stockcake.com/public/5/1/a/51aaef70-42bf-4181-9c82-2b5f6789c48e_large/cloudy-smartphone-display-stockcake.jpg",
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
      price: 279,
      stock: 33,
      category: byName.Budget._id,
      specs: ["3.3 inch LCD", "64 GB storage", "Dual SIM"],
      imageUrl: "https://i.guim.co.uk/img/media/f9dc4c117735f59bcc9da922f9263a76dbc2d210/0_0_3504_2849/master/3504.jpg?width=700&quality=85&auto=format&fit=max&s=c45a767df0780881494eea05110d52d3",
    },
    {
      name: "Echo Note",
      brand: "Echo",
      price: 359,
      stock: 20,
      category: byName.Midrange._id,
      specs: ["6.4 inch AMOLED", "128 GB storage", "Stylus support"],
      imageUrl: "https://placehold.co/600x800?text=Echo+Note",
    },
    {
      name: "Pulse Lite",
      brand: "Pulse",
      price: 219,
      stock: 50,
      category: byName.Budget._id,
      specs: ["6.0 inch LCD", "64 GB storage", "Lightweight"],
      imageUrl: "https://placehold.co/600x800?text=Pulse+Lite",
    },
    {
      name: "Orbit One",
      brand: "Orbit",
      price: 579,
      stock: 15,
      category: byName.Midrange._id,
      specs: ["6.3 inch OLED", "256 GB storage", "Good camera"],
      imageUrl: "https://placehold.co/600x800?text=Orbit+One",
    },
    {
      name: "Zenith X",
      brand: "Zenith",
      price: 1199,
      stock: 6,
      category: byName.Flagship._id,
      specs: ["6.9 inch LTPO", "1 TB storage", "Satellite comms"],
      imageUrl: "https://placehold.co/600x800?text=Zenith+X",
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
    {
      user: moreUsers[0]._id,
      product: products[2]._id,
      rating: 4,
      comment: "Compact and reliable for daily use.",
    },
    {
      user: moreUsers[1]._id,
      product: products[3]._id,
      rating: 5,
      comment: "Took it hiking, survived the drops and rain.",
    },
    {
      user: moreUsers[2]._id,
      product: products[4]._id,
      rating: 5,
      comment: "Foldable design is fun and solid.",
    },
    {
      user: customer._id,
      product: products[8]?._id || products[0]._id,
      rating: 3,
      comment: "Nice phone but a bit pricey for my taste.",
    },
  ]);

  await User.updateOne({ _id: admin._id }, { $set: { createdAt: new Date() } });
};

module.exports = { seedDemo };

/*
Image links
https://images.stockcake.com/public/1/a/9/1a966323-e261-495f-b17a-d9ca723aa235_large/futuristic-interface-display-stockcake.jpg
https://i.guim.co.uk/img/media/f9dc4c117735f59bcc9da922f9263a76dbc2d210/0_0_3504_2849/master/3504.jpg?width=700&quality=85&auto=format&fit=max&s=c45a767df0780881494eea05110d52d3
https://images.stockcake.com/public/1/4/c/14c27bd4-26cd-4681-b55c-3136a03da60e_large/futuristic-smartphone-technology-stockcake.jpg


*/