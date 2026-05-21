# Paddle Integration Docs Revamp — Design Spec

**Date:** 2026-05-22  
**Status:** Approved

---

## Background

The Paddle integration has been significantly revamped. Previously, Flexprice only synced customers and invoices to Paddle. The new approach adds **subscription sync**: Flexprice creates a $0 Paddle subscription on every Flexprice subscription creation, which produces a checkout URL the customer uses to save their payment method. Subsequent invoices are synced as Paddle transactions and auto-charged against the saved card.

The existing docs (a single `connection-setup.mdx`) are outdated: wrong webhook events, no subscription flow, no checkout flow documentation.

---

## Goals

- Revamp Paddle docs to accurately reflect the new subscription-sync + checkout-based payment flow
- Match the existing Stripe documentation structure and patterns (MDX, Mermaid diagrams, Steps/Frame/Note components)
- Enable integration teams (like Shadi's team) to self-serve the full setup

---

## File Structure

```
integrations/paddle/
  connection-setup.mdx     ← UPDATE existing file
  integration-workflow.mdx ← NEW file
```

`docs.json` nav update — expand the Paddle group:
```json
{
  "group": "Paddle",
  "icon": "credit-card",
  "pages": [
    "integrations/paddle/connection-setup",
    "integrations/paddle/integration-workflow"
  ]
}
```

---

## Page 1: `connection-setup.mdx` (Update)

### What changes

**Overview bullets:** Remove "Syncing invoices to Paddle as transactions"; add "Syncing subscriptions to Paddle for payment method collection via hosted checkout".

**Webhook events table:** Remove `customer.created` and `address.created`. Keep `transaction.completed`. Add `subscription.activated`.

Final required webhook events:
| Event | Purpose |
|-------|---------|
| `transaction.completed` | Reconcile invoice payments when Paddle charges the saved card |
| `subscription.activated` | Detect when a customer has saved their payment method |

**Next Steps section:** Add link to the new `integration-workflow` page.

### What stays the same
- Step 1: Gather credentials (API Key, Webhook Secret, Client-Side Token)
- Step 2: Configure Paddle checkout defaults + domain approval + webhook destination setup
- Step 3: Create Paddle connection in Flexprice dashboard (with JSON example)
- Security best practices
- Troubleshooting table (update entries to match new flow where needed)
- All existing screenshots (`paddle-api-keys.png`, `paddle-default-payment-link.png`, `paddle-website-approval.png`, `paddle-webhook.png`, `connection.png`)

---

## Page 2: `integration-workflow.mdx` (New)

### Sections

#### 1. Overview
What the integration achieves: Flexprice handles usage-based billing and invoicing; Paddle handles payment method collection and auto-charging.

#### 2. How It Works (Mermaid diagram)
Sequence/flowchart showing the two-phase lifecycle:

**Phase 1 — Subscription & Card Setup:**
```
Create Flexprice subscription
  → Flexprice creates $0 Paddle subscription
  → Returns paddle_checkout_url + paddle_transaction_id in subscription metadata
  → Developer shares checkout URL with customer
  → Customer visits URL, saves card in Paddle overlay
  → subscription.activated webhook fires
```

**Phase 2 — Invoice Auto-Charge:**
```
Flexprice generates invoice
  → Synced as Paddle transaction
  → Paddle auto-charges saved card
  → transaction.completed webhook fires
  → Flexprice reconciles invoice as paid
```

#### 3. Step 1: Create a Subscription
Optional subscription request params:
- `trial_period_days: N` (integer, omit if no trial)

Request JSON example + response example showing metadata with `paddle_checkout_url` and `paddle_transaction_id`.

#### 4. Step 2: Customer Saves Their Card
- Extract `paddle_checkout_url` from subscription response metadata
- Share URL with the customer (embed in app, send via email, etc.)
- Customer opens Paddle-hosted overlay and saves payment method
- Flexprice receives `subscription.activated` webhook — card is now on file

Note callout: The customer must save their card before Flexprice raises the first invoice, or the auto-charge will fail.

#### 5. Step 3: Invoice Auto-Charge
- Flexprice generates an invoice on the billing cycle
- Invoice is synced to Paddle as a transaction
- Paddle charges the saved card automatically
- `transaction.completed` webhook fires
- Flexprice marks the invoice as paid and reconciles amounts

Note: If Paddle adds tax on top of the invoice amount, Flexprice may mark the invoice as overpaid. Align tax mode (internal vs. external) in Paddle with your pricing setup.

#### 6. Trial Periods (optional)
- Pass `trial_period_days` in the subscription request
- During trial, no invoice is generated; subscription status is `trialing`
- The checkout URL is still returned immediately — prompt customers to save their card during the trial window so charging works when billing begins
- `subscription.activated` fires when the card is saved (not when the trial ends)
- Link to trialing docs: `/docs/subscriptions/workflows/trialing`

#### 7. Customer & Address Sync
- Sync is on-demand, Flexprice → Paddle
- Triggered automatically during subscription and invoice operations
- Paddle requires a customer address (at minimum: country) to create transactions

#### 8. Troubleshooting
| Issue | Cause | Solution |
|-------|-------|----------|
| No `paddle_checkout_url` in metadata | Subscription not linked to Paddle | Check that a Paddle connection exists in your Flexprice environment |
| `transaction.completed` not received | Webhook not configured or wrong events selected | Verify webhook destination in Paddle → select both required events |
| Invoice not auto-charged | Customer hasn't saved card yet | Share checkout URL; wait for `subscription.activated` before expecting charges |
| Invoice sync fails — "Paddle address ID not found" | Customer missing country | Add country to customer address in Flexprice |
| Invoice marked overpaid | Paddle added tax on top of invoice amount | Align tax mode (internal vs. external) in Paddle settings |

---

## Documentation Patterns to Follow

From the existing Stripe docs:
- `<Frame>` for screenshots
- `<Steps>` / `<Step>` for sequential setup steps
- `<Note>` for callouts
- Mermaid diagrams (`graph TD` or `sequenceDiagram`) for flows
- Tables for fields, status definitions, and troubleshooting
- JSON code blocks for request/response examples

---

## Images

Reuse existing screenshots where applicable:
- `images/docs/integrations/paddle/paddle-api-keys.png`
- `images/docs/integrations/paddle/paddle-default-payment-link.png`
- `images/docs/integrations/paddle/paddle-website-approval.png`
- `images/docs/integrations/paddle/paddle-webhook.png`

New screenshots (from Flexprice dashboard) may be requested from the team for:
- The Paddle connection form (already exists as `flexpirce_connection_screen_paddle.png` in root)

---

## Out of Scope
- Changes to Razorpay, Stripe, or other integration docs
- API reference changes
- New screenshots (reuse existing; can be added later)
