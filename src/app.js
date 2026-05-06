const express = require('express');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorResponse } = require('./utils/httpError');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  return res.status(404).json(
    errorResponse({ code: 'NOT_FOUND', message: 'Route not found.' })
  );
});

module.exports = app;
