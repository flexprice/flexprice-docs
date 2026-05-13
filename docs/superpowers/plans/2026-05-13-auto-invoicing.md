# Auto Invoicing Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write the Auto Invoicing documentation page and wire it into the FlexPrice docs navigation.

**Architecture:** Two file changes — create `docs/subscriptions/auto-invoice-threshold.mdx` with the full page content, and add the page to the Subscriptions group in `docs.json`. No new directories needed.

**Tech Stack:** Mintlify MDX, docs.json nav config, existing FlexPrice doc patterns (trialing.mdx, commitment.mdx).

**Spec:** `docs/superpowers/specs/2026-05-13-auto-invoicing-design.md`

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Create | `docs/subscriptions/auto-invoice-threshold.mdx` | The full Auto Invoicing doc page |
| Modify | `docs.json` line 176 | Add page to Subscriptions nav group |

---

### Task 1: Create the Auto Invoicing MDX page

**Files:**
- Create: `docs/subscriptions/auto-invoice-threshold.mdx`

- [ ] **Step 1: Create the file with the full content below**

Create `docs/subscriptions/auto-invoice-threshold.mdx` with exactly this content:

```mdx
---
title: "Auto Invoicing"
description: "Automatically trigger mid-period invoices when a subscription's current-period usage crosses a defined threshold"
---

## Overview

Auto Invoicing lets you set a usage amount threshold on a subscription. When the customer's billed usage for the current period reaches that amount, FlexPrice automatically creates and finalizes a mid-period invoice — without waiting for the period to end. This is useful for high-volume customers where waiting until period end creates cash flow or fraud risk.

## How It Works

1. You set `auto_invoice_threshold` on a subscription (e.g. $500).
2. FlexPrice evaluates usage every **5 minutes** against the current window (`current_period_start` → now).
3. When usage ≥ threshold, a mid-period invoice is created and finalized immediately.
4. The current period window advances to the moment the invoice was issued — usage resets and the threshold applies fresh for the next window.
5. At period end, a normal invoice is issued for remaining usage.

<Note>
Only **arrear usage charges** count toward the threshold. Fixed or advance charges are excluded. The invoice amount may slightly exceed the threshold since evaluation happens on a 5-minute interval, not in real time.
</Note>

## Configuring Auto Invoicing

<Tabs>
  <Tab title="Dashboard">
    1. Navigate to the **Subscriptions** section and open or create a subscription.
    2. Locate the **Auto Invoicing** section.
    3. Enter your threshold amount.
    4. Save the subscription.

    <Frame>
      ![Auto Invoicing configuration](/public/images/docs/Subscriptions/AutoInvoicing/auto-invoicing-config.png)
    </Frame>
  </Tab>
  <Tab title="API">
    Pass `auto_invoice_threshold` when creating a subscription:

    ```bash
    curl -X POST https://api.flexprice.io/v1/subscriptions \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "customer_id": "cust_01xyz",
        "plan_id": "plan_01abc",
        "currency": "USD",
        "billing_cadence": "RECURRING",
        "billing_period": "MONTHLY",
        "billing_period_count": 1,
        "start_date": "2025-05-01T00:00:00Z",
        "auto_invoice_threshold": "500.00"
      }'
    ```

    Response (abbreviated):

    ```json
    {
      "id": "sub_01def456",
      "status": "active",
      "auto_invoice_threshold": "500.00",
      "current_period_start": "2025-05-01T00:00:00Z",
      "current_period_end": "2025-06-01T00:00:00Z"
    }
    ```
  </Tab>
</Tabs>

<Note>
`auto_invoice_threshold` is set at the subscription level, not the plan level. Each subscription can have its own threshold. The value cannot be changed after the subscription is created.
</Note>

## Invoicing Behavior

| Scenario | Behavior |
|---|---|
| Usage reaches threshold | Mid-period invoice created and finalized immediately |
| Usage below threshold at period end | Normal period-end invoice covers all remaining usage |
| Threshold not set (`null`) | No mid-period invoicing; standard billing applies |

## API Reference

### Subscription create fields

| Field | Type | Required | Description |
|---|---|---|---|
| `auto_invoice_threshold` | string (decimal) | No | Usage amount that triggers a mid-period invoice. Must be > 0. `null` disables auto invoicing. Immutable after creation. |

### Subscription response fields

| Field | Type | Description |
|---|---|---|
| `auto_invoice_threshold` | string (decimal), nullable | The configured threshold for this subscription. `null` if not set. |

## Edge Cases

| Scenario | Behavior |
|---|---|
| Threshold set to `0` or negative | Validation error — must be > 0 |
| Inherited (child) subscriptions | Not supported — only standalone subscriptions |
| Subscription paused when threshold is crossed | Evaluation skipped; resumes when subscription is active |
| Multiple cron runs before threshold | Each run checks cumulatively; only the run that crosses the threshold triggers the invoice |

## Best Practices

**Set thresholds proportional to expected spend.** A threshold at 50–80% of expected monthly spend avoids too-frequent invoices while still providing early billing signals.

**Ensure your payment method handles mid-period invoices.** Auto-invoiced invoices are finalized immediately. Make sure your payment collection flow can process charges outside the normal billing cycle.

**Monitor via invoice webhooks.** No new webhook event type is introduced for threshold billing. Listen to standard invoice creation and finalization events — the invoice billing reason is `AUTO_INVOICE_THRESHOLD`, which you can use to distinguish these from regular period-end invoices.

**Do not rely on real-time triggering.** There is up to a 5-minute delay between crossing the threshold and invoice creation. Do not use this feature for hard real-time spend caps.
```

