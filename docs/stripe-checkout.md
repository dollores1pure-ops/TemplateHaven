# Stripe Checkout Integration

This project now supports Stripe Checkout for template purchases. This document
summarises the configuration that is required and the end-to-end flow between
the client, server, and Stripe.

## Environment variables

Set the following variables for the server process (e.g. in an `.env` file or
host-level secrets):

- `STRIPE_SECRET_KEY` **(required)** – your live or test secret key (e.g.
  `sk_live_...`).
- `STRIPE_CURRENCY` *(optional)* – ISO currency code for line items. Defaults to
  `usd`.
- `CHECKOUT_BASE_URL` *(optional)* – absolute base URL used to build the
  `success_url` and `cancel_url`. When omitted the API falls back to the
  incoming request host and protocol.

If you need the publishable key client-side (for example to initialise Stripe
Elements later on), expose it via a Vite environment variable such as
`VITE_STRIPE_PUBLISHABLE_KEY`. The current checkout flow only needs the secret
key because it performs a full redirect to Stripe Checkout.

> **Never** commit live API keys to the repository. Configure them through your
deployment environment instead.

## Installation

Install the updated dependencies:

```bash
npm install
```

Run the type checker after installation to ensure everything compiles:

```bash
npm run check
```

## Server endpoints

- `POST /api/cart/checkout` – creates a Stripe Checkout Session for the current
  cart and returns `{ url, sessionId }`. The client redirects to the `url`.
- `POST /api/cart/checkout/complete` – called by the client on the success page
  with `{ sessionId }`. The server validates the session with Stripe, converts
  the cart into an order, clears the cart, and returns `{ order, cart }`.

Both routes return `503` if Stripe is not configured so the frontend can surface
a helpful error message.

## Client routes

- `/checkout/success` – confirms the payment using the `session_id` query
  parameter, shows an order summary, and resets the cached cart state.
- `/checkout/cancel` – informs the user the checkout was cancelled and links
  back to the catalogue.

The cart modal now disables the checkout button while the Stripe session is
created and redirects the browser to the hosted payment page once it is ready.

## Flow recap

1. Shopper opens the cart and clicks **Proceed to Checkout**.
2. Frontend calls `POST /api/cart/checkout` and redirects to the returned Stripe
   Checkout URL.
3. After payment, Stripe redirects back to `/checkout/success?session_id=…`.
4. Success page calls `POST /api/cart/checkout/complete` to validate payment,
   create the internal order, and clear the cart.
5. User sees confirmation with an order summary and can continue browsing.
