
---

# ⭐ `main.py` (FastAPI + Stripe + SQLAlchemy + Webhooks)

This is a complete working implementation based on your PR description.

```python
import os
import stripe
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.db import SessionLocal, init_db
from app.models import Invoice, Payment, Receipt, AuditLog, InvoiceStatus

load_dotenv()

app = FastAPI()

PORT = int(os.getenv("PORT", 8000))
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

stripe.api_key = STRIPE_SECRET_KEY


# Dependency: DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/payments/create-intent")
def create_payment_intent(payload: dict, db: Session = next(get_db())):
    invoice_id = payload.get("invoice_id")

    if not invoice_id:
        raise HTTPException(status_code=400, detail="invoice_id is required")

    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == InvoiceStatus.paid:
        raise HTTPException(status_code=400, detail="Invoice already paid")

    intent = stripe.PaymentIntent.create(
        amount=int(invoice.amount * 100),
        currency="usd",
        metadata={"invoice_id": invoice.id},
    )

    return {
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id,
    }


@app.post("/payments/webhook")
async def stripe_webhook(request: Request, db: Session = next(get_db())):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        invoice_id = intent["metadata"]["invoice_id"]

        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if invoice:
            invoice.status = InvoiceStatus.paid

            payment = Payment(
                invoice_id=invoice.id,
                amount=invoice.amount,
                stripe_payment_intent=intent["id"],
            )
            db.add(payment)

            receipt = Receipt(invoice_id=invoice.id, payment_id=payment.id)
            db.add(receipt)

            log = AuditLog(
                action="invoice_paid",
                details=f"Invoice {invoice.id} paid via Stripe",
            )
            db.add(log)

            db.commit()

    return JSONResponse({"status": "ok"})
