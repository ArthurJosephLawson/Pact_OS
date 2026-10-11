# Webhook & Event Payload Specification

This document specifies PACT's inbound finance/pledge webhook endpoint: its
security model, the event catalog it accepts, payload shapes, response format,
and the delivery-retry contract expected of senders. The implementation lives in
[`src/app/api/finance/webhook/route.ts`](../src/app/api/finance/webhook/route.ts).

---

## 1. Endpoint

| Property | Value |
| --- | --- |
| Method | `POST` |
| Path | `/api/finance/webhook` |
| Body | Raw JSON, read verbatim for signature verification |
| Auth | HMAC-SHA256 signature over the raw body |
| Rate limit | `WEBHOOK` tier — 60 requests / minute |

The handler reads the body with `req.text()` **before** any parsing, because the
signature is computed over the exact bytes received.

---

## 2. Overview & security

### Signature headers

A signature is read from either header, in this order:

1. `stripe-signature` (Stripe-compatible)
2. `x-pact-signature` (PACT-native senders)

The header uses the `t=<unix>,v1=<hex>` key/value form. The signed payload is the
timestamp, a literal `.`, and the raw body:

```
signedPayload = `${timestamp}.${body}`
```

### Verification

```ts
const computedSig = crypto
  .createHmac('sha256', webhookSecret)
  .update(`${timestamp}.${rawBody}`)
  .digest('hex');

const valid =
  expectedSig.length === computedSig.length &&
  crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(computedSig));
```

- The HMAC key is `STRIPE_WEBHOOK_SECRET` or `PLEDGE_WEBHOOK_SECRET`.
- Comparison uses `crypto.timingSafeEqual` to avoid timing side channels.
- Signatures are only enforced when a secret **and** a signature header are both
  present; without a configured secret the endpoint still validates and logs.

### Replay protection

The timestamp is compared to the server clock and rejected when it is more than
**300 seconds** old or in the future:

```
if (Math.abs(timestampAge) > 300) → 400
```

### Response hygiene

Successful responses set `Cache-Control: no-store` and never include
consequence, pledge, or partner details. The body is limited to a receipt.

---

## 3. Rate limiting

Requests are keyed by `extractClientIdentifier(headers)` and checked against the
`WEBHOOK` tier (60 requests per minute). Exceeding it returns `429`:

```json
{ "error": "Rate limit exceeded. Please try again later." }
```

---

## 4. Event catalog

The endpoint switches on `event.type` (falling back to `event.event`):

| Event type | Meaning |
| --- | --- |
| `payment_intent.succeeded` | A payment intent settled |
| `pledge.charge_succeeded` | A pledge consequence charge succeeded |
| `payment_intent.payment_failed` | A payment intent failed |
| `pledge.charge_failed` | A pledge consequence charge failed |
| `charge.refunded` | A charge was refunded |
| `pledge.refunded` | A pledge charge was refunded |

Unrecognized types are logged and acknowledged with `200` so senders do not
retry indefinitely.

---

## 5. Payload schemas

Every request body includes an `id` (event id) and a `type`. Senders may use
either the Stripe-style or PACT-native event names.

### `payment_intent.succeeded` / `pledge.charge_succeeded`

```json
{
  "id": "evt_1P9xQ2AbCdEf",
  "type": "pledge.charge_succeeded",
  "created": 1760000000,
  "data": {
    "pledge_id": "pl_8f2c1a",
    "amount_cents": 2500,
    "currency": "usd",
    "status": "succeeded"
  }
}
```

### `payment_intent.payment_failed` / `pledge.charge_failed`

```json
{
  "id": "evt_1P9xQ2GhiJkL",
  "type": "pledge.charge_failed",
  "created": 1760000060,
  "data": {
    "pledge_id": "pl_8f2c1a",
    "amount_cents": 2500,
    "currency": "usd",
    "failure_reason": "card_declined"
  }
}
```

### `charge.refunded` / `pledge.refunded`

```json
{
  "id": "evt_1P9xQ2MnoPqR",
  "type": "pledge.refunded",
  "created": 1760000180,
  "data": {
    "pledge_id": "pl_8f2c1a",
    "amount_cents": 2500,
    "currency": "usd"
  }
}
```

---

## 6. Response schema

```json
{
  "received": true,
  "eventId": "evt_1P9xQ2AbCdEf",
  "processedInMs": 3
}
```

| Status | When |
| --- | --- |
| `200` | Accepted or acknowledged as unhandled |
| `400` | Malformed JSON, unreadable body, or stale timestamp |
| `401` | Signature mismatch |
| `429` | Rate limit exceeded |

---

## 7. Retry & backoff policy

Senders should treat any non-`2xx` response as a delivery failure and retry with
capped exponential backoff. Because the endpoint is idempotent per `event.id`,
senders must reuse the same event id across retries.

| Attempt | Approximate delay |
| --- | --- |
| 1 | immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |
| 6 | 6 hours |
| … | up to **72 hours** total |

Stop retrying once the sender has delivered the event successfully or the
72-hour window elapses. A `400`/`401` is a contract error and should be fixed
rather than blindly retried.

---

## 8. Related documentation

- [Data Model Specification](./DATA_MODEL.md)
- [Security & Zero-Trust Boundaries](./SECURITY.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Testing & Verification Runbook](./TESTING.md)
