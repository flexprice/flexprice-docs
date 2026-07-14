# Razorpay Autopay & Mandates — Documentation Design

**Date:** 2026-07-14
**Branch:** `feat/razorpay-checkout`
**Topic:** Document Razorpay's autocharge/mandate capability in the Checkout docs section.

## Goal

The checkout section (`docs/checkout/`) currently documents only the one-time
payment-link flow across four pages. A new Razorpay capability lets customers authorize
a recurring mandate (UPI Autopay or a saved card) once at checkout, after which future
invoices charge automatically. None of the existing pages mention `payment_provider_config`,
`collection_method`, `preferred_method`, `max_mandate_limit`, mandates, or auto-charge.

This spec covers documenting that capability: one new dedicated page as the primary
reference, plus targeted edits to the existing checkout pages.

## Decisions (from brainstorming)

1. **Structure** — One new dedicated page as the primary reference, with targeted edits to
   the existing pages to cross-link and surface the new config fields.
2. **Card mandate** — Documented as first-class, identical to UPI (only `preferred_method`
   differs). No "beta/untested" caveat. (Note: internally the card auto-charge path was only
   verified at session creation, but per the decision we present it as fully supported.)
3. **Auto-charge scope** — Renewals-focused. Subscription renewals are the main worked case;
   one-off and wallet top-up invoices get a one-line mention; the payment-link fallback and
   `max_mandate_limit` ceiling are covered briefly.
4. **Compliance depth** — Omit RBI-specific detail (₹15,000 AFA re-authentication threshold,
   pre-debit notifications). Keep the page Flexprice-API-focused; these are gateway-level
   specifics users can get from Razorpay.
5. **Fallback depth** — Keep the payment-link fallback as noted lines inside the auto-charge
   section, not a separate section.

### Informed by competitive research (2026-07-14)

Reviewed how Stripe, Razorpay, Chargebee, Recurly, Orb, Polar, and Paddle document
"authorize a recurring mandate once, then auto-charge future invoices." Takeaways applied
below:

