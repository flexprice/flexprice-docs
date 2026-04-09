# Customer Hierarchy Documentation Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Customer Hierarchy docs to reflect subscription-level billing hierarchy from PR #1535 — removing all customer-level parent fields and documenting two subscription-level flows (Subscription Inheritance and Invoice Redirection).

**Architecture:** Single new MDX page at `docs/subscriptions/customer-hierarchy.mdx`. `docs.json` nav already places the page under Subscriptions (the path just needs updating). Old page at `docs/customers/customer-hierarchy.mdx` is deleted. `docs/customers/overview.mdx` gets a brief cross-link added.

**Tech Stack:** Mintlify MDX, docs.json navigation config

---

## File Map

| Action | File | What changes |
|---|---|---|
| Create | `docs/subscriptions/customer-hierarchy.mdx` | Full new page (7 sections) |
| Delete | `docs/customers/customer-hierarchy.mdx` | Remove old customer-level hierarchy page |
| Edit | `docs.json` | Update nav path from `docs/customers/customer-hierarchy` → `docs/subscriptions/customer-hierarchy` |
| Edit | `docs/customers/overview.mdx` | Add one cross-link sentence pointing to hierarchy page |

---

## Task 1: Update docs.json nav path

**Files:**
- Modify: `docs.json` (line 153 — the Subscriptions group)

The nav already has `docs/customers/customer-hierarchy` under the Subscriptions group. Just update the path to point to the new location.

- [ ] **Step 1: Open `docs.json` and find the Subscriptions group**

The current entry at line ~153 reads:
```json
"docs/customers/customer-hierarchy",
```
Change it to:
```json
"docs/subscriptions/customer-hierarchy",
```

- [ ] **Step 2: Verify the full Subscriptions group looks like this after the change**

```json
{
  "group": "Subscriptions",
  "icon": "refresh",
  "pages": [
    "docs/subscriptions/customers-create-subscription",
    "docs/subscriptions/view",
    "docs/subscriptions/record-payment",
    "docs/subscriptions/override-line-items",
    "docs/subscriptions/customer-hierarchy",
    {
      "group": "Subscription Workflows",
      "pages": [
        "docs/subscriptions/workflows/pause"
      ]
    },
    "docs/subscriptions/understanding-proration",
    "docs/subscriptions/upgrade-and-downgrade",
    "docs/subscriptions/commitment",
    "docs/subscriptions/reservation-discount"
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add docs.json
git commit -m "docs(nav): move customer-hierarchy page path to subscriptions section"
```

---

## Task 2: Delete old customer hierarchy page

**Files:**
- Delete: `docs/customers/customer-hierarchy.mdx`

- [ ] **Step 1: Delete the file**

```bash
git rm docs/customers/customer-hierarchy.mdx
```

- [ ] **Step 2: Commit**

```bash
git commit -m "docs(customers): remove old customer-level hierarchy page"
```

---

## Task 3: Create new subscription-level customer hierarchy page

**Files:**
- Create: `docs/subscriptions/customer-hierarchy.mdx`

This is the primary deliverable. Write the complete MDX file exactly as shown below. Do not add screenshots — placeholder `<Frame>` tags are included where dashboard screenshots should eventually go, with descriptive alt text.

- [ ] **Step 1: Create the file with the full content below**

