# CMS Backend Auth + RBAC

## Folder Structure Updates

```
.
├── src
│   ├── app.js
│   ├── server.js
│   ├── config.js
│   ├── auth
│   │   └── token.js
│   ├── data
│   │   └── users.js
│   ├── middleware
│   │   ├── authenticateJwt.js
│   │   └── requireRole.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   └── adminRoutes.js
│   └── utils
│       └── httpError.js
├── tests
│   └── auth.test.js
└── package.json
```

## Auth Endpoints

### `POST /auth/login`
- Request body:
```json
{ "email": "admin@cms.local", "password": "admin123456" }
```
- Returns JWT with role claim (`SU`, `ADMIN`, `RESIDENT`) and user payload.

### `GET /auth/me`
- Requires `Authorization: Bearer <token>`.
- Returns current user derived from JWT subject (`sub`).

## Middleware
- `authenticateJwt`: verifies JWT and attaches payload to `req.user`.
- `requireRole(["ADMIN", "SU"])`: denies any non-listed role.

## Example Usage

```bash
# 1) Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cms.local","password":"admin123456"}'

# 2) Check current user
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 3) Access admin-only route
curl http://localhost:3000/admin/dashboard \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Test Examples

```bash
npm test
```
Covers:
- successful login
- `/auth/me` retrieval
- RBAC denial for `RESIDENT`
- RBAC allow for `SU`