- [ ] **Step 2: Verify the file was created correctly**

Run:
```bash
head -5 docs/subscriptions/auto-invoice-threshold.mdx
```

Expected output:
```
---
title: "Auto Invoicing"
description: "Automatically trigger mid-period invoices when a subscription's current-period usage crosses a defined threshold"
---
```

- [ ] **Step 3: Commit**

```bash
git add docs/subscriptions/auto-invoice-threshold.mdx
git commit -m "docs(subscriptions): add auto invoicing page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Add page to docs.json navigation

**Files:**
- Modify: `docs.json` — Subscriptions group pages array

- [ ] **Step 1: Add the page entry to the Subscriptions group**

In `docs.json`, locate the Subscriptions group pages array (around line 158–178). Add `"docs/subscriptions/auto-invoice-threshold"` after `"docs/subscriptions/commitment"`:

Before:
```json
              "docs/subscriptions/commitment",
              "docs/subscriptions/reservation-discount"
```

After:
```json
              "docs/subscriptions/commitment",
              "docs/subscriptions/auto-invoice-threshold",
              "docs/subscriptions/reservation-discount"
```

- [ ] **Step 2: Verify the JSON is still valid**

Run:
```bash
python3 -c "import json; json.load(open('docs.json')); print('valid')"
```

Expected output:
```
valid
```

- [ ] **Step 3: Verify the page appears in the correct location**

Run:
```bash
python3 -c "
import json
d = json.load(open('docs.json'))
subs = next(g for tab in d['tabs'] for g in tab.get('groups', []) if g.get('group') == 'Subscriptions')
print([p for p in subs['pages'] if isinstance(p, str)])
"
```

Expected output includes `'docs/subscriptions/auto-invoice-threshold'` between `commitment` and `reservation-discount`.

- [ ] **Step 4: Commit**

```bash
git add docs.json
git commit -m "docs(nav): add auto invoicing to subscriptions navigation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task that covers it |
|---|---|
| Title: "Auto Invoicing" | Task 1 — frontmatter |
| Description subtitle | Task 1 — frontmatter |
| Overview paragraph | Task 1 — Overview section |
| How it works (5 steps + Note) | Task 1 — How It Works section |
| UI configuration with Frame placeholder | Task 1 — Configuring, Dashboard tab |
| API curl example + response | Task 1 — Configuring, API tab |
| Note: subscription-level, immutable | Task 1 — Note after Configuring |
| Invoicing Behavior table (3 rows) | Task 1 — Invoicing Behavior section |
| API Reference field tables | Task 1 — API Reference section |
| Edge Cases table (4 rows) | Task 1 — Edge Cases section |
| Best Practices (4 bullets) | Task 1 — Best Practices section |
| Nav placement: top-level Subscriptions after commitment | Task 2 — docs.json |

All spec requirements covered. No gaps.
