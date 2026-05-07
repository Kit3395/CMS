# CMS HOA Go! Suggested Project Structure

## Root

```text
CMS/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ src/
│  │  ├─ config/
│  │  │  ├─ db.js
│  │  │  ├─ env.js
│  │  │  └─ firebase.js
│  │  ├─ constants/
│  │  │  └─ roles.js
│  │  ├─ middleware/
│  │  │  ├─ auth.middleware.js
│  │  │  ├─ role.middleware.js
│  │  │  └─ error.middleware.js
│  │  ├─ modules/
│  │  │  ├─ auth/
│  │  │  │  ├─ auth.controller.js
│  │  │  │  ├─ auth.service.js
│  │  │  │  ├─ auth.routes.js
│  │  │  │  └─ auth.validators.js
│  │  │  ├─ users/
│  │  │  ├─ billing/
│  │  │  ├─ payments/
│  │  │  ├─ receipts/
│  │  │  ├─ announcements/
│  │  │  ├─ disputes/
│  │  │  ├─ import-export/
│  │  │  └─ autofix/
│  │  ├─ routes/
│  │  │  ├─ health.routes.js
│  │  │  └─ index.js
│  │  ├─ utils/
│  │  ├─ app.js
│  │  └─ server.js
│  ├─ .env.example
│  └─ package.json
└─ frontend/
   ├─ public/
   ├─ src/
   │  ├─ app/
   │  │  ├─ providers/
   │  │  ├─ router/
   │  │  └─ store/
   │  ├─ components/
   │  │  ├─ common/
   │  │  └─ layout/
   │  ├─ features/
   │  │  ├─ auth/
   │  │  ├─ dashboard/
   │  │  ├─ billing/
   │  │  ├─ payments/
   │  │  ├─ receipts/
   │  │  ├─ announcements/
   │  │  ├─ disputes/
   │  │  └─ residents/
   │  ├─ services/
   │  │  ├─ apiClient.js
│   │  │  └─ firebase.js
   │  ├─ hooks/
   │  ├─ utils/
   │  ├─ styles/
   │  ├─ App.jsx
   │  └─ main.jsx
   ├─ index.html
   └─ package.json
```
