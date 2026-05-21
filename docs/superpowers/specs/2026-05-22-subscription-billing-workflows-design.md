# Subscription Billing Workflows — Documentation Design Spec

**Date:** 2026-05-22  
**Branch:** feat/sub-types  
**Author:** omkar273 + Claude  
**Status:** Approved by user

---

## Problem Statement

FlexPrice now supports four distinct subscription billing workflows:
`standalone`, `parent/inherited` (consolidated billing), `delegated_invoicing`, and `grouped_invoicing`.

The existing `customer-hierarchy.mdx` only covers two of these (consolidated + delegated payer), uses confusing naming ("Customer Hierarchy" implies customer-level fields, but hierarchy lives on subscriptions), and omits:
- Grouped invoicing (entirely new feature)
- Post-creation modification APIs
- Analytics `include_children` flag
- Full validation rules

**Goal:** Create a developer-friendly, use-case-first documentation section that maps each real-world billing problem to the correct FlexPrice workflow, with validated API examples and inline constraints sourced from the backend codebase.

---

## Architecture Decision

### Approach selected: Multi-page "Billing Workflows" hub

One nav group under Subscriptions. One hub page for decision-making. One focused page per workflow. `customer-hierarchy.mdx` kept as a cross-reference stub.

**Competitor basis:**
- Lago pattern: short focused pages, always Dashboard + API tabs side-by-side
- Stripe pattern: use-case-first, then model, then implementation
- Metronome pattern: business model decision before technical details
- Chargebee: avoid (single mega-page, hard to maintain)

---

## Navigation Structure

```
docs.json (Subscriptions group):
  Billing Workflows/
    overview                              ← "Which workflow do I need?"
    standalone                            ← default, minimal
    consolidated-billing                  ← enterprise / subsidiary rollup
    delegated-invoicing                   ← reseller / central payer
    grouped-invoicing                     ← multi-subscription invoice merge
  customer-hierarchy                      ← kept, updated with cross-reference banner
```

**File paths:**
```
docs/subscriptions/billing-workflows/overview.mdx
docs/subscriptions/billing-workflows/standalone.mdx
docs/subscriptions/billing-workflows/consolidated-billing.mdx
docs/subscriptions/billing-workflows/delegated-invoicing.mdx
docs/subscriptions/billing-workflows/grouped-invoicing.mdx
docs/subscriptions/customer-hierarchy.mdx   (modified, not deleted)
docs.json                                   (modified)
```

---

## Use Case → Workflow Mapping

| Workflow | Opening use case | `subscription_type` result | Who receives the invoice |
|---|---|---|---|
| Standalone | "Each customer is independent — their own subscription, invoice, and wallet" | `standalone` | Subscriber |
| Consolidated Billing | "Enterprise HQ buys one plan; APAC, EMEA, Americas generate usage — one invoice to HQ" | `parent` + `inherited` (auto-created) | Parent customer |
| Delegated Invoicing | "Reseller signs up 10 clients; each has their own plan and usage — reseller pays all invoices" | `standalone` with `invoicing_customer_id` set | Delegated payer |
| Grouped Invoicing | "Company runs analytics, storage, and compute as 3 separate subscriptions; Finance wants one monthly invoice" | `grouped_invoicing` (children) + `parent` | Parent subscription's customer |

---

## Per-Page Structure (applied to all 4 workflow pages)

```
1. Overview (2-sentence problem statement + "subscription_type" this creates)
2. How it works (Mermaid flow or bullet list + key properties table)
3. When to use (3 concrete business scenarios)
4. Prerequisites (what must exist in FlexPrice before calling the API)
5. Configure (<Tabs> Dashboard | API)
6. Post-creation changes (modify API where applicable)
7. Analytics (include_children for consolidated; N/A for others)
8. Validations & constraints (inline <Note>/<Warning> per rule, sourced from code)
9. Related workflows (<CardGroup> cross-links at bottom)
```

---

## API Contracts (validated against source)

### Source files verified:
- `internal/api/dto/subscription.go` — `CreateSubscriptionRequest`, `SubscriptionInheritanceConfig`
- `internal/api/dto/subscription_modification.go` — `ExecuteSubscriptionModifyRequest`, `SubModifyInheritanceRequest`, `SubModifyGroupedInvoicingParams`
- `internal/types/subscription.go` — `SubscriptionType` enum
- `internal/service/subscription.go` — `prepareSubscriptionInheritanceForCreate`, `validateNoInheritedSubForSubscriber`
- `internal/service/subscription_grouped_invoicing.go` — `validateAddToGroupedInvoicing`, `addToGroupedInvoicing`, `removeFromGroupedInvoicing`
- `internal/api/dto/events.go` — `IncludeChildren` field

