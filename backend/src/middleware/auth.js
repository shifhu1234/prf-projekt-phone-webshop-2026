const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Auth required" });
  }

  if (!req.user) {
    req.user = await User.findById(req.session.userId).select("-passwordHash");
  }

  if (!req.user) {
    return res.status(401).json({ message: "Auth required" });
  }

  next();
};

module.exports = { requireAuth };
