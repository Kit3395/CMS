import express from "express";
import { config } from "./config.js";

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    dbConfigured: Boolean(config.db.url),
    jwtConfigured: Boolean(config.jwt.secret),
    jwtExpiresIn: config.jwt.expiresIn,
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
