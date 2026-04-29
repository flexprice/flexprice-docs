# Trialing Documentation — Design Spec

**Date:** 2026-04-30  
**Output file:** `docs/subscriptions/workflows/trialing.mdx`  
**Nav placement:** `Subscriptions → Subscription Workflows → Trialing`  
**Format:** Single-page, API-first, lifecycle-first narrative (Option A)  
**Source PR:** https://github.com/flexprice/flexprice/pull/1667

---

## Decisions

- Single page, no sub-pages.
- API-first: `curl` examples + field tables. No UI screenshots.
- Lifecycle diagram (ASCII text) leads the narrative — everything else flows from the state machine.
- No fictional features: only what is in the PR is documented.

---

## Section 1 — Overview

**Content:**
- Trialing is a subscription status in FlexPrice that allows a customer to use a plan for a defined period before billing begins.
- When a subscription enters `trialing` status, no invoice is generated. Billing starts only after the trial ends.
- Typical SaaS use cases: product-led growth, freemium-to-paid conversion, enterprise evaluation periods.

---

## Section 2 — How It Works

**Content: State machine**

```
[trialing] ---(trial_end reached)---> [incomplete] ---(invoice paid / zero amount)---> [active]
```

Each state explained:

| Status | What it means | Billing |
|---|---|---|
| `trialing` | Trial window is active | No invoice generated |
| `incomplete` | Trial ended, invoice issued | Awaiting payment |
| `active` | Trial converted, billing live | Normal billing cycle begins |

**Key facts to include:**
- `CurrentPeriodStart` = `TrialStart`, `CurrentPeriodEnd` = `TrialEnd` while trialing.
- At trial end: `BillingAnchor` resets to `TrialEnd`. First billing period runs from `TrialEnd` to `TrialEnd + billingPeriod`. No short first period.
- Trial-end detection is automated via a Temporal schedule (runs continuously; no manual trigger needed).

---

## Section 3 — Configuring a Trial Period

**Two-step setup — this is the critical non-obvious part:**

### Step 1: Set `trial_period_days` on the price

- `trial_period_days` is a field on **recurring fixed prices** only.
- Cannot be set on usage-based or tiered prices.
- Must be `>= 0`. Default is `0` (no trial).

`curl` example: `POST /v1/prices` with `trial_period_days: 14`.

Show request + abbreviated response with `trial_period_days` confirmed.

### Step 2: Create a subscription — trial inherited automatically

- If the plan's recurring fixed prices all share the same `trial_period_days`, the subscription inherits it.
- Subscription is created with `status: trialing`, `trial_start`, `trial_end` populated.
- No invoice is created at this point.

`curl` example: `POST /v1/subscriptions` — standard request, no trial fields needed.

Show response: `status: "trialing"`, `trial_start`, `trial_end`, `current_period_start`, `current_period_end`.

### Override: controlling trial days at subscription creation

- Pass `trial_period_days` in the subscription request to override the plan-level value.
- `trial_period_days: 0` explicitly disables the trial even if the plan price has one.
- `trial_period_days: 7` overrides a 14-day plan trial to 7 days.

Short `curl` example showing override.

---

## Section 4 — What Happens at Trial End

**Content:**

Trial end is fully automated. When `trial_end <= now`:

1. Flexprice sets subscription status to `incomplete`.
2. `BillingAnchor` is reset to `trial_end`.
3. A `SUBSCRIPTION_TRIAL_END` invoice is created for the first billing period (`trial_end` to `trial_end + billing_period`).
4. If the invoice amount is zero → subscription immediately converts to `active` (no payment needed).
5. If the invoice has a non-zero amount → subscription stays `incomplete` until payment is confirmed.

**`payment_behavior` interaction:**
- `allow_incomplete`: Stays `incomplete` if payment fails. Default.
- `default_active`: Activates regardless of payment result.

**Credit grants:** Any credit grants held pending activation are applied when `active` is reached.

---

## Section 5 — API Reference

### `trial_period_days` on Price (`POST /v1/prices`)

| Field | Type | Required | Description |
|---|---|---|---|
| `trial_period_days` | integer | No | Days of free trial. Default `0`. Only valid for `BILLING_CADENCE_RECURRING` + `PRICE_TYPE_FIXED` prices. Must be `>= 0`. |

### `trial_period_days` on Subscription (`POST /v1/subscriptions`)

| Field | Type | Required | Description |
|---|---|---|---|
| `trial_period_days` | integer | No | Override trial length. `0` disables trial. Omit to inherit from plan prices. |

### Subscription response fields (trial-related)

| Field | Type | Description |
|---|---|---|
| `status` | string | `trialing` when in trial window |
| `trial_start` | timestamp | When the trial began (equals `start_date`) |
| `trial_end` | timestamp | When the trial ends and billing begins |
| `current_period_start` | timestamp | Equals `trial_start` during trial |
| `current_period_end` | timestamp | Equals `trial_end` during trial |

---

## Section 6 — Webhooks & Events

**Only one event fires in the trial lifecycle:**

`subscription.activated` — fired when the subscription converts from `trialing` to `active`, either via:
- Payment of the `SUBSCRIPTION_TRIAL_END` invoice, or
- Zero-amount trial-end invoice (immediate conversion).

**Note:** There is no `subscription.trialing`, `subscription.trial_ended`, or `subscription.trial_ending` event in the current implementation. Use `subscription.activated` to detect trial conversion.

Payload: standard subscription object with `status: "active"`.

---

## Section 7 — Edge Cases

| Scenario | Behavior |
|---|---|
| `trial_period_days = 0` at subscription level | Trial disabled even if plan price has trial days |
| Mismatched `trial_period_days` across plan prices | Subscription creation fails: "all recurring fixed plan prices must have the same trial_period_days" |
| Cancellation during trial | Standard cancellation applies. Trial-end cron skips non-trialing subscriptions. |
| Paused subscription at trial end | Trial-end processing is skipped. Resumes when subscription is unpaused. |
| Zero-amount trial-end invoice | Subscription auto-activates immediately. No payment required. |
| Inherited (child) subscriptions | Status cascades from parent. Children are not processed independently by the trial-end cron. |
| Re-trialing | Not supported. Each subscription supports one trial window. |

---

## Section 8 — Best Practices

1. **Collect a payment method before trial ends.** FlexPrice does not block trialing subscriptions without payment methods — but trial-end invoices will fail if no method is on file. Prompt users to add payment details during the trial.
2. **Set `payment_behavior` explicitly.** Default is `allow_incomplete`, which leaves the subscription in `incomplete` if payment fails at trial end. Use `default_active` only if you want to activate regardless of payment.
3. **Use `subscription.activated` to gate access.** Listen for this webhook to provision full access — it fires for both trial conversions and normal activations, so your handler needs no special-casing.
4. **Test with zero-amount prices in staging.** Set your plan price to `$0` to fast-path through `trialing → active` without needing a real payment flow.
5. **Don't rely on re-trialing.** Each subscription gets one trial window. If you need to extend a trial, cancel and recreate the subscription — or contact support for direct db tooling.

---

## Technical constraints / things NOT to document

- `trial_start` / `trial_end` internal fields on `CreateSubscriptionRequest` are JSON-tagged `-` and not accepted from the public API. Do not document them as user-facing fields.
- Pause/resume API endpoints were removed in this PR. Do not reference them in context of trials.
- Temporal schedule internals (`subscription-trial-end-due`) are infrastructure detail — not user-facing.
- The deprecated cron HTTP endpoint `POST /v1/cron/subscriptions/process-trial-end-due` should not be documented.
