# CASA MIRA API — Authentication & RBAC

This module provides secure JWT authentication, password hashing, and role‑based access control for the CASA MIRA backend.

## Features

### 🔐 Authentication
- `POST /auth/login` — verifies email/password and issues JWT
- `GET /auth/me` — returns the authenticated user

### 🛡️ Role-Based Access Control
Roles:
- `SU` — Superuser
- `ADMIN`
- `RESIDENT`

Protected example route:
- `GET /admin/dashboard` — requires `ADMIN` or `SU`

### 🔑 JWT
Tokens embed:
- `sub` — user ID
- `email`
- `role`

Configured via `.env`:
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### 🔒 Password Hashing
Uses `bcryptjs` with 12 rounds.

### 🧪 Tests
Run:
```bash
npm install
npm test