### Create Subscription endpoint
`POST /subscriptions`

**Standalone** (no `inheritance` block):
```json
{
  "customer_id": "cus_...",
  "plan_id": "plan_...",
  "currency": "usd",
  "billing_period": "month",
  "billing_period_count": 1
}
```

**Consolidated Billing** (creates `parent` subscription + `inherited` skeletons per child):
```json
{
  "customer_id": "cus_hq",
  "plan_id": "plan_enterprise",
  "currency": "usd",
  "billing_period": "month",
  "billing_period_count": 1,
  "inheritance": {
    "external_customer_ids_to_inherit_subscription": ["ext-apac", "ext-emea"]
  }
}
```

**Delegated Invoicing** (creates `standalone` subscription, invoice goes to `invoicing_customer`):
```json
{
  "customer_id": "cus_child",
  "plan_id": "plan_starter",
  "currency": "usd",
  "billing_period": "month",
  "billing_period_count": 1,
  "inheritance": {
    "invoicing_customer_external_id": "ext-reseller"
  }
}
```

**Grouped Invoicing at creation** (creates `parent` + converts existing `standalone` subs to `grouped_invoicing`):
```json
{
  "customer_id": "cus_parent",
  "plan_id": "plan_base",
  "currency": "usd",
  "billing_period": "month",
  "billing_period_count": 1,
  "inheritance": {
    "subscriptions_ids_for_grouped_invoicing": ["sub_analytics", "sub_storage"]
  }
}
```

### Modify Subscription endpoint
`POST /subscriptions/:id/modify/execute`
`POST /subscriptions/:id/modify/preview`

**Add inherited children post-creation:**
```json
{
  "type": "inheritance",
  "inheritance_params": {
    "external_customer_ids_to_inherit_subscription": ["ext-new-team"]
  }
}
```

**Add subscription to grouped invoicing:**
```json
{
  "type": "grouped_invoicing",
  "grouped_invoicing_params": {
    "action": "add",
    "parent_subscription_id": "sub_parent",
    "child_subscription_ids": ["sub_compute"]
  }
}
```

**Remove subscription from grouped invoicing:**
```json
{
  "type": "grouped_invoicing",
  "grouped_invoicing_params": {
    "action": "remove",
    "child_subscription_ids": ["sub_compute"]
  }
}
```

### Analytics endpoint (consolidated billing only)
`POST /events/analytics`
```json
{
  "external_customer_id": "ext-global-hq",
  "start_time": "2026-05-01T00:00:00Z",
  "end_time": "2026-05-31T23:59:59Z",
  "include_children": true
}
```

---

## Validation Rules per Workflow (sourced from service code)

### Consolidated Billing (`inheritance.external_customer_ids_to_inherit_subscription`)
| Rule | Source | Doc treatment |
|---|---|---|
| Cannot combine with `invoicing_customer_external_id` | `SubscriptionInheritanceConfig.Validate()` | `<Note>` in prerequisites |
| Cannot combine with `subscriptions_ids_for_grouped_invoicing` | `SubscriptionInheritanceConfig.Validate()` | `<Note>` in prerequisites |
| Child customer cannot already have an inherited subscription | `validateNoInheritedSubForSubscriber()` | `<Warning>` in configure section |
| Inherited subscription cannot be cancelled directly | `subscription.go:1787` | `<Warning>` in lifecycle section |
| Parent cascades pause/resume/cancel to all inherited children | `CascadeCancelToInheritedSubscriptions()` | `<Note>` in lifecycle section |
| Inherited children have no billable usage via `getCustomerUsageSummary` | `subscription.go:5538` | `<Warning>` in analytics section |

### Delegated Invoicing (`inheritance.invoicing_customer_external_id`)
| Rule | Source | Doc treatment |
|---|---|---|
| Invoicing customer must be active (status = published) | `prepareSubscriptionInheritanceForCreate()` | `<Note>` in prerequisites |
| Invoicing customer is immutable after creation | `customer-hierarchy.mdx` + code | `<Warning>` in configure section |
| Cannot combine with `external_customer_ids_to_inherit_subscription` | `SubscriptionInheritanceConfig.Validate()` | `<Note>` in prerequisites |
| Subscription type resolves to `standalone` (not a new type) | `prepareSubscriptionInheritanceForCreate()` | Inline explanation |

