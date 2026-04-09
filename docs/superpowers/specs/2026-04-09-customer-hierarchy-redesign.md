---
name: Customer Hierarchy Documentation Redesign
description: Spec for rewriting customer hierarchy docs to reflect subscription-level billing hierarchy (PR #1535)
type: project
---

# Customer Hierarchy Documentation Redesign

## Context

PR #1535 (Release V2.0.17) removes customer-level parent-child hierarchy and replaces it with subscription-level billing configuration. This spec covers the documentation changes required.

**Key implementation facts verified from PR #1535 source:**

- `parent_customer_id` fully removed from Customer domain model, DTOs, and API responses
- `ParentCustomer` field removed from `CustomerResponse`
- `invoice_billing`, `InvoicingCustomerID`, `InvoicingCustomerExternalID` removed from top-level `CreateSubscriptionRequest`
- New `SubscriptionType` enum: `standalone` | `parent` | `inherited`
- New `inheritance` object on `CreateSubscriptionRequest`:
  ```go
  type SubscriptionInheritanceConfig struct {
      ExternalCustomerIDsToInheritSubscription []string `json:"external_customer_ids_to_inherit_subscription,omitempty"`
      ParentSubscriptionID                     string   `json:"parent_subscription_id,omitempty"`
      InvoicingCustomerExternalID              *string  `json:"invoicing_customer_external_id,omitempty"`
  }
  ```
- Mutual exclusivity: `external_customer_ids_to_inherit_subscription` cannot be combined with `invoicing_customer_external_id` or `parent_subscription_id`
- `POST /subscriptions/{id}/modify/execute` exists but is NOT documented (may change)
- Dashboard fully supports the new model

**Mental model (repeat throughout docs):**
> "Customer = identity, Subscription = contract, Hierarchy = subscription configuration"

---

## Decisions

| Question | Decision |
|---|---|
| Feature name | Customer Hierarchy (unchanged) |
| Page location | `docs/subscriptions/customer-hierarchy.mdx` (moved from customers/) |
| Migration guide | Not needed (feature not in production use) |
| Post-creation flow (`/modify/execute`) | Not documented (unstable, may change) |
| Separate names for two flows | No — both explained under "Customer Hierarchy" |
| Dashboard coverage | Yes — both Dashboard + API documented |
| Leading flow | Flow A (parent creates) leads, Flow B (invoice redirection) follows |

---

## Page Structure: `docs/subscriptions/customer-hierarchy.mdx`

### 1. Overview

- One-line description: decouple who uses the service from who pays for it
- Mental model tagline: **"Customer = identity, Subscription = contract, Hierarchy = subscription configuration"**
- Key point: Customer entity stays flat — no parent fields on customers anymore
- Brief benefits list (3–4 bullets)
- Two-column comparison table showing when to use each mode (see below)

**Comparison table:**

| | Subscription Inheritance | Invoice Redirection |
|---|---|---|
| Plan & line items | Parent subscription | Child subscription |
| Usage tracked on | Child (skeleton sub) | Child (full sub) |
| Invoice goes to | Parent customer | Specified billing customer |
| API field | `inheritance.external_customer_ids_to_inherit_subscription` | `inheritance.invoicing_customer_external_id` |

### 2. How It Works

- Architecture diagram showing: flat customers → subscriptions with types → invoice to billing entity
- Explain `SubscriptionType`:
  - `standalone` — regular subscription, no hierarchy
  - `parent` — owns plan + line items; children's usage rolls up here
  - `inherited` — skeleton subscription auto-created per child; no plan line items, events tracked via parent
- Emphasize: customers are always flat entities — hierarchy lives on the subscription

### 3. Flow A — Subscription Inheritance

**When to use:** One plan governs multiple customers; parent controls pricing and receives the invoice.

**Step 1:** Create parent customer and child customers via Dashboard or API.
- Customers are created normally — no hierarchy fields on customer creation
- Example: "Global Corp HQ" (parent), "APAC Team" and "EMEA Team" (children)

**Step 2:** Create the parent subscription
- Dashboard: Select customer → select plan → fill in "Inheritance" section with child customer IDs
- API: `CreateSubscriptionRequest` with `inheritance.external_customer_ids_to_inherit_subscription`

API shape to document:
```json
POST /subscriptions
{
  "customer_id": "cus_parent",
  "external_customer_id": "ext-parent",
  "plan_id": "plan_enterprise",
  "currency": "usd",
  "billing_period": "month",
  "billing_period_count": 1,
  "inheritance": {
    "external_customer_ids_to_inherit_subscription": ["ext-apac", "ext-emea"]
  }
}
```

**Result:**
- Parent subscription created with `subscription_type: parent`
- Flexprice auto-creates `type: inherited` skeleton subscriptions for each child external ID
- Inherited subs carry no line items — usage events matched via parent subscription
- Invoice generated for parent customer

**Step 3:** Verify — subscription details page shows child skeleton subs linked to parent

### 4. Flow B — Invoice Redirection

**When to use:** Child customer owns their full subscription (plan, line items, usage all at child level), but a billing entity (parent company, reseller) receives and pays the invoice.

**Step 1:** Create child customer and billing customer normally.

**Step 2:** Create subscription for the child customer, specify billing customer
- Dashboard: "Invoice To" field during subscription creation
- API: `inheritance.invoicing_customer_external_id`

API shape to document:
```json
POST /subscriptions
{
  "customer_id": "cus_child",
  "external_customer_id": "ext-child",
  "plan_id": "plan_starter",
  "currency": "usd",
  "billing_period": "month",
  "billing_period_count": 1,
  "inheritance": {
    "invoicing_customer_external_id": "ext-billing-entity"
  }
}
```

**Result:**
- Subscription created with `subscription_type: standalone` on the child
- Usage, plan, entitlements all tracked on child
- Invoice routed to the billing customer (`ext-billing-entity`)
- Billing customer's wallet and payment methods used for settlement

**Important notes:**
- `invoicing_customer_external_id` and `external_customer_ids_to_inherit_subscription` are mutually exclusive
- This setting is set at creation time and cannot be changed later

### 5. Invoice & Payment Behavior

Cover both flows:

| | Flow A (Inheritance) | Flow B (Redirection) |
|---|---|---|
| Usage tracked on | Child customer (via skeleton sub) | Child customer (their own sub) |
| Invoice generated for | Parent customer | Specified billing customer |
| Wallet deducted from | Parent customer | Billing customer |
| Tax applied from | Parent customer billing details | Billing customer billing details |
| Currency | Set at parent subscription | Set at child subscription |

### 6. Use Cases

Tag each by flow:

- **Enterprise with subsidiaries** (Flow A) — HQ receives consolidated invoice; each business unit has usage tracked separately
- **Reseller / partner model** (Flow B) — Reseller pays invoices on behalf of end customers; each customer retains their own subscription
- **Department-level billing** (Flow A or B) — Central IT or Finance handles payment while teams use services independently
- **Multi-brand holding company** (Flow A) — Holding company finance pays for all brand subscriptions

### 7. FAQ

- **Can parent and child subscriptions use different currencies?** — Currency is set at subscription level. In Flow A, the parent subscription's currency applies to all invoices. In Flow B, each subscription has its own currency.
- **How does tax work?** — Tax is determined by the invoicing customer's billing details (parent in Flow A, billing customer in Flow B).
- **How does wallet drawdown work?** — Wallet is deducted from the invoicing customer, not the subscription owner.
- **What happens when the parent subscription is upgraded or downgraded?** — Plan changes apply to the parent subscription. Inherited skeleton subscriptions are not affected directly.
- **What happens when the parent subscription is cancelled?** — Final invoice is generated for the invoicing customer. Inherited skeleton subscriptions are also cancelled.
- **Can I change the invoicing customer after a subscription is created?** — No. This is set at creation time. Cancel and recreate if a change is needed.

---

## Files to Change

| File | Action | Notes |
|---|---|---|
| `docs/subscriptions/customer-hierarchy.mdx` | **Create** | New page, full rewrite per spec above |
| `docs/customers/customer-hierarchy.mdx` | **Delete** | Old customer-level hierarchy page |
| `mint.json` | **Edit** | Move nav entry from Customers section to Subscriptions section |
| `docs/customers/overview.mdx` | **Edit** | Remove any hierarchy references; add cross-link to new page |

---

## Constraints

- Do NOT document `POST /subscriptions/{id}/modify/execute` (unstable)
- Do NOT document `inheritance.parent_subscription_id` (unsupported flow)
- Do NOT mention `parent_customer_id`, `invoice_billing`, or old `invoicing_customer_id` fields
- API shapes must use only fields confirmed from PR #1535 source — no invented fields
- Both Dashboard and API paths must be documented for each flow