```mdx
---
title: "Customer Hierarchy"
description: "Configure billing relationships at the subscription level — decouple who uses your service from who pays for it"
---

> **Customer = identity, Subscription = contract, Hierarchy = subscription configuration**

**Customer Hierarchy** is an enterprise-grade feature that lets you configure billing relationships at the subscription level. Rather than linking customers together as parent-child entities, Flexprice keeps customers flat and puts all billing configuration on the subscription itself.

This means you can:

- Route invoices to a different customer than the one using the service
- Have one subscription govern usage across multiple child customers
- Change billing relationships per-subscription without touching customer records

## Choosing Your Approach

Customer Hierarchy supports two independent modes. Choose based on who controls the plan and pricing:

| | Subscription Inheritance | Invoice Redirection |
|---|---|---|
| **Plan & line items** | Owned by the parent subscription | Owned by the child's subscription |
| **Usage tracked on** | Child customers (via inherited subscriptions) | Child customer (their own subscription) |
| **Invoice goes to** | Parent customer | A specified billing customer |
| **Best for** | Enterprise: one plan, many subsidiaries | Reseller: each customer has their own plan, parent pays |
| **API field** | `inheritance.external_customer_ids_to_inherit_subscription` | `inheritance.invoicing_customer_external_id` |

<Note>
  These two modes are mutually exclusive. You cannot combine
  `external_customer_ids_to_inherit_subscription` and
  `invoicing_customer_external_id` in the same subscription.
</Note>

## How It Works

Every subscription has a `subscription_type` that describes its role in a hierarchy:

| Type | Description |
|---|---|
| `standalone` | A regular subscription with no hierarchy relationship (default) |
| `parent` | Owns the plan and line items; usage from child subscriptions rolls up here |
| `inherited` | A skeleton subscription auto-created for each child customer; carries no line items — events are matched via the parent subscription |

Customers themselves remain flat entities. There are no parent fields on a customer record — hierarchy is entirely a subscription-level configuration.

## Flow A: Subscription Inheritance

Use this when one plan governs multiple customers and you want all invoices consolidated under the parent.

**Example:** Global Corp HQ purchases an enterprise plan. APAC Team and EMEA Team each generate usage, but HQ receives one invoice.

### Step 1: Create customers

Create the parent customer and each child customer normally through the Dashboard or API. No hierarchy fields exist on customers — they are flat records.

<Frame>
  ![Create customer form — no parent fields present](/public/images/docs/CustomerHierarchy/create-customer.png)
</Frame>

### Step 2: Create the parent subscription

<Tabs>
  <Tab title="Dashboard">
    1. Navigate to **Subscriptions** and click **Create Subscription**
    2. Select the **parent customer** and choose a plan
    3. In the **Customer Hierarchy** section, add the external IDs of the child customers who will inherit this subscription
    4. Click **Create Subscription**

    <Frame>
      ![Subscription create form showing Customer Hierarchy section with child customer IDs](/public/images/docs/CustomerHierarchy/flow-a-create-parent-sub.png)
    </Frame>
  </Tab>
  <Tab title="API">
    ```json
    POST /subscriptions
    {
      "customer_id": "cus_hq_internal_id",
      "external_customer_id": "ext-global-hq",
      "plan_id": "plan_enterprise",
      "currency": "usd",
      "billing_period": "month",
      "billing_period_count": 1,
      "inheritance": {
        "external_customer_ids_to_inherit_subscription": [
          "ext-apac-team",
          "ext-emea-team"
        ]
      }
    }
    ```
  </Tab>
</Tabs>

### What Flexprice creates

When you submit the request above, Flexprice:

1. Creates the **parent subscription** with `subscription_type: parent` for the HQ customer
2. Auto-creates an **inherited skeleton subscription** (`subscription_type: inherited`) for each child external ID
3. Inherited subscriptions carry no plan line items — usage events from child customers are matched and aggregated via the parent subscription

### Step 3: Verify

Open the parent subscription's detail page. You'll see child skeleton subscriptions listed under it.

<Frame>
  ![Parent subscription detail page showing linked inherited subscriptions for child customers](/public/images/docs/CustomerHierarchy/flow-a-verify-parent-sub.png)
</Frame>

## Flow B: Invoice Redirection

Use this when each customer owns their own subscription (plan, line items, usage all at child level), but a billing entity — a parent company or reseller — should receive and pay the invoice.

**Example:** A reseller manages 10 end customers, each with their own starter plan. The reseller receives all 10 invoices and pays them centrally.

### Step 1: Create customers

Create the subscription owner (child) and the billing customer separately. No hierarchy fields on either customer record.

### Step 2: Create the subscription with invoicing redirect

<Tabs>
  <Tab title="Dashboard">
    1. Navigate to **Subscriptions** and click **Create Subscription**
    2. Select the **child customer** as the subscription owner
    3. Choose a plan
    4. In the **Invoice To** field, select or enter the billing customer's external ID
    5. Click **Create Subscription**

    <Frame>
      ![Subscription create form showing Invoice To field with billing customer selection](/public/images/docs/CustomerHierarchy/flow-b-create-sub.png)
    </Frame>
  </Tab>
  <Tab title="API">
    ```json
    POST /subscriptions
    {
      "customer_id": "cus_child_internal_id",
      "external_customer_id": "ext-end-customer",
      "plan_id": "plan_starter",
      "currency": "usd",
      "billing_period": "month",
      "billing_period_count": 1,
      "inheritance": {
        "invoicing_customer_external_id": "ext-reseller"
      }
    }
    ```
  </Tab>
</Tabs>

### What Flexprice creates

- Subscription is created with `subscription_type: standalone` on the child customer
- Plan, line items, entitlements, and usage tracking all remain on the child
- Invoices are routed to the billing customer (`ext-reseller`)
- The billing customer's wallet and payment methods are used for settlement

<Note>
  The invoicing customer is set at subscription creation and cannot be changed
  afterwards. If you need to change it, cancel the subscription and create a new
  one.
</Note>

## Invoice & Payment Behavior

| | Flow A: Subscription Inheritance | Flow B: Invoice Redirection |
|---|---|---|
| **Usage tracked on** | Each child customer (via inherited subscription) | Child customer (their own subscription) |
| **Invoice generated for** | Parent customer | Specified billing customer |
| **Wallet deducted from** | Parent customer | Billing customer |
| **Tax based on** | Parent customer's billing details | Billing customer's billing details |
| **Currency** | Set at the parent subscription | Set at the child subscription |

## Use Cases

**Enterprise with subsidiaries** *(Flow A)*
Global HQ purchases a plan. Regional divisions (APAC, EMEA, Americas) each generate usage independently, but HQ receives one consolidated invoice with line items per division.

**Reseller / partner model** *(Flow B)*
A reseller signs up their clients as separate customers in Flexprice. Each client has their own subscription and usage tracking, but the reseller receives and pays all invoices.

**Department-level billing** *(Flow A or B)*
A company's central IT or Finance team handles vendor payments. Engineering, Marketing, and Sales each track their own usage — invoices roll up to the central team.

**Multi-brand holding company** *(Flow A)*
A holding company owns multiple brands. Each brand operates independently as a customer with its own subscriptions. The holding company's finance department receives all invoices.

## Frequently Asked Questions

<AccordionGroup>
  <Accordion title="Can parent and child subscriptions use different currencies?">
    In **Flow A**, currency is set on the parent subscription and applies to all invoices generated for it. Child inherited subscriptions adopt the parent's currency.

    In **Flow B**, each subscription sets its own currency independently, since each child owns a full subscription.
  </Accordion>

  <Accordion title="How does tax work?">
    Tax is calculated based on the invoicing customer's billing details — the parent customer in Flow A, or the specified billing customer in Flow B. The subscription owner's billing address is not used for tax in either flow.
  </Accordion>

  <Accordion title="How does wallet drawdown work?">
    The wallet is deducted from the invoicing customer's balance, not the subscription owner's. In Flow A, the parent customer's wallet is drawn down. In Flow B, the billing customer's wallet is used.
  </Accordion>

  <Accordion title="What happens when the parent subscription is upgraded or downgraded?">
    Plan changes apply to the parent subscription only. Inherited skeleton subscriptions are not directly affected — they continue to route usage events to the updated parent.
  </Accordion>

  <Accordion title="What happens when the parent subscription is cancelled?">
    A final invoice is generated for the invoicing customer. Inherited skeleton subscriptions linked to the parent are also cancelled at the same time.
  </Accordion>

  <Accordion title="Can I change the invoicing customer after a subscription is created?">
    No. The invoicing customer is set at creation time and is immutable. To change it, cancel the existing subscription and create a new one with the correct `invoicing_customer_external_id`.
  </Accordion>
</AccordionGroup>
```

