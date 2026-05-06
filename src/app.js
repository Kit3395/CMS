const express = require('express');
const helmet = require('helmet');
const { mockAuthenticate, requireAuth, requireRole } = require('./middleware/auth');
const { createInMemoryRateLimiter } = require('./middleware/rateLimit');
const { validateBody, createAnnouncementSchema } = require('./middleware/validation');
const { enforcePasswordPolicy } = require('./middleware/passwordPolicy');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(mockAuthenticate);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/auth/register', enforcePasswordPolicy, (_req, res) => {
  res.status(201).json({ created: true });
});

app.get('/admin/reports', requireRole('admin'), (_req, res) => {
  res.status(200).json({ report: 'sensitive data' });
});

app.post(
  '/announcements',
  requireAuth,
  requireRole('staff'),
  createInMemoryRateLimiter({ windowMs: 1000, max: 2 }),
  validateBody(createAnnouncementSchema),
  (req, res) => {
    res.status(201).json({ published: true, announcement: req.validatedBody });
  }
);

module.exports = app;
