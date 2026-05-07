# Stripe Payment Integration — Casa Mira API

This module adds invoice payment support using Stripe PaymentIntents and webhook‑driven post‑payment processing.

## Features

- `POST /payments/create-intent`
  - Validates `invoice_id`
  - Creates a Stripe PaymentIntent
  - Returns `client_secret` and `payment_intent_id`

- `POST /payments/webhook`
  - Verifies Stripe webhook signatures
  - Handles:
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`
  - On success:
    - Creates a `Payment` record
    - Marks the `Invoice` as `paid`
    - Creates a `Receipt`
    - Writes an `AuditLog`

## Environment Variables

Copy the example file:

```bash
cp .env.example .env
