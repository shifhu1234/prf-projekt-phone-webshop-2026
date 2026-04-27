const mongoose = require("mongoose");

const connectDb = async (mongoUrl) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUrl);
  return mongoose.connection;
};

module.exports = { connectDb };