- **Structure is validated.** A dedicated concept page with narrative-on-top, tables-on-bottom
  matches the cleanest competitors (Polar; Razorpay's own concept pages). No structural change.
- **Three-phase framing** (from Razorpay): register mandate once → first charge → subsequent
  auto-debits. Folded into the intro as a one-sentence orientation — no added length.
- **Accuracy corrections** (from verifying claims against Razorpay's docs) — see below.
- Deliberately NOT adopted (per lean scope decision): promoting the fallback to its own
  section, RBI compliance callouts, a retry-schedule table (we have no multi-attempt dunning
  cadence — the payment link *is* the recovery artifact).

## New page: `docs/checkout/autopay-mandates.mdx`

- **Title:** "Autopay & Mandates"
- **Description:** Collect a recurring mandate at checkout so future invoices charge
  automatically, with no further customer action.
- **Nav placement:** In the Checkout group, between `razorpay-checkout` and
  `implementation-guide`:

  ```
  overview → checkout-sessions → razorpay-checkout → autopay-mandates (NEW) → implementation-guide
  ```

### Page outline

1. **Intro** — What a mandate is, framed as a three-phase lifecycle in one sentence: register
   the mandate once → the first charge runs → subsequent invoices auto-debit. The three
   collection methods (one-time payment link vs UPI Autopay mandate vs card mandate) and when
   to choose autopay over one-time links.

2. **Prerequisites**
   - Razorpay connection with `sync_config.invoice.outbound: true` (enables auto-sync of
     future invoices).
   - Customer **must** have a `contact` (phone number) **to register a mandate**. The requirement
     comes from Razorpay's checkout/authentication step, not the Create Customer API — but a
     mandate registration without it is rejected (`"The contact field is required"`). Recommend
     collecting `contact` at customer-creation time if you'll use autopay. (Do NOT claim
     Razorpay's Create Customer API hard-requires it — it doesn't.)
   - A plan + price in the currency being charged (examples use `INR`).

3. **Register a mandate at checkout** — The `POST /v1/checkout/sessions` call with
   `payment_provider_config`. Field table:
   - `collection_method: "charge_automatically"` — switches from payment-link to mandate
     registration.
   - `preferred_method: "UPI"` or `"CARD"` — selects UPI Autopay vs card mandate.
   - `max_mandate_limit` — ceiling (major currency unit, e.g. rupees) for any single future
     auto-charge.

   UPI shown as the worked example. Card shown as first-class (same request shape,
   `preferred_method: "CARD"`). Response shape is identical to the payment-link flow — a
   `payment_action.url` the customer opens to authorize once.

4. **What happens after authorization**
   - On authorization, Razorpay sends `token.confirmed` (plus the first bundled
     `payment.captured`); the session flips to `completed` the same way the payment-link flow
     does.
   - Renewals-focused: subscription renewals auto-charge with no customer action.
   - One line noting one-off invoices and wallet top-up invoices also auto-charge.
   - **Fallback rule:** an invoice with no usable saved token, or an amount above
     `max_mandate_limit`, falls back to a normal Razorpay payment link. Framed as an intentional
     safety cap, not a bug.

5. **Gotchas**
   - `contact` is mandatory to register a mandate (see Prerequisites for the precise wording).
   - `max_mandate_limit` is a hard ceiling; invoices above it never auto-charge (they fall back
     to a payment link). No RBI/AFA-threshold detail here — omitted per scope decision.
   - Currency casing — light one-liner, framed **only** as a Flexprice convenience: Flexprice
     normalizes currency to uppercase for you, so send it in any casing. Do NOT assert anything
     about Razorpay's own case handling (that "lowercase → treated as international" behavior is
     unverified against Razorpay's docs and must not be presented as a documented gateway guarantee).

6. **Cross-link cards** — to `razorpay-checkout` (webhook setup), `checkout-sessions` (API
   reference), `implementation-guide` (end-to-end).

## Targeted edits to existing pages

- **`docs/checkout/checkout-sessions.mdx`** — Add `payment_provider_config` and its sub-fields
  (`collection_method`, `preferred_method`, `max_mandate_limit`) to the request-fields table,
  with a pointer to the new page. Primary spot API readers look.
- **`docs/checkout/overview.mdx`** — A short subsection under "How it works" naming the three
  collection methods, plus a card link to the new page.
- **`docs/checkout/razorpay-checkout.mdx`** — Add the mandate webhook event(s) (`token.confirmed`)
  to the events table so setup covers autopay too.
- **`docs/checkout/implementation-guide.mdx`** — A short "Recurring payments" pointer (one
  paragraph + a card link) rather than a full second walkthrough.
- **`docs.json`** — Register `docs/checkout/autopay-mandates` in the Checkout group at the
  placement above.

## Conventions

- Mintlify MDX. Match the existing checkout pages' voice: terse, second person, tables for
  fields/events, `<Warning>`/`<Note>` callouts, `<CardGroup>`/`<Card>` cross-links.
- Reuse the existing curl/JSON code-block style (bash + json fenced blocks, `<API_KEY>` /
  `<ENVIRONMENT_ID>` placeholders).
- Currency examples use `INR` to match the tested flows.

## Out of scope

- Deep internal auto-charge mechanics (token-selection ordering, card-before-UPI preference,
  expiry checks) — kept as behavior context only, not exhaustively documented.
- Any provider other than Razorpay.
- Full end-to-end card-entry walkthrough (card is documented as a config variant of the UPI flow).
- RBI-specific compliance detail (₹15,000 AFA re-authentication threshold, 24h pre-debit
  notifications) — gateway-level; users get it from Razorpay.
- Any multi-attempt dunning/retry cadence — Flexprice's recovery path is a single payment-link
  fallback, not a retry schedule.
