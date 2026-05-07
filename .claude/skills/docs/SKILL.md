---
name: docs
description: >
  Generate weekly changelog entries for Flexprice in the exact Mintlify MDX format used at docs.flexprice.io/docs/changelog.
  Use this skill whenever the user asks to write a changelog, create release notes, document what shipped this week,
  update the changelog, or prepare a weekly release entry.
  Trigger when the user mentions "changelog", "release notes", "what shipped", "weekly release", "shipped this week",
  "new release", "add changelog", "write changelog", "april changelog", "march changelog", or any month + "changelog".
  Trigger when the user wants to summarize recent PRs/commits into a changelog entry.
  Trigger even if the user just says something casual like "let's do the changelog", "time for release notes", or "do the docs".
  This skill knows the exact Mintlify MDX format, component syntax, editorial conventions, repo locations,
  and git commands needed to produce and directly write the changelog to the correct file.
---

# Flexprice Docs — Changelog Skill

Generate and **directly write** weekly changelog entries for Flexprice into `docs/changelog.mdx`, following the exact structure and editorial voice of the existing file.

## Repo Locations

All repos live at `/Users/tsage/Desktop/flexprice/`:

| Repo | Path | Purpose |
|---|---|---|
| Backend | `/Users/tsage/Desktop/flexprice/flexprice` | Go monolith — Gin, Ent ORM, Temporal, Kafka, ClickHouse |
| Frontend | `/Users/tsage/Desktop/flexprice/flexprice-front` | React + Vite + TypeScript dashboard |
| Docs | `/Users/tsage/Desktop/flexprice/flexprice-docs` | Mintlify MDX documentation site |

The changelog file is at:
```
/Users/tsage/Desktop/flexprice/flexprice-docs/docs/changelog.mdx
```

---

## Step-by-step Workflow

### 1. Determine the Date Range

Ask the user (or infer from context) what time window to cover. Typical cases:
- **Weekly**: last 7 days from today
- **Specific range**: "after March 30th through April 6th"

The changelog label date is the **end date** of the range (e.g., `April 6th 2026`).

### 2. Gather Raw Material

**IMPORTANT**: Use `git -C <path>` to run git from outside the repo directory. Do NOT `cd` into repos — shell state does not persist between commands.

```bash
# Backend — use upstream/develop (the canonical source of truth, NOT origin/main which is the fork)
git -C /Users/tsage/Desktop/flexprice/flexprice log \
  remotes/upstream/develop \
  --format="%h %ad %s" --date=short \
  --since="YYYY-MM-DD" --until="YYYY-MM-DD" \
  --no-merges 2>&1 | head -100

# Frontend — use origin (flexprice-front is not a fork, origin IS upstream)
git -C /Users/tsage/Desktop/flexprice/flexprice-front log \
  --format="%h %ad %s" --date=short \
  --since="YYYY-MM-DD" --until="YYYY-MM-DD" \
  --no-merges 2>&1 | head -100
```

**Key notes on the backend remote setup**:
- `origin` = Tsage's personal fork (`subratsahilgupta/flexprice`) — often out of date, missing recent commits
- `upstream` = the real flexprice org repo — use `remotes/upstream/develop` for the authoritative commit history
- Always run backend git log against `remotes/upstream/develop`, not `origin/main`

**If output is empty**, try `--all` to check all branches:
```bash
git -C /Users/tsage/Desktop/flexprice/flexprice log --all \
  --format="%h %ad %s" --date=short \
  --since="YYYY-MM-DD" --until="YYYY-MM-DD" 2>&1 | head -50
```

Run both backend and frontend queries in **parallel** (single message, two tool calls) for speed.

### 3. Cross-Reference Against Prior Changelog

Before writing, read the current top entry in `changelog.mdx` to avoid duplicating anything already published. Use the `Read` tool — anything already in the most recent `<Update>` block is off-limits.

### 4. Categorize Changes

Every commit goes into one of these buckets:

| Bucket | Criteria | Where it appears |
|---|---|---|
| **Major feature** | New user-facing capability, significant new API endpoint, new integration, new billing model, major dashboard feature | Gets its own `##` heading |
| **Improvement** | Enhancement to existing feature, perf optimization, UI polish, observability, DX improvement | Accordion → Improvements |
| **Fix** | Bug fix, data correction, edge-case handling | Accordion → Fixes |
| **API** | New or changed endpoints, SDK releases, OpenAPI spec changes | Accordion → API |

**Skip entirely** (do not include):
- Internal testing suite additions (integration test suites, testutil updates)
- WIP commits, `xyz`, `wip`, design spec docs
- CI/CD pipeline plumbing with no user-facing impact
- SDK README-only changes with no feature content

A typical entry has **3–6 major features** and then the accordion section. Only include accordion sections that have content.

### 5. Deep-Dive Into Major Features

For each major feature, read source code to understand what was built — commit messages alone are not enough.

