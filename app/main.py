import json
import uuid

import stripe
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.db import Base, engine, get_db
from app.models import AuditLog, Invoice, InvoiceStatus, Payment, Receipt

stripe.api_key = settings.stripe_secret_key

app = FastAPI(title="Payments API")


class CreateIntentPayload(BaseModel):
    invoice_id: int


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.post("/payments/create-intent")
def create_intent(payload: CreateIntentPayload, db: Session = Depends(get_db)):
    invoice = db.get(Invoice, payload.invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status == InvoiceStatus.paid:
        raise HTTPException(status_code=400, detail="Invoice already paid")

    intent = stripe.PaymentIntent.create(
        amount=int(invoice.amount * 100),
        currency=invoice.currency.lower(),
        metadata={"invoice_id": str(invoice.id)},
        automatic_payment_methods={"enabled": True},
    )
    return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}


@app.post("/payments/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, settings.stripe_webhook_secret)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    data_object = event["data"]["object"]

    if event_type == "payment_intent.succeeded":
        invoice_id = int(data_object["metadata"]["invoice_id"])
        invoice = db.get(Invoice, invoice_id)
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        existing = db.scalar(select(Payment).where(Payment.provider_payment_id == data_object["id"]))
        if not existing:
            payment = Payment(
                invoice_id=invoice.id,
                provider="stripe",
                provider_payment_id=data_object["id"],
                amount=data_object["amount_received"] / 100,
                currency=data_object["currency"],
                status="succeeded",
            )
            db.add(payment)
            db.flush()

            invoice.status = InvoiceStatus.paid

            receipt = Receipt(
                invoice_id=invoice.id,
                payment_id=payment.id,
                receipt_number=f"rcpt_{uuid.uuid4().hex[:12]}",
            )
            db.add(receipt)

            db.add(
                AuditLog(
                    action="payment_succeeded",
                    entity="invoice",
                    entity_id=str(invoice.id),
                    details=json.dumps(
                        {
                            "payment_intent_id": data_object["id"],
                            "receipt_number": receipt.receipt_number,
                        }
                    ),
                )
            )
            db.commit()

    elif event_type == "payment_intent.payment_failed":
        invoice_id = int(data_object["metadata"]["invoice_id"])
        invoice = db.get(Invoice, invoice_id)
        if invoice:
            invoice.status = InvoiceStatus.failed
            db.add(
                AuditLog(
                    action="payment_failed",
                    entity="invoice",
                    entity_id=str(invoice.id),
                    details=json.dumps(
                        {"payment_intent_id": data_object["id"], "reason": data_object.get("last_payment_error", {})}
                    ),
                )
            )
            db.commit()

    return {"received": True}
