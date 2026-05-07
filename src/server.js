import express from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET ?? "replace-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

const users = [
  {
    id: "u1",
    email: "su@cms.local",
    passwordPlaintext: "SuperSecret!123",
    role: "SU",
    locked: false,
  },
  {
    id: "u2",
    email: "admin@cms.local",
    passwordPlaintext: "AdminSecret!123",
    role: "ADMIN",
    locked: false,
  },
  {
    id: "u3",
    email: "resident@cms.local",
    passwordPlaintext: "ResidentSecret!123",
    role: "RESIDENT",
    locked: true,
  },
];

async function bootstrapPasswordHashes() {
  await Promise.all(
    users.map(async (user) => {
      if (!user.passwordHash) {
        user.passwordHash = await argon2.hash(user.passwordPlaintext, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16,
          timeCost: 3,
          parallelism: 1,
        });
        delete user.passwordPlaintext;
      }
    })
  );
}

function buildPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    locked: user.locked,
  };
}

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required",
      });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: "invalid credentials",
      });
    }

    if (user.locked) {
      return res.status(423).json({
        error: "user is locked",
      });
    }

    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      return res.status(401).json({
        error: "invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      token,
      user: buildPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      error: "internal server error",
    });
  }
});

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing bearer token" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: "invalid or expired token",
    });
  }
}

app.get("/auth/me", authenticateJWT, (req, res) => {
  const user = users.find((u) => u.id === req.auth.sub);

  if (!user) {
    return res.status(404).json({
      error: "user not found",
    });
  }

  return res.status(200).json({
    user: buildPublicUser(user),
    role: user.role,
  });
});

const port = Number(process.env.PORT ?? 3000);

bootstrapPasswordHashes()
  .then(() => {
    app.listen(port, () => {
      console.log(`Auth service listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to bootstrap auth service", error);
    process.exit(1);
  });
