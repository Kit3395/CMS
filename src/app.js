const express = require("express");
const authenticateJwt = require("./middleware/authenticateJwt");
const requireRole = require("./middleware/requireRole");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());

// Public auth routes
app.use("/auth", authRoutes);

// Protected admin routes
app.use("/admin", authenticateJwt, requireRole("ADMIN", "SU"), adminRoutes);

// Error formatter
app.use((err, req, res, next) => {
  return res.status(err.status ?? 500).json({
    error: err.message ?? "Internal server error"
  });
});

module.exports = app;
