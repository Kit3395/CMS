const express = require("express");
const helmet = require("helmet");
const { z } = require("zod");

// ─────────────────────────────────────────────
// Mock Auth + RBAC Middleware
// ─────────────────────────────────────────────
function mockAuth(req, res, next) {
  const role = req.headers["x-role"] ?? "ANON";
  req.user = { role };
  next();
}

function requireRole(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// ─────────────────────────────────────────────
// Rate Limiter (in-memory)
// ─────────────────────────────────────────────
const rateLimitStore = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  const entry = rateLimitStore.get(ip) ?? { count: 0, ts: now };
  if (now - entry.ts > 60_000) {
    entry.count = 0;
    entry.ts = now;
  }

  entry.count++;
  rateLimitStore.set(ip, entry);

  if (entry.count > 30) {
    return res.status(429).json({ error: "Too many requests" });
  }

  next();
}

// ─────────────────────────────────────────────
// Password Policy Middleware
// ─────────────────────────────────────────────
function passwordPolicy(req, res, next) {
  const pwd = req.body?.password;
  if (!pwd) return next();

  const strong =
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd);

  if (!strong) {
    return res.status(400).json({ error: "Password does not meet policy" });
  }

  next();
}

// ─────────────────────────────────────────────
// Zod Input Validation Middleware
// ─────────────────────────────────────────────
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors });
    }
    req.validated = result.data;
    next();
  };
}

// Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ─────────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────────
const app = express();
app.use(helmet());
app.use(express.json());
app.use(rateLimiter);
app.use(mockAuth);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// Public registration (with validation + password policy)
app.post(
  "/register",
  validate(registerSchema),
  passwordPolicy,
  (req, res) => {
    return res.status(201).json({
      message: "User registered",
      user: { email: req.validated.email },
    });
  }
);

// Admin-only report
app.get("/admin/reports", requireRole("ADMIN", "SU"), (req, res) => {
  return res.json({ report