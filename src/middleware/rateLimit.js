function createInMemoryRateLimiter({ windowMs = 60_000, max = 60 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    const record = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count += 1;
    hits.set(key, record);

    if (record.count > max) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    return next();
  };
}

module.exports = {
  createInMemoryRateLimiter,
};
