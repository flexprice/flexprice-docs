---
title: "Customer Hierarchy"
description: "Enable parent-child relationships for flexible pricing, usage aggregation, and consolidated billing"
---

**Customer Hierarchy** is an enterprise-grade feature that enables you to establish parent-child relationships between customers for consolidated billing and flexible organizational structures. This powerful capability allows you to aggregate usage across multiple entities while maintaining separate subscription ownership and entitlements.

## Overview

Customer Hierarchy allows you to decouple **who uses the service** from **who pays for it**. This is essential for enterprises with multiple business units, reseller partnerships, or complex organizational structures that require centralized billing while maintaining granular usage tracking.

### Key Benefits

- **Consolidated Invoicing**: Roll up charges from multiple child customers onto a single parent invoice
- **Flexible Pricing**: Apply different pricing configurations across business units while maintaining unified billing
- **Usage Aggregation**: Track usage at the entity level while billing at the parent level
- **Simplified Procurement**: Streamline vendor management with a single billing relationship
- **Organizational Flexibility**: Support complex corporate structures, reseller models, and multi-entity operations

## How It Works

### Parent-Child Relationships

In FlexPrice, you establish a customer hierarchy by specifying an `invoicing_customer_id` when creating a subscription. This creates a clear separation between:

- **Subscription Owner** (Child): The customer entity that owns and uses the subscription
- **Invoicing Customer** (Parent): The customer entity that receives invoices and handles payment

### Creating a Hierarchical Subscription

When creating a subscription, specify the `invoicing_customer_id` to designate which customer should be billed:

```json
POST /subscriptions
{
  "customer_id": "cus_subsidiary_123",
  "plan_id": "plan_enterprise",
  "invoicing_customer_id": "cus_parent_corp_456",
  "currency": "usd",
  "billing_period": "month",
  "billing_period_count": 1
}
```

**What happens:**

1. The subscription is owned by `cus_subsidiary_123` (the child entity)
2. All invoices are generated for `cus_parent_corp_456` (the parent entity)
3. Usage is tracked under the subsidiary but billed to the parent
4. Payment methods and wallets from the parent customer are used for settlement

### Invoice Generation & Billing

When invoices are generated:

1. FlexPrice checks for the `invoicing_customer_id` on each subscription
2. Invoices are created with the parent customer as the billing entity
3. All charges appear in the parent customer's billing history
4. Payment processing uses the parent customer's payment methods and wallet balance

This ensures complete separation between service consumption and financial responsibility.

## Use Cases

### Enterprise with Multiple Subsidiaries

A global corporation with regional subsidiaries needs centralized billing while maintaining separate usage tracking for each business unit.

**Setup:**

- **Parent**: Global Corporation HQ
- **Children**: Regional subsidiaries (APAC, EMEA, Americas)
- **Benefit**: Each subsidiary has its own subscription and usage tracking, but HQ receives a single consolidated invoice

### Reseller & Partner Models

A channel partner resells your software to their clients and handles billing to end customers separately.

**Setup:**

- **Parent**: Reseller/Partner
- **Children**: End customer organizations
- **Benefit**: Reseller receives all invoices and manages payment, while end customers maintain their own subscriptions and usage

### Multi-Brand Organizations

A holding company operates multiple brands, each with their own customer identity but centralized finance operations.

**Setup:**

- **Parent**: Holding Company Finance Department
- **Children**: Individual brand entities
- **Benefit**: Brands operate independently with their own subscriptions, but finance handles all vendor payments centrally

### Departmental Billing

Large organizations with multiple departments where a central finance or IT department manages vendor relationships.

**Setup:**

- **Parent**: Finance or IT Department
- **Children**: Engineering, Marketing, Sales teams
- **Benefit**: Teams use services independently, but billing is centralized for budget management

## Payment & Wallet Behavior

Since invoices are assigned to the parent (invoicing customer), all payment operations use the parent's financial resources:

- **Wallet Credits**: Parent customer's prepaid or promotional wallet balance is applied to invoices
- **Payment Methods**: Saved cards and payment gateway configurations from the parent customer are used
- **Payment History**: All transactions appear in the parent customer's payment records

## Current Limitations

> [!IMPORTANT] > **API-Only Feature**: Customer Hierarchy is currently available exclusively through the FlexPrice API. UI support is under development.

> [!WARNING] > **Immutable Assignment**: The `invoicing_customer_id` can only be set during subscription creation and cannot be modified later. To change the billing relationship, you must cancel the existing subscription and create a new one.

---

> [!NOTE]
> Customer Hierarchy is designed for enterprise use cases. If you have questions about implementing this feature for your organization, contact our support team at support@flexprice.io.
