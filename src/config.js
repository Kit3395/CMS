import dotenv from 'dotenv';

// Load .env values into process.env before reading config values.
dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function numberValue(name, defaultValue) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return defaultValue;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a number. Received: ${raw}`);
  }

  return parsed;
}

export const config = {
  port: numberValue('PORT', 3000),
  db: {
    url: required('DB_URL')
  },
  jwt: {
    secret: required('JWT_SECRET')
  }
};