```
flexprice/internal/api/         → HTTP handlers, request/response structs
flexprice/internal/service/     → Business logic, orchestration
flexprice/internal/domain/      → Domain models, enums, constants
flexprice/ent/schema/           → Database schema (Ent ORM)
flexprice/internal/temporal/    → Background workflow definitions
flexprice-front/src/pages/      → Dashboard page components
flexprice-front/src/components/ → Shared UI components
flexprice-front/src/api/        → API client hooks and types
flexprice-docs/docs/            → Existing documentation pages
flexprice-docs/public/images/   → Screenshots for changelog
```

- **Check for screenshots** in `flexprice-docs/public/images/docs/` — if relevant images exist, include them in a `<Frame>`
- **Check for existing docs** — look in `flexprice-docs/docs/` for a matching page; if found, link it with a `<Card>`

### 6. Write the Changelog Entry

Read `references/changelog.md` for the full annotated MDX template. Structural summary:

```mdx
<Update label="Month Xth YYYY">
  ## Feature Heading 1

  Brief 1-2 sentence description.

  * **Sub-feature**: Detail
  * **Sub-feature**: Detail

  <br />

  <Frame>
    <img src="/public/images/docs/..." alt="..." style={{ borderRadius: '0.5rem' }} />
  </Frame>

  <br />

  <Card icon="book-open" horizontal={true} href="/docs/..." title="Feature - Documentation" />

  <br />

  ## Feature Heading 2

  Description.

  * **Label**: Detail

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
      * Bullet
    </Accordion>
  </AccordionGroup>
</Update>
```

**Formatting rules**:

1. **Date label**: `<Update label="Month Xth YYYY">` with ordinal suffixes (1st, 2nd, 3rd, 4th…23rd, 24th…30th, 31st)
2. **`##` headings** for each major feature — never `#` or `###`
3. **Description**: 1-2 sentences, neutral or second-person voice ("Subscriptions now support…")
4. **Bullets**: `* **Bold label**: Description` — every bullet starts with a bolded label
5. **`<br />`** between every section (after bullets, after Frame, after Card, before "Other changes")
6. **Images**: `<Frame><img src="..." alt="..." style={{ borderRadius: '0.5rem' }} /></Frame>`
7. **Cards**: icon `"book-open"` for docs, `"code"` for API reference; always `horizontal={true}`
8. **Accordion bullets**: use `*` (not `-`), 6-space indent inside the `<Accordion>` tag
9. **2-space indentation** throughout the `<Update>` block
10. **No marketing words**: skip "exciting", "powerful", "seamless" — just describe what it does

### 7. Directly Write to the Changelog File

**Do NOT save to a separate staging file.** Write directly to `changelog.mdx` by prepending the new `<Update>` block right after the frontmatter `---` line (line 6), before the first existing `<Update>`.

Use the `Edit` tool:
- `old_string`: the closing `---` of the frontmatter + blank line + opening of the PREVIOUS top `<Update>` tag (e.g., `---\n\n<Update label="March 30th 2026">`)
- `new_string`: `---\n\n` + new `<Update>` block + `\n\n<Update label="March 30th 2026">`

Verify by reading the first ~100 lines of the file after saving.

### 8. Check for Broken Links

**Before opening a PR**, run the Mintlify broken-links checker from the docs repo root:

```bash
cd /Users/tsage/Desktop/flexprice/flexprice-docs && mint broken-links
```

- If it passes cleanly — proceed to the PR step.
- If it reports broken links — fix every broken link in the changelog entry you just wrote, then re-run until clean. Do not open a PR with broken links.

### 9. Open a PR Branched from Upstream Main

The flexprice-docs repo has two remotes:
- `upstream` = the production repo (`flexprice/flexprice-docs`) — always branch from here

```bash
cd /Users/tsage/Desktop/flexprice/flexprice-docs

# Fetch latest production main
git fetch upstream
git checkout upstream/main
git checkout -b changelog/<LABEL>   # e.g. changelog/May-11th-2026

# Stage and commit
git add docs/changelog.mdx
git commit -m "docs(changelog): add weekly entry for <LABEL>"

# Push to origin and open PR against upstream/main
git push origin changelog/<LABEL>
gh pr create \
  --title "docs(changelog): <LABEL>" \
  --base main \
  --body "Weekly changelog entry covering <SINCE> → <UNTIL>."
```

The branch name is always `changelog/<LABEL>` where `<LABEL>` matches the `<Update>` label exactly — e.g. `changelog/May-11th-2026`.

Return the PR URL to the user.

---

## Editorial Voice

- **Neutral or second-person**: "Subscriptions now support…" or "You can now configure…" — not "We added…"
- **Concise**: One to two sentences per description. Every word earns its place.
- **Technical but accessible**: Name the mechanism (API endpoint, config field, UI component) and the user benefit
- **Present tense**: "Invoices now show…" not "We've added…" or "Invoices will show…"
- **No fluff**: Skip "exciting", "powerful", "seamless", "robust"

---

## Reference Files

Read `references/changelog.md` for the **full annotated MDX template** with real examples from the existing changelog, inline comments explaining every section, and integration instructions.
