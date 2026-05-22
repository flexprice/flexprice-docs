# Changelog Reference — Mintlify MDX Format

This is the complete reference for writing Flexprice changelog entries. It contains the exact MDX template, real examples from the live changelog, and integration instructions.

## File Locations

- **Live changelog**: `flexprice-docs/docs/changelog.mdx`
- **Frontmatter** (lines 1-5 of changelog.mdx — do NOT modify):
  ```yaml
  ---
  title: "Changelog"
  description: "What we've been shipping at Flexprice lately"
  mode: "center"
  ---
  ```
- **New entries** go immediately after the frontmatter (line 6+), before all existing `<Update>` blocks
- **Footer** (last 3 lines of changelog.mdx — do NOT modify):
  ```mdx
  <Note>
    For release history before these updates, see our [GitHub releases](https://github.com/flexprice/flexprice/releases).
  </Note>
  ```

---

## Complete MDX Template

```mdx
<Update label="Month Xth 20XX">
  ## Feature Title

  One or two sentence description of what this feature enables and why it matters.

  * **Sub-feature name**: Explanation of what this specific aspect does
  * **Another sub-feature**: More detail on a different aspect of this feature

  <br />

  <Frame>
    <img src="/public/images/docs/Category/screenshot.png" alt="Descriptive alt text" style={{ borderRadius: '0.5rem' }} />
  </Frame>

  <br />

  <Card icon="book-open" horizontal={true} href="/docs/section/page" title="Feature name - Documentation" />

  <br />

  ## Another Feature Title

  Description of this feature.

  * **Label**: Detail about this feature

  <br />

  <Card icon="code" horizontal={true} href="/api-reference/resource/endpoint" title="Endpoint name - API Reference" />

  <br />

  **Other changes**

  <AccordionGroup>
    <Accordion title="Improvements">
      * First improvement bullet
      * Second improvement bullet
    </Accordion>

    <Accordion title="Fixes">
      * First fix bullet
      * Second fix bullet
    </Accordion>

    <Accordion title="API">
      * First API change bullet
      * Second API change bullet
    </Accordion>
  </AccordionGroup>
</Update>
```

---

## Formatting Rules (with examples from real entries)

### Date Format

Use `<Update label="Month Xth YYYY">` with ordinal suffixes:
- 1st, 2nd, 3rd, 4th through 20th, 21st, 22nd, 23rd, 24th through 30th, 31st

Real examples:
- `<Update label="April 6th 2026">`
- `<Update label="March 23rd 2026">`
- `<Update label="February 2nd 2026">`

### Major Feature Headings

Each major feature gets a `##` heading. Never `#` (page title) or `###` (too small).

Real example:
```mdx
  ## Inherited subscriptions

  Subscriptions now support an inheritance model — a parent subscription can propagate charges, cancellations, and billing configuration to child subscriptions attached to the same customer.
```

### Description Paragraphs

1-2 sentences max. Second person ("You can now…") or neutral voice ("Subscriptions now support…").

Real examples:
- "Invite teammates to your organization and manage dashboard access from the Flexprice UI."
- "Duplicate an existing plan with all its prices and configuration as a starting point for a new plan."
- "A single plan can now support multiple billing cadences (monthly, annual, etc.) simultaneously."
- "Create subscriptions in a draft state before activating them, allowing configuration and invoice preview before going live."

### Bullet Points

Always use `* **Bold label**: Description` format. Each bullet starts with a bolded label followed by colon.

Real examples:
```mdx
  * **Checkout overlay**: Customers complete payments via Paddle's hosted checkout, embedded directly in your billing flow with JWT-signed checkout URLs
  * **Bidirectional customer sync**: Customers are automatically synced between Flexprice and Paddle, with deduplication and address management
```

```mdx
  * **Draft lifecycle**: Create subscriptions with `DRAFT` status that skip invoice generation and payment processing until explicitly activated
  * **Invoice preview**: Preview estimated charges for draft subscriptions before activation
  * **Dashboard support**: Draft subscriptions now appear in customer subscription lists and support activation with configurable start dates
```

### `<br />` Separators

Place `<br />` on its own line (with 2-space indentation inside the Update block) between:
- After bullet points, before a Frame or Card
- After a Frame, before a Card
- After a Card, before the next section
- Before "Other changes"

### Images in `<Frame>`

Only include if a relevant screenshot exists in `flexprice-docs/public/images/docs/`.

```mdx
  <Frame>
    <img src="/public/images/docs/Groups/create-feature-with-grouping.png" alt="Create feature with group" style={{ borderRadius: '0.5rem' }} />
  </Frame>
```

Notes:
- Path is relative to the docs root: `/public/images/docs/...`
- Always include `style={{ borderRadius: '0.5rem' }}` (JSX double-brace syntax)
- Always include descriptive `alt` text
- `width` and `height` attributes are optional

### `<Card>` Links

Two flavors — docs and API reference:

**Documentation link:**
```mdx
  <Card icon="book-open" horizontal={true} href="/docs/product-catalogue/groups/feature-grouping" title="Feature grouping - Documentation" />
```

