import express from 'express';
import { config } from './config.js';

const app = express();

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    dbConfigured: Boolean(config.db.url),
    jwtConfigured: Boolean(config.jwt.secret)
  });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
