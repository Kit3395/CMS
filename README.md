## Stripe payment integration

### Endpoints
- `POST /payments/create-intent` with payload `{ "invoice_id": 123 }`.
- `POST /payments/webhook` for Stripe webhook events (`payment_intent.succeeded` and `payment_intent.payment_failed`).

### What happens on success
1. A `Payment` record is created.
2. The `Invoice` status is set to `paid`.
3. A `Receipt` record is created.
4. An `AuditLog` entry is created.

### Secret configuration
Set these environment variables (e.g. in `.env`):
- `STRIPE_SECRET_KEY`: Stripe API secret key.
- `STRIPE_WEBHOOK_SECRET`: endpoint signing secret from Stripe webhook settings.
- `DATABASE_URL`: SQLAlchemy connection string.

### Run
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
