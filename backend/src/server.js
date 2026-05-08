const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");

const { connectDb } = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const reviewRoutes = require("./routes/reviews");
const { seedDemo } = require("./seed/seed");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const mongoUrl =
  process.env.MONGO_URL || "mongodb://localhost:27017/phone_shop";
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);
const buildCorsOptionsSimple = () => {
  const env = process.env.CORS_ORIGIN || corsOrigin;
  if (env.includes(",")) {
    const allowed = env.split(",").map((s) => s.trim());
    return { origin: allowed, credentials: true };
  }
  return { origin: env, credentials: true };
};
app.use(cors(buildCorsOptionsSimple()));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 8,
    },
    store: MongoStore.create({ mongoUrl }),
  }),
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDb(mongoUrl);
  await seedDemo();
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
