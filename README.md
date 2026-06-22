# EcoWheel — Crypto Payment Gateway Integration

Author: Mustafa

This change adds a simple Binance Pay-style crypto payment option to the existing
EcoWheel booking flow, alongside the current PayPal payment. It is a mock integration
designed to be swapped for the real Binance Pay API later.

## What was added

**Backend (NestJS — `api/`)**
- `api/src/modules/payment/crypto.service.ts` — mock payment session logic (in-memory).
- `api/src/modules/payment/crypto.controller.ts` — create session + status endpoints.
- `api/src/modules/payment/crypto.module.ts` — module wiring.
- `api/src/modules/app/app.module.ts` — registers `CryptoModule`.

**Frontend (React + Vite + Chakra UI — `frontend/`)**
- `frontend/src/components/crypto/CryptoPaymentButton.tsx` — "Pay with Binance Pay"
  button with pending / paid / failed status and error handling.
- `frontend/src/pages/booking/booking.page.tsx` — renders the crypto button next to
  the existing PayPal button.

The PayPal flow is untouched. On a successful crypto payment the existing booking
success logic runs (rental created → QR-code success page).

## API

| Method | Route                                   | Description                          |
| ------ | --------------------------------------- | ------------------------------------ |
| POST   | `/api/v1/crypto/create_session`         | Create a mock payment session.       |
| GET    | `/api/v1/crypto/status/:paymentId`      | Get the current payment status.      |

`create_session` body:

```json
{ "amount": "24.00", "currency": "USDT" }
```

Response:

```json
{
  "paymentId": "uuid",
  "amount": "24.00",
  "currency": "USDT",
  "provider": "BinancePay",
  "status": "pending",
  "checkoutUrl": "https://pay.example.com/checkout/uuid",
  "reference": "BP-1782066205153"
}
```

## Mock behaviour

- A session starts as `pending`.
- It settles to `paid` ~3 seconds after creation (polled via the status endpoint).
- An invalid / zero amount returns `failed` immediately.
- The single spot for the real Binance Pay query call is marked with a comment in
  `crypto.service.ts`.

No real Binance Pay credentials are used.

## How to test

1. Install and start the stack (Postgres required for the backend):
   ```bash
   yarn install
   yarn migrate          # prisma generate + db push
   yarn db:seed          # seed bikes/users
   yarn server           # NestJS API on :3300
   yarn front            # Vite frontend
   ```
2. Log in, open a booking page (e.g. `/Booking/1`), pick a date range of at least 1 hour.
3. Click **Pay with Binance Pay** — status shows *pending* then *confirmed*, and the
   booking continues to the QR-code success page.

Backend-only check:

```bash
curl -X POST http://localhost:3300/api/v1/crypto/create_session \
  -H "Content-Type: application/json" -d '{"amount":"24.00"}'
curl http://localhost:3300/api/v1/crypto/status/<paymentId>
```
