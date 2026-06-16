{/*
  MINTLIFY WORKFLOW INSTRUCTIONS — CHANGELOGS AGENT
  =================================================
  This file is read by the Mintlify "Draft Changelog" workflow agent on every run.
  It is the single source of truth for how to produce Flexprice changelog entries.
  Edit this file to change patterns; the next scheduled run picks up the changes automatically.
  Do not modify the Mintlify workflow configuration, update this file instead.
*/}

# Flexprice Changelog — Agent Instructions

## ABOUT FLEXPRICE

Flexprice lets AI-native and SaaS teams operate usage-based, credit-based, and hybrid pricing with real-time metering and reporting that scales as your product evolves.

- **Backend** (`flexprice/flexprice`) [https://github.com/flexprice/flexprice]
- **Frontend** (`flexprice/flexprice-front`) [https://github.com/flexprice/flexprice-front]
- **Docs** (`flexprice/flexprice-docs`) [https://github.com/flexprice/flexprice-docs] — `docs/changelog.mdx` is where changelog entries live

Key product domains: subscriptions, invoices, wallets, plans, prices, meters, entitlements, customers, webhooks, payment integrations (Paddle, Stripe, Zoho, Whop).

---

## WHAT TO INCLUDE / EXCLUDE

### Major features — gets a `##` heading

Include as a top-level `##` section when a change is:

- A new user-facing capability (new subscription type, new billing model, new lifecycle state)
- A new API endpoint or endpoint category users call directly
- A new third-party integration (Paddle, Zoho, Whop, Stripe, etc.)
- A significant new dashboard feature (new page, new flow, new drawer/section)
- An SDK release with multiple improvements
- A new configuration system users interact with
- A new workflow or automation (Temporal-based or scheduled) that users benefit from

Real examples of things that became `##` headings:
- Inherited subscriptions (new billing model)
- Paddle subscription sync (new integration feature)
- Auto invoice threshold billing (new automation)
- Draft subscriptions (new lifecycle state)
- Wallet alerts (new feature)
- SDK v2.1 (major SDK release)
- White-label dashboard & localization (new capability)
- Grouped invoicing (new subscription type)

### Accordion bullets — goes in Improvements, Fixes, or API

**Improvements**: Enhancements to existing features, performance work, observability, UI defaults, infra tuning, DX improvements that don't constitute a new feature.

Real examples:
- "Customer list now defaults to filtering by `PUBLISHED` status"
- "Sentry spans now include user ID for more actionable error attribution"
- "Temporal worker concurrency defaults reduced to prevent out-of-memory kills"
- "Invoice `issue_date` now takes priority over `finalized_at` when computing the PDF issuance date"

**Fixes**: Bug fixes, data correctness, edge-case handling, nil checks, panic prevention.

Real examples:
- "Revenue dashboard date range filter now includes UTC-inclusive period boundaries"
- "ClickHouse aggregator queries no longer use the `FINAL` keyword"
- "Invoice PDF generation now handles nil line items without panicking"
- "`monthsBetween` now correctly handles end-of-month boundary dates"

**API**: New endpoints, changed request/response fields, SDK releases, OpenAPI changes.

Real examples:
- "New `POST /v1/invoices/internal/preview` endpoint for computing a preview invoice without persisting state"
- "`auto_invoice_threshold` field added to subscription create and modify DTOs"
- "Go SDK v2.1.0 and v2.1.1 released with error utilities, idempotency key support, auto-pagination"

### Skip entirely — do not include

- Commits prefixed `chore:`, `ci:`, `test:`, `wip`, `xyz`, `bump`
- Internal test suite additions or testutil changes
- README-only changes with no feature content
- CI/CD pipeline plumbing with zero user-facing impact
- Design spec documents or internal notes
- Go module version bumps unless paired with a meaningful feature
- Merge commits

---

## MDX FORMAT

The changelog file is `docs/changelog.mdx`. Its frontmatter (do not modify):

```
---
title: "Changelog"
description: "What we've been shipping at Flexprice lately"
mode: "center"
---
```

New entries go immediately after the closing `---` of the frontmatter, before all existing `<Update>` blocks. The most recent entry must always be first.

### Full template

```mdx
<Update label="Month Xth YYYY">
  ## Feature Title

  One or two sentence description of what this feature enables.

  * **Sub-feature name**: Explanation of what this specific aspect does
  * **Another sub-feature**: More detail on a different aspect

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

### Real complete entry (gold standard — match this exactly)

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

  **Other changes**

  <AccordionGroup>
    <Accordion title="Improvements">
      * Customer list now defaults to filtering by `PUBLISHED` status — inactive customers are hidden by default with the ability to clear the filter
      * Invoice finalization delay reduced from 5 days to 2 hours — integrations and async workflows have a shorter window before invoices are sealed
      * Temporal invoice workflows now start with a configurable delay, giving downstream systems time to react before processing begins
      * System events enhanced with entity type and entity ID fields, and a new `event_name` column for structured audit log queries
      * OTel log level filtering now respected in the pipeline — debug-level noise no longer propagates to exporters configured for higher levels
    </Accordion>

    <Accordion title="Fixes">
      * Revenue dashboard date range filter now includes UTC-inclusive period boundaries — data at period edges was previously excluded
      * ClickHouse aggregator queries no longer use the `FINAL` keyword — removes read inconsistencies on tables with frequent merges
      * Invoice computation now correctly identifies inherited subscriptions and skips re-computation when appropriate
      * Invoice PDF generation now handles nil line items without panicking
    </Accordion>

    <Accordion title="API">
      * New `POST /v1/invoices/internal/preview` endpoint for computing a preview invoice without persisting state
      * Subscription type field (`STANDALONE`, `PARENT`, `INHERITED`) added to the subscriptions API with filtering support
      * `force_generate` parameter added to the invoice PDF URL endpoint for on-demand PDF regeneration
      * Go SDK v2.1.0 and v2.1.1 released with error utilities, idempotency key support, auto-pagination, and configurable retry strategy
    </Accordion>
  </AccordionGroup>
</Update>
```

### Real compact entry (lighter week — also acceptable)

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

## FORMATTING RULES

### Date label

Format: `<Update label="Month Xth YYYY">` with ordinal suffixes.

Ordinal suffix rules:
- 1st, 21st, 31st
- 2nd, 22nd
- 3rd, 23rd
- 4th through 20th, 24th through 30th use **th**

Correct examples: `April 6th 2026`, `March 23rd 2026`, `February 2nd 2026`, `May 1st 2026`, `May 11th 2026`, `May 18th 2026`, `May 25th 2026`

### Headings

- `##` for each major feature — always, never `#` or `###`
- No sub-headings inside a feature section

### Bullet points

Every bullet must use the pattern: `* **Bold label**: Description`

Correct:
```
* **Subscription types**: Subscriptions are now typed as `STANDALONE`, `PARENT`, or `INHERITED`
* **Dashboard support**: The subscription edit page now shows an inherited subscriptions section
```

Incorrect:
```
- New subscription types added
* Added dashboard support for inherited subscriptions
```

### `<br />` separators

Place `<br />` (with 2-space indent) between every distinct section:
- After bullet list, before `<Frame>` or `<Card>`
- After `<Frame>`, before `<Card>`
- After `<Card>`, before next `##` section or `**Other changes**`
- Before `**Other changes**`

### Code formatting

Use backticks for:
- Field names: `cancel_at`, `auto_invoice_threshold`, `PUBLISHED`
- Status values and enums: `DRAFT`, `STANDALONE`, `PARENT`
- API endpoints: `POST /v1/invoices/internal/preview`
- Config keys: `rate_limit`, `max_attempts`
- Package names: `errorutils`

### Indentation

Everything inside `<Update>` uses **2-space indentation**. Accordion bullets use 6-space indent to align inside the `<Accordion>` tag.

### Accordion sections

- Only include accordion sections that have content — omit empty `<Accordion>` blocks entirely
- If no fixes exist this week, omit the Fixes accordion
- If no API changes exist, omit the API accordion
- Accordion bullets use `*` not `-`
- Use em dashes (`—`) for parenthetical context inside bullets, not parentheses

### Images

Only include a `<Frame>` if a relevant screenshot actually exists. Format:

```mdx
  <Frame>
    <img src="/public/images/docs/Category/filename.png" alt="Descriptive alt text" style={{ borderRadius: '0.5rem' }} />
  </Frame>
```

Always include `style={{ borderRadius: '0.5rem' }}` (JSX double-brace syntax). Always include descriptive `alt` text.

### Cards

Two types:

```mdx
  <Card icon="book-open" horizontal={true} href="/docs/section/page" title="Feature name - Documentation" />
  <Card icon="code" horizontal={true} href="/api-reference/resource/endpoint" title="Endpoint name - API Reference" />
```

Always `horizontal={true}` (JSX boolean). Title format: `"Feature name - Documentation"` or `"Endpoint name - API Reference"`.

---

## EDITORIAL VOICE

### Tense and person

- **Present tense**: "Subscriptions now support…" not "We added support for…" or "Subscriptions will support…"
- **Neutral or second-person**: "You can now configure…" or "Subscriptions now support…" — never "We built…" or "We're excited to announce…"

### Length

- Feature description: 1-2 sentences maximum
- Every word earns its place — delete filler

### Tone

- **Technical but accessible**: Name the mechanism (endpoint, config field, UI component) and the user benefit in the same sentence
- **Specific**: "Invoices now show a `plan_prices_out_of_sync` flag" beats "Invoice display improvements"
- **Concise**: One crisp sentence is better than two vague ones

### Banned words and phrases

Do not use: exciting, powerful, seamless, robust, comprehensive, enhanced, improved (as a standalone vague verb), world-class, cutting-edge, revolutionary, streamlined, intuitive, easy-to-use, game-changing, best-in-class.

### Real examples of correct voice

- "Subscriptions now support an inheritance model — a parent subscription can propagate charges, cancellations, and billing configuration to child subscriptions attached to the same customer."
- "Set `auto_invoice_threshold` on any usage-based subscription and Flexprice will automatically generate a mid-period invoice whenever accumulated usage charges cross that amount — no manual intervention required."
- "Preview invoice charges before finalization with a new internal preview endpoint — useful for validating billing logic before committing to an invoice."
- "Subscriptions can now be cancelled at a specific future date — set `cancel_at` on the cancel request and the subscription stays active until that date, then terminates automatically."

---

## CATEGORIZATION GUIDE

### Deciding between `##` section vs accordion bullet

The key question: **Does this represent a new user-facing capability, or does it improve/fix an existing one?**

| Change | Decision | Reason |
|---|---|---|
| New subscription type `INHERITED` | `##` | New billing model users adopt |
| New `POST /v1/invoices/internal/preview` endpoint | `##` | New API capability |
| Paddle invoice sync | `##` | New integration |
| Auto-topup deduplication guard | `##` | New behavioral guarantee users rely on |
| Customer list defaults to PUBLISHED filter | Improvements | UI default change, not a new capability |
| Sentry spans include user ID | Improvements | Internal observability, no user action |
| Temporal worker concurrency tuned | Improvements | Infra, not user-facing |
| ClickHouse FINAL keyword removed | Fixes | Correctness fix |
| Invoice PDF nil check | Fixes | Bug fix |
| New field on subscription response | API | Schema addition |

### Grouping related PRs into one feature

When multiple PRs implement different parts of the same feature, merge them into one `##` section:

- Backend API + frontend dashboard implementation → one section, bullets for each part
- Service logic + Temporal workflow + webhook handler for same integration → one section
- Create endpoint + list endpoint + filter support for same resource → one section

Name the section after the user-facing concept, not the technical component.

### Frontend-only changes

Frontend changes that introduce a new page, flow, or significant UI capability become `##` sections (e.g., "White-label dashboard & localization", "Custom dashboard theming").

Pure UI polish, loading states, and component refactors without new capabilities go in Improvements.

### How many `##` sections per entry

Typical range: 3-6 major features per week. If fewer shipped, it is acceptable to have 1-2. Do not inflate accordion bullets into `##` sections to pad the entry.

---

## OUTPUT INSTRUCTIONS

Return **only** the raw `<Update>...</Update>` MDX block.

- No markdown code fences (no ` ```mdx ``` `)
- No explanation, preamble, or summary before or after the block
- No "Here is the changelog:" prefix
- The block starts with `<Update label="...">` on the first line
- The block ends with `</Update>` on the last line

This output is pasted directly into `docs/changelog.mdx` immediately after the frontmatter closing `---`, before all existing `<Update>` blocks. It must be valid MDX with correct JSX syntax (`horizontal={true}`, `style={{ borderRadius: '0.5rem' }}`).
