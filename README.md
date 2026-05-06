# CMS Backend Configuration

This backend now reads runtime settings from environment variables and centralizes access in a single config module.

## Environment variables

Copy the example file:

```bash
cp .env.example .env
```

Set the required values in `.env`:

- `DB_URL` (required): database connection string
- `JWT_SECRET` (required): secret used for JWT signing
- `PORT` (optional): HTTP server port (defaults to `3000`)

## How `.env` is loaded

`src/config.js` calls `dotenv.config()` at startup, then exports a `config` object:

- `config.db.url`
- `config.jwt.secret`
- `config.port`

All backend code should import these values from the config module instead of reading from `process.env` directly.

## Start server

```bash
npm install
npm start
```
