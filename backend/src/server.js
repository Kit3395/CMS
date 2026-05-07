require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB } = require('./config/db');
const healthRoutes = require('./routes/health.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 CMS HOA Go backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
