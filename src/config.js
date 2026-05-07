const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  port: Number(process.env.PORT ?? 3000)
};
