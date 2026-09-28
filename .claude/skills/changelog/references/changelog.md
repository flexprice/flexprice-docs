# Changelog entry format

The single owner of entry structure, formatting, and voice for `docs/changelog.mdx`.

## File anatomy

- The frontmatter (title, description, `mode: "center"`) stays untouched.
- New `<Update>` blocks go immediately after the frontmatter, newest first.
- The `changelog-coverage` comment ([coverage.md](coverage.md)) sits immediately inside the new block.
- The closing `<Note>` footer (GitHub releases link) stays untouched.

## Template

```mdx
<Update label="Month Xth YYYY">
  ## Feature Title

  One or two sentence description of what this enables.

  * **Sub-feature name**: What this specific aspect does
  * **Another sub-feature**: Detail on a different aspect

  <br />

  <Frame>
    <img src="/images/docs/Category/screenshot.png" alt="Descriptive alt text" style={{ borderRadius: '0.5rem' }} />
  </Frame>

  <br />

  <Card icon="book-open" horizontal={true} href="/docs/section/page" title="Feature name - Documentation" />

  <br />

  ## Another Feature Title

  Description.

  * **Label**: Detail

  <br />

  <Card icon="code" horizontal={true} href="/api-reference/resource/endpoint" title="Endpoint name - API Reference" />

  <br />

  **Other changes**

  <AccordionGroup>
    <Accordion title="Improvements">
      * Bullet
    </Accordion>

    <Accordion title="Fixes">
      * Bullet
    </Accordion>

    <Accordion title="API">
      * New `POST /v1/events/raw/bulk` endpoint for bulk raw event ingestion
    </Accordion>
  </AccordionGroup>
</Update>
```

For real house style, read the top two `<Update>` blocks of the published file (already fetched in Step 2 via `git show "<DOCS_SHA>:docs/changelog.mdx"`). Copy their structure, never their em dashes: older entries predate that rule.

## Formatting rules

1. Label: `Month Xth YYYY` with ordinal suffixes (1st, 2nd, 3rd, 4th through 20th, 21st, 22nd, 23rd, 24th through 30th, 31st).
2. `##` heading per major feature, never `#` or `###`.
3. Description: 1 to 2 sentences, neutral or second person ("Subscriptions now support...", "You can now...").
4. Feature bullets: `* **Bold label**: Detail`. Accordion bullets may be plain.
5. `<br />` on its own line between sections: after bullets, after a Frame, after a Card, and before **Other changes**.
6. Images: only when a screenshot exists in `images/docs/` and depicts the feature; path from the docs root (`/images/docs/...`); always `style={{ borderRadius: '0.5rem' }}` and descriptive `alt`.
7. Cards: always `horizontal={true}`. Docs cards use `icon="book-open"` and title `"Feature name - Documentation"`; API cards use `icon="code"` and `"Endpoint name - API Reference"`. `href` must match a Mintlify route in `docs.json`; a resolving route alone does not prove the page covers the new behavior (apply [verification.md](verification.md)).
8. Accordion: at the bottom, preceded by `**Other changes**`; include only sections with content; `*` bullets (not `-`) with 6-space indent; backticks for code references (`DRAFT`, `POST /v1/events/raw/bulk`); one concise, specific line per bullet.
9. 2-space indentation throughout the `<Update>` block.
10. Voice: present tense ("Invoices now show...", not "We've added..."); name the mechanism (endpoint, config field, UI component) and the user benefit; no "We added..."; no marketing words (exciting, powerful, seamless, robust); every word earns its place.
11. No em dashes anywhere in the entry: use a comma, colon, or a new sentence.

## Categorization examples (heading vs accordion)

- `##` heading: a new integration (Paddle payments), a new capability (draft subscriptions, inherited subscriptions), a new endpoint category (bulk event ingestion, invoice internal preview), a major SDK release (SDK v2.1), a new dashboard section (organization members, wallet alerts, plan cloning).
- Improvements: UI default changes (customer list filters PUBLISHED), observability (Sentry span fields), infra swaps (webhook delivery moved to Kafka), dependency bumps, worker tuning.
- Fixes: bug fixes, correctness (idempotency key precision), security (webhook secrets obscured), query correctness (ClickHouse `FINAL` removal).
- API: new endpoints, new filters or fields (`DRAFT` status filtering), SDK releases, SDK CI changes.

## Integration

Prepend with the `Edit` tool per workflow.md Step 6 (newest entry always on top), read the whole new block afterwards, and run the Step 7 checks. Commit, push, and PR are the wrapper's decision; Mintlify auto-deploys once the entry reaches `main`.