### Grouped Invoicing (`subscriptions_ids_for_grouped_invoicing` / modify API)
| Rule | Source | Doc treatment |
|---|---|---|
| Child must be `standalone` type | `validateAddToGroupedInvoicing()` line 21 | `<Warning>` in prerequisites |
| Child must be `active` or `trialing` | `validateAddToGroupedInvoicing()` line 32 | `<Warning>` in prerequisites |
| Child must not already have a parent | `validateAddToGroupedInvoicing()` line 44 | `<Warning>` in prerequisites |
| Parent must be `parent` or `standalone` (auto-promoted) | `validateAddToGroupedInvoicing()` line 55 | `<Note>` in how it works |
| Parent must be `active` or `trialing` | `validateAddToGroupedInvoicing()` line 67 | `<Warning>` in prerequisites |
| `billing_period` must match | `validateAddToGroupedInvoicing()` line 79 | `<Warning>` in configure section |
| `billing_period_count` must match | `validateAddToGroupedInvoicing()` line 90 | `<Warning>` in configure section |
| Billing anchor (day-of-month + time) must match | `validateAddToGroupedInvoicing()` line 106 | `<Warning>` in configure section |
| `currency` must match | `validateAddToGroupedInvoicing()` line 117 | `<Warning>` in configure section |
| Child `start_date` ≥ parent `start_date` | `validateAddToGroupedInvoicing()` line 130 | `<Note>` in configure section |
| Addition takes effect at next billing period boundary | comment at `addToGroupedInvoicing()` line 145 | `<Note>` in timing section |
| Removal applies to entire current period (child invoiced independently) | comment at `removeFromGroupedInvoicing()` line 177 | `<Note>` in timing section |
| Cannot combine `subscriptions_ids_for_grouped_invoicing` with `parent_subscription_id` at creation | `SubscriptionInheritanceConfig.Validate()` | `<Note>` in configure section |

---

## Mutual Exclusion Matrix

| Field | Can combine with `external_customer_ids_to_inherit_subscription` | Can combine with `invoicing_customer_external_id` | Can combine with `subscriptions_ids_for_grouped_invoicing` | Can combine with `parent_subscription_id` |
|---|---|---|---|---|
| `external_customer_ids_to_inherit_subscription` | — | ❌ | ❌ | ❌ |
| `invoicing_customer_external_id` | ❌ | — | ❌ | ✅ (implied) |
| `subscriptions_ids_for_grouped_invoicing` | ❌ | ❌ | — | ❌ |
| `parent_subscription_id` | ❌ | ✅ (implied) | ❌ | — |

---

## `customer-hierarchy.mdx` Update Plan

- Add a `<Note>` banner at the top pointing to the new Billing Workflows section
- Keep body for backwards link compatibility (SEO + existing bookmarks)
- Eventually: redirect once new pages have enough traffic

---

## Self-Review Checklist

- [x] No TBD or incomplete sections
- [x] All API field names verified against `internal/api/dto/subscription.go`
- [x] All validation rules sourced to specific file + line number
- [x] Mutual exclusion matrix complete
- [x] Modify API types verified against `internal/api/dto/subscription_modification.go`
- [x] `include_children` verified in `internal/api/dto/events.go:339`
- [x] `SubscriptionType` enum verified in `internal/types/subscription.go`
- [x] Navigation structure matches existing `docs.json` format
- [x] `customer-hierarchy.mdx` treatment defined (update, not delete)
- [x] Per-page structure is consistent across all 4 workflow pages
- [x] Each workflow page leads with a concrete use case before technical definition

---

## Files Checklist for Implementation

| File | Action | Notes |
|---|---|---|
| `docs/subscriptions/billing-workflows/overview.mdx` | Create | Hub page, decision table |
| `docs/subscriptions/billing-workflows/standalone.mdx` | Create | Short page, default behavior |
| `docs/subscriptions/billing-workflows/consolidated-billing.mdx` | Create | Replaces customer-hierarchy §1 |
| `docs/subscriptions/billing-workflows/delegated-invoicing.mdx` | Create | Replaces customer-hierarchy §2 |
| `docs/subscriptions/billing-workflows/grouped-invoicing.mdx` | Create | All-new |
| `docs/subscriptions/customer-hierarchy.mdx` | Update | Add cross-reference banner |
| `docs.json` | Update | Add "Billing Workflows" nav group |
