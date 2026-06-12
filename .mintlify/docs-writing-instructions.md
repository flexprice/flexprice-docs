<!--
  MINTLIFY DOCS WRITING INSTRUCTIONS — WORKFLOW AGENT
  ====================================================
  This file is read by Mintlify workflow agents when generating or updating documentation.
  It is the single source of truth for how to write Flexprice docs.
  Edit this file to update patterns; the next workflow run picks up changes automatically.
  Do not modify the Mintlify workflow configuration — update this file instead.
-->

# Flexprice Docs — Writing and Validation Skill

## ABOUT FLEXPRICE

Flexprice lets AI-native and SaaS teams operate usage-based, credit-based, and hybrid pricing with real-time metering and reporting that scales as your product evolves.

- **Docs site** (`flexprice/flexprice-docs`) [https://github.com/flexprice/flexprice-docs] — https://docs.flexprice.io
- **Backend** (`flexprice/flexprice`) [https://github.com/flexprice/flexprice]
- **Frontend** (`flexprice/flexprice-front`) [https://github.com/flexprice/flexprice-front]

Key product domains: subscriptions, invoices, wallets, plans, prices, meters, entitlements, customers, webhooks, payment integrations (Paddle, Stripe, Zoho, Whop).

Write new documentation pages and validate them against the live Mintlify build. Always follow the existing style of the repo — read nearby docs before writing to match tone and component usage.

---

## Repo Layout

```
flexprice-docs/
├── docs/                    ← All documentation pages (.mdx)
│   ├── customers/           ← Customer-related docs
│   ├── wallet/              ← Wallet docs
│   ├── product-catalogue/   ← Plans, Features, Coupons
│   ├── subscriptions/       ← Subscription workflows
│   ├── webhook/             ← Webhook reference
│   ├── event-ingestion/     ← Event & metering docs
│   └── ...
├── public/images/docs/      ← Screenshots referenced from docs
├── docs.json                ← Navigation config (Mintlify v2)
└── .claude/skills/          ← This skills directory
```

The docs site is at `https://docs.flexprice.io`. The `docs.json` at repo root controls all navigation.

---

## Step-by-Step: Writing a New Doc

### 1. Read Before Writing

Always read at least two nearby docs before writing — pick pages in the same section or covering similar topics. This ensures consistent tone, component choices, and structure.

```bash
# E.g. if writing a wallet doc:
cat docs/wallet/auto-top-up.mdx
cat docs/wallet/low-balance-alert.mdx
```

Also check `docs/webhook/webhooks.mdx` if the doc involves webhooks, and `docs/product-catalogue/features/wallet-balance-alert.mdx` for alert-related docs.

### 2. Pick the Right File Location

| Topic | Directory |
|-------|-----------|
| Customer management | `docs/customers/` |
| Wallet features | `docs/wallet/` |
| Plans, Features, Coupons | `docs/product-catalogue/` |
| Subscription workflows | `docs/subscriptions/` |
| Integrations | `integrations/<provider>/` |
| Webhooks / events | `docs/webhook/` or `docs/event-ingestion/` |
| Alerts & notifications | `docs/customers/` (customer-scoped) or nearest feature section |

### 3. Frontmatter

Every `.mdx` file starts with:

```mdx
---
title: "Page Title"
description: "One sentence describing what this page covers."
---
```

- `title`: Short noun phrase, title case
- `description`: Shown in search results and page meta — one sentence, no period

### 4. Opening Paragraph

Start with a plain prose paragraph (no heading) that explains what the feature is and why it matters. Keep it to 2–4 sentences. Do not repeat the `description` verbatim.

### 5. Benefits List (Optional)

For feature docs, a bold-bullet benefits list after the opening paragraph is conventional:

```mdx
**Benefits:**

- **Proactive management** — Description of why this matters
- **Granular control** — Description
- **Flexible conditions** — Description
```

### 6. Section Structure

Use `##` for top-level sections and `###` for subsections. Never use `#` (reserved for the page title) or go deeper than `###` in most docs.

---

## Mintlify MDX Components

### Callouts

```mdx
<Note>
  Informational note — use for helpful context or clarifications.
</Note>

<Info>
  Similar to Note but for more prominent informational content.
</Info>

<Warning>
  Use for gotchas, required conditions, or things that will break if ignored.
</Warning>

<Check>
  Use for best practices, recommendations, or "do this" guidance.
</Check>
```

### Steps (for configuration workflows)

```mdx
<Steps>
  <Step title="Navigate to the feature">
    Instructions here.
  </Step>

  <Step title="Configure settings">
    More instructions.
  </Step>
</Steps>
```

### Code Blocks

Single language:
```mdx
```json
{ "key": "value" }
```
```

Multiple languages side by side:
```mdx
<CodeGroup>
```bash cURL
curl ...
```

```javascript JavaScript
fetch(...)
```

```python Python
import requests
```
</CodeGroup>
```

### Tables

```mdx
| Column | Column |
|--------|--------|
| Value  | Value  |
```

Pipe-align all columns. Use bold (`**text**`) in first column when listing settings or fields.

### Cards and Links

```mdx
<Card icon="book-open" horizontal={true} href="/docs/..." title="Related Doc Title" />
```

Use `horizontal={true}` for inline card links at the bottom of a page.

### Frames (screenshots)

```mdx
<Frame>
  ![Alt text](/public/images/docs/Section/Page/image.png)
</Frame>
```

Only include `<Frame>` blocks when actual screenshots exist in the repo at the referenced path. **Do not include placeholder image references** — broken image links will fail the `mint broken-links` check.

---

## Webhook Payload Sections

When documenting a feature that emits webhooks, follow this structure:

```mdx
### Webhook Payload

**Event type:** `event.name.here`

```json
{
  "event_type": "event.name.here",
  "alert_type": "descriptor",
  "alert_status": "warning",
  ...
}
```

### Webhook Fields

| Field | Description |
|-------|-------------|
| `field_name` | What it contains |
| `nested.field` | Description |
```

Model new webhook events on existing ones — see `docs/wallet/low-balance-alert.mdx` (event: `wallet.alert`) and `docs/product-catalogue/features/wallet-balance-alert.mdx` (event: `feature.wallet_balance.alert`). For usage-based alerts, follow the `customer.usage.alert` / `feature.usage.alert` pattern established in `docs/customers/threshold-notifications.mdx`.

---

## Navigation: docs.json

After writing a new file, **always add it to `docs.json`**.

The navigation lives in `navigation.tabs[0].groups` (the Documentation tab). Structure:

```json
{
  "group": "Group Name",
  "icon": "icon-name",
  "pages": [
    "docs/path/to/page",
    {
      "group": "Sub-group Name",
      "pages": [
        "docs/path/to/nested-page"
      ]
    }
  ]
}
```

**Rules:**
- Flat page paths are relative to repo root, no `.mdx` extension
- Sub-groups use the same `{ "group": "...", "pages": [...] }` shape — no `icon` on sub-groups
- Always add new pages immediately after the most relevant existing page in the same section
- Never create a new top-level group without checking if an existing group is the right home

**Common icon names:** `users`, `wallet`, `webhook`, `layer-group`, `refresh`, `file-text`, `gear`, `bell`, `shield`, `code`, `book-open`, `plug`

---

## Validation Commands

Run these **before opening a PR**. Both use Node 22 (mintlify does not support Node 25+).

### Check for broken links

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" \
  /opt/homebrew/opt/node@22/bin/node \
  /opt/homebrew/lib/node_modules/mintlify/node_modules/@mintlify/cli/bin/index.js \
  broken-links
```

- **Pass**: no broken links in your new file — proceed to PR
- **Fail**: fix every broken link reported in your file; pre-existing broken links in other files are not your responsibility
- The most common cause: referencing a screenshot path in `<Frame>` that doesn't exist in `public/images/`

### Validate build structure

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" \
  /opt/homebrew/opt/node@22/bin/node \
  /opt/homebrew/lib/node_modules/mintlify/node_modules/@mintlify/cli/bin/index.js \
  validate
```

- Confirms `docs.json` is valid, all referenced pages exist, and no structural errors
- Pre-existing warning: `Invalid import path react in /components/Callout.tsx` — this is a known upstream issue, ignore it

### Dev server (visual check)

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" \
  /opt/homebrew/opt/node@22/bin/node \
  /opt/homebrew/lib/node_modules/mintlify/node_modules/@mintlify/cli/bin/index.js \
  dev --port 3333
```

The `.claude/launch.json` in this repo is configured to use this exact path. Use `preview_start` with the `"docs"` configuration.

**Node version note:** The system has Node 25 as default (`/opt/homebrew/bin/node`), which is unsupported by mintlify. Always prefix with `PATH="/opt/homebrew/opt/node@22/bin:$PATH"` or use the absolute node@22 binary path.

---

## Editorial Voice

| Do | Don't |
|----|-------|
| "Wallet balance alerts fire when…" | "We've added exciting new alerts that…" |
| "Configure thresholds per wallet" | "Powerful per-wallet configuration" |
| "Set `alert_enabled: true` to activate" | "Simply toggle the switch to enable" |
| Present tense: "Alerts trigger on…" | Future: "Alerts will trigger on…" |
| Second-person: "You can configure…" | First-person: "We allow you to…" |

- **No marketing adjectives**: skip "powerful", "flexible", "seamless", "robust", "easy"
- **Name the mechanism**: say what the API field or UI element is called
- **One idea per sentence**: split compound sentences
- **No trailing summaries**: don't end with "In summary, …" or "By using X, you can…"

---

## Checklist Before Opening a PR

- [ ] File is in the right directory (`docs/<section>/`)
- [ ] Frontmatter has `title` and `description`
- [ ] Page is added to `docs.json` in the correct group
- [ ] No `<Frame>` blocks reference images that don't exist in the repo
- [ ] `mint broken-links` passes with no new errors
- [ ] `mint validate` passes (the pre-existing `Callout.tsx` warning is acceptable)
- [ ] Dev server renders the page correctly (check heading hierarchy, code block syntax, table alignment)
- [ ] Internal links use `/docs/...` paths (not relative `../` paths)

---

## Known Pre-Existing Issues (Do Not Fix Unless Asked)

- **81 broken image links** across 29 files — all missing `/public/images/` screenshot assets. These exist in `main` and are not blocking.
- **`components/Callout.tsx` react import warning** — flagged by `mint validate`, pre-existing, not fixable from docs content.
