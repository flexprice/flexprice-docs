# Auto Invoicing — Doc Design Spec

**Date:** 2026-05-13  
**Feature:** Auto Invoicing (`auto_invoice_threshold`)  
**PR:** flexprice/flexprice#1769  
**Doc file:** `docs/subscriptions/auto-invoice-threshold.mdx`  
**Nav placement:** Top-level Subscriptions group (alongside Commitment)

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Feature name in docs | "Auto Invoicing" | Mirrors API field, user-approved |
| Doc location | `docs/subscriptions/auto-invoice-threshold.mdx` | Prominence, same level as Commitment |
| Structure | Hybrid (Option C) | Balance of concept + task; non-obvious mechanics need brief explanation |
| Images | Dummy placeholders | UI is being built in parallel; user will replace |

---

## Structure

### 1. Frontmatter

```
title: "Auto Invoicing"
description: "Automatically trigger mid-period invoices when a subscription's current-period usage crosses a defined threshold"
```

### 2. Overview

~3 sentences. Auto Invoicing lets you set a usage amount threshold on a subscription. When the customer's billed usage for the current period reaches that amount, FlexPrice automatically creates and finalizes a mid-period invoice — without waiting for the period to end. Useful for high-volume customers where waiting until period end creates cash flow or fraud risk.

### 3. How It Works

Numbered list + one `<Note>` callout:

1. Set `auto_invoice_threshold` on a subscription (e.g. $500).
2. FlexPrice evaluates usage every **5 minutes** against the current window (`current_period_start` → now).
3. When usage ≥ threshold, a mid-period invoice is created and finalized immediately.
4. The current period window advances to the moment the invoice was issued — usage resets and the threshold applies fresh for the next window.
5. At period end, a normal invoice is issued for remaining usage.

`<Note>`: Only **arrear usage charges** count toward the threshold. Fixed or advance charges are excluded. The invoice amount may slightly exceed the threshold since evaluation happens on a 5-minute interval, not in real time.

### 4. Configuring

Two tabs — UI and API.

**UI tab:** Steps with `<Frame>` placeholder. "Navigate to Subscriptions → create or edit a subscription → find the Auto Invoicing section → enter the threshold amount."

**API tab:** `curl` POST to `/v1/subscriptions` with `auto_invoice_threshold: "500.00"` and abbreviated JSON response showing field returned.

`<Note>`: `auto_invoice_threshold` is set at the subscription level, not the plan level. Each subscription can have its own threshold.

### 5. Invoicing Behavior

Table (3 rows — zero-amount invoice row excluded per user decision):

| Scenario | Behavior |
|---|---|
| Usage reaches threshold | Mid-period invoice created and finalized immediately |
| Usage below threshold at period end | Normal period-end invoice covers all remaining usage |
| Threshold not set (`null`) | No mid-period invoicing; standard billing applies |

### 6. API Reference

Field table for subscription create:

| Field | Type | Required | Description |
|---|---|---|---|
| `auto_invoice_threshold` | string (decimal) | No | Usage amount that triggers a mid-period invoice. Must be > 0. `null` disables auto invoicing. |

Subscription response field: `auto_invoice_threshold` (string decimal, nullable).

### 7. Edge Cases

| Scenario | Behavior |
|---|---|
| Threshold set to `0` or negative | Validation error — must be > 0 |
| Inherited (child) subscriptions | Not supported — only standalone subscriptions |
| Subscription paused when threshold is crossed | Evaluation skipped; resumes when subscription is active |
| Multiple cron runs before threshold | Each run checks cumulatively; only the run that crosses the threshold triggers the invoice |

### 8. Best Practices

- Set thresholds relative to your billing period amount (e.g. 50–80% of expected monthly spend) to avoid too-frequent invoices.
- Ensure your payment collection method can handle mid-period invoices.
- Monitor invoice creation webhooks to detect when thresholds are crossed.
- Do not rely on real-time triggering — there is up to a 5-minute delay between crossing the threshold and invoice creation.

---

## Technical Facts (from PR review)

- Field: `auto_invoice_threshold` — `*decimal.Decimal`, nullable, set at subscription creation, **immutable** after creation
- DB column: `subscriptions.auto_invoice_threshold` (`decimal(20,6)`, nullable)
- Cron: `subscription-auto-invoice-threshold-billing`, every 5 minutes via Temporal
- Batch size: 1,000 subscriptions per run
- Billing reason on invoice: `AUTO_INVOICE_THRESHOLD`
- Only standalone subscriptions (`subscription_type = standalone`) are eligible
- Subscription must be `active` status to be evaluated
- After invoice creation, `current_period_start` advances to `now` atomically in same DB transaction
- No new webhook event types introduced; existing invoice webhooks fire
- Arrear usage only (uses `InvoiceFlowRenewal` + `ReferencePointPeriodEnd`)