**API reference link:**
```mdx
  <Card icon="code" horizontal={true} href="/api-reference/subscriptions/get-subscription-v2" title="Get Subscription - API Reference" />
```

Rules:
- Always `horizontal={true}` (JSX boolean syntax)
- Title format for docs: `"Feature name - Documentation"`
- Title format for API: `"Endpoint name - API Reference"`
- `href` paths match the Mintlify page routes in `docs.json`

### Accordion Section

Goes at the very bottom of the `<Update>` block. Preceded by `**Other changes**` in bold.

Only include accordion sections that have content. If there are no fixes this week, omit the Fixes accordion entirely.

```mdx
  **Other changes**

  <AccordionGroup>
    <Accordion title="Improvements">
      * Webhook delivery now uses Kafka for reliable, distributed event processing — in-memory PubSub support has been removed
      * Sentry logging enhanced with log-level filtering, unique per-request trace IDs, and health endpoint noise reduction
      * Multi-addon entitlement fetching improved to support multiple instances of the same add-on per subscription
    </Accordion>

    <Accordion title="Fixes">
      * Fixed inactive line item handling for previous billing period calculations
      * Invoice idempotency key generation scoped to minute-level precision to prevent duplicate invoices within the same billing cycle
    </Accordion>

    <Accordion title="API">
      * New `POST /v1/events/raw/bulk` endpoint for bulk raw event ingestion
      * Subscriptions API now supports listing and filtering by `DRAFT` status
    </Accordion>
  </AccordionGroup>
```

Accordion bullet style:
- Use `*` (not `-`)
- 6-space indent (to align inside the `<Accordion>` tag)
- One line per bullet, concise but specific
- Use backticks for code references: `DRAFT`, `POST /v1/events/raw/bulk`
- Use em dashes (`—`) for parenthetical context, not parentheses

### Indentation

Everything inside `<Update>` is indented with **2 spaces**. This matches the existing file exactly.

---

## Real Complete Entry (April 6th 2026)

This is the most recent entry — use it as the gold-standard example:

```mdx
<Update label="April 6th 2026">
  ## Inherited subscriptions

  Subscriptions now support an inheritance model — a parent subscription can propagate charges, cancellations, and billing configuration to child subscriptions attached to the same customer.

  * **Subscription types**: Subscriptions are now typed as `STANDALONE`, `PARENT`, or `INHERITED` — controlling how billing is routed and how cancellations cascade
  * **Inherited subscription creation**: Create subscriptions that inherit from a parent, with automatic customer resolution and unified code paths for create and modify operations
  * **Cascade cancellation**: Cancelling a parent subscription automatically propagates cancellation to all inherited child subscriptions
  * **Validation guards**: The API prevents creating standalone or parent subscriptions on customers that already have an inherited subscription, avoiding conflicting billing hierarchies
  * **Dashboard support**: The subscription edit page now shows an inherited subscriptions section for managing child subscriptions from the parent view

  <br />

  ## SDK v2.1

  The Flexprice Go, Python, and TypeScript SDKs have been updated to v2.1, with major developer experience improvements across error handling, idempotency, and pagination.

  * **Error utilities**: New `errorutils` package provides typed helpers — `IsNotFound`, `IsValidation`, `IsConflict` — for clean error handling without string matching
  * **Per-request idempotency**: `WithIdempotencyKey` option lets you attach an idempotency key to any mutating request without modifying global config
  * **Auto-pagination**: List endpoints now support automatic pagination — iterate over all results without managing page tokens manually
  * **Retry configuration**: Read-only `POST` operations (like usage queries and previews) now retry automatically; retry settings are configurable globally or per-request
  * **SDK examples**: Comprehensive end-to-end examples added for Go, TypeScript, and Python covering the full subscription and billing lifecycle

  <br />

  <Card icon="code" horizontal={true} href="/api-reference/introduction" title="API Reference" />

  <br />

  ## Invoice internal preview

  Preview invoice charges before finalization with a new internal preview endpoint — useful for validating billing logic before committing to an invoice.

  * **Preview endpoint**: New `POST /v1/invoices/internal/preview` computes a draft invoice view without persisting any state — returns line items, totals, and applied discounts
  * **PDF force regeneration**: The invoice PDF URL endpoint now accepts a `force_generate` parameter to regenerate PDFs on demand, bypassing the cached version

  <br />

  ## Usage charge arrear constraint

  Usage-based charges are now constrained to arrear billing — the API enforces that usage charges cannot be configured for advance billing.

  * **Arrear-only enforcement**: Prices with usage charge models are validated at creation and update time to ensure they are always billed in arrear, preventing misconfigured advance billing setups

  <br />

  ## Entitlement usage reset period

  Plan entitlements can now be configured with a usage reset period directly from the plan builder.

  * **Reset period UX**: The plan creation and edit flow now includes a reset period selector for entitlements — configure how frequently usage limits reset (daily, weekly, monthly, etc.) without leaving the dashboard

  <br />

  **Other changes**

  <AccordionGroup>
    <Accordion title="Improvements">
      * Customer list now defaults to filtering by `PUBLISHED` status — inactive customers are hidden by default with the ability to clear the filter
      * Invoice finalization delay reduced from 5 days to 2 hours — integrations and async workflows have a shorter window before invoices are sealed
      * Temporal invoice workflows now start with a configurable delay, giving downstream systems time to react before processing begins
      * System events enhanced with entity type and entity ID fields, and a new `event_name` column for structured audit log queries
      * OTel log level filtering now respected in the pipeline — debug-level noise no longer propagates to exporters configured for higher levels
      * Temporal worker concurrency defaults reduced to prevent out-of-memory kills under high load
      * API error messages extracted and displayed more accurately throughout the dashboard — network and validation errors now surface actionable text instead of raw response objects
    </Accordion>

    <Accordion title="Fixes">
      * Revenue dashboard date range filter now includes UTC-inclusive period boundaries — data at period edges was previously excluded
      * ClickHouse aggregator queries no longer use the `FINAL` keyword — removes read inconsistencies on tables with frequent merges
      * Invoice computation now correctly identifies inherited subscriptions and skips re-computation when appropriate
      * Credit purchased invoice payment status flow corrected — status transitions now follow the expected finalization sequence
      * Subscription invoice draft idempotency key now includes `billing_reason` — prevents duplicate drafts across different billing triggers within the same period
      * Duplicate draft event publishing removed from `CreateInvoice` — downstream consumers no longer receive redundant `invoice.drafted` events
      * Invoice PDF generation now handles nil line items without panicking
    </Accordion>

    <Accordion title="API">
      * New `POST /v1/invoices/internal/preview` endpoint for computing a preview invoice without persisting state
      * Subscription type field (`STANDALONE`, `PARENT`, `INHERITED`) added to the subscriptions API with filtering support
      * New endpoint for modifying subscription inheritance — add or remove inherited subscriptions from a parent
      * `force_generate` parameter added to the invoice PDF URL endpoint for on-demand PDF regeneration
      * Go SDK v2.1.0 and v2.1.1 released with error utilities, idempotency key support, auto-pagination, and configurable retry strategy
      * TypeScript SDK updated to use `CustomerFromLookup` type for customer resolution responses
    </Accordion>
  </AccordionGroup>
</Update>
```