- [ ] **Step 2: Confirm the file exists**

```bash
ls docs/subscriptions/customer-hierarchy.mdx
```

Expected output: `docs/subscriptions/customer-hierarchy.mdx`

- [ ] **Step 3: Commit**

```bash
git add docs/subscriptions/customer-hierarchy.mdx
git commit -m "docs(subscriptions): add customer hierarchy page with subscription-level billing model

Replaces customer-level parent_customer_id model with subscription-level
hierarchy. Documents two flows: Subscription Inheritance and Invoice
Redirection, using verified API shapes from PR #1535."
```

---

## Task 4: Update customers overview with cross-link

**Files:**
- Modify: `docs/customers/overview.mdx`

Add a single sentence at the end pointing readers to the hierarchy feature.

- [ ] **Step 1: Open `docs/customers/overview.mdx` and append the following line after the last paragraph**

Current last line:
```
Customers can be created manually in the dashboard or through API calls for automation.
```

Add after it:
```mdx
To configure billing relationships between customers — such as having a parent company pay for a subsidiary's subscription — see [Customer Hierarchy](/docs/subscriptions/customer-hierarchy).
```

- [ ] **Step 2: Verify the full file reads**

```mdx
---
title: "Overview"
---

A **Customer** in Flexprice represents a business or individual that subscribes to your plans and is billed for usage. Each customer is uniquely identified and can be assigned to specific pricing plans and entitlements.

**Why Manage Customers in Flexprice?**

* **Track subscriptions**: Associate customers with specific plans and features.

* **Automate billing**: Generate invoices based on usage.

* **Manage entitlements**: Control feature access at an individual level.

* **Analyze usage**: Monitor consumption for better insights.

Customers can be created manually in the dashboard or through API calls for automation.

To configure billing relationships between customers — such as having a parent company pay for a subsidiary's subscription — see [Customer Hierarchy](/docs/subscriptions/customer-hierarchy).
```

- [ ] **Step 3: Commit**

```bash
git add docs/customers/overview.mdx
git commit -m "docs(customers): add cross-link to customer hierarchy page"
```

---

## Task 5: Final verification

- [ ] **Step 1: Check no remaining references to removed fields**

```bash
grep -r "parent_customer_id\|invoice_billing\|invoice_to_parent\|invoice_to_self" docs/ --include="*.mdx" --include="*.md"
```

Expected output: no matches (only the spec file in `docs/superpowers/` may match — that's fine)

- [ ] **Step 2: Check new page is referenced correctly in docs.json**

```bash
grep "customer-hierarchy" docs.json
```

Expected output:
```
"docs/subscriptions/customer-hierarchy",
```

- [ ] **Step 3: Check old page is gone**

```bash
ls docs/customers/customer-hierarchy.mdx 2>&1
```

Expected output: `ls: docs/customers/customer-hierarchy.mdx: No such file or directory`

- [ ] **Step 4: Commit verification (no changes needed — this is a dry-run check)**

If any of the above checks failed, fix the issue and commit before proceeding.