---

## Real Compact Entry (March 9th 2026)

A shorter entry when fewer features shipped:

```mdx
<Update label="March 9th 2026">

  ## Settings overhaul

  Settings have been restructured for faster navigation and a clearer separation of tenant, billing, and integration configurations.

  * **Revamped settings**: Improved organization and discoverability of configuration options

  <br />

  <Card icon="book-open" horizontal={true} href="/docs/settings/settings" title="Settings - Documentation" />

  <br />

  ## Custom dashboard theming

  Personalize the Flexprice dashboard with your brand colors and visual preferences.

  * **Theme customization**: Apply custom colors and branding to match your organization's identity

  <br />
  **Other changes**

  <AccordionGroup>
    <Accordion title="Improvements">
      * Sentry spans now include user ID for more actionable error attribution and debugging
    </Accordion>
  </AccordionGroup>
</Update>
```

---

## Categorization Guide

Deciding what becomes a `##` heading vs an accordion bullet is the most important editorial decision. Here's how the existing changelog handles it:

**Gets a `##` heading** (major feature):
- Paddle payment integration (new integration)
- Draft subscriptions (new capability)
- Bulk event ingestion (new API endpoint)
- Inherited subscriptions (new billing model feature)
- SDK v2.1 (major SDK release with multiple DX improvements)
- Invoice internal preview (new API endpoint category)
- Wallet alerts (new feature with UI)
- Plan cloning (new action in dashboard)
- Organization members & dashboard access (new section in UI)

**Goes in Improvements accordion:**
- "Customer list defaults to PUBLISHED status filter" (UI default change)
- "Sentry spans now include user ID" (observability enhancement)
- "General UI optimizations" (polish)
- "Webhook delivery now uses Kafka" (infra improvement)
- "Go Docker image bumped to golang:1.24-alpine" (dependency update)
- "Temporal worker concurrency defaults reduced" (infra tuning)

**Goes in Fixes accordion:**
- "Fixed inactive line item handling" (bug fix)
- "Invoice idempotency key generation scoped to minute-level precision" (correctness fix)
- "Webhook secrets are now obscured" (security fix)
- "ClickHouse FINAL keyword removed from aggregators" (query correctness)

**Goes in API accordion:**
- "New `POST /v1/events/raw/bulk` endpoint" (new endpoint)
- "Subscriptions API now supports filtering by `DRAFT` status" (API enhancement)
- "Go SDK v2.1.0 released with error utilities" (SDK release)
- "GitHub release step added for Go SDK CI pipeline" (SDK/tooling)

---

## Integration Instructions

To publish a new changelog entry:

1. Use the `Edit` tool to prepend the `<Update>` block directly into `changelog.mdx` right after the `---` frontmatter closing (line 6), before the previous top `<Update>` tag
2. The most recent entry must always be at the top
3. Verify by reading the first ~100 lines of the file after the edit
4. Commit and push — Mintlify auto-deploys
