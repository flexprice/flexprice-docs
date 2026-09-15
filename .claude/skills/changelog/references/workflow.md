# Changelog Workflow (shared core)

This file is the content core for the `changelog` skill. It covers everything about the **content** of a weekly entry: which commits to read, how to sort them, how to write the entry, and how to check it.

The wrapper skill that loaded this file has already:

- resolved `SINCE`, `UNTIL`, and `LABEL`
- made sure `../flexprice` and `../flexprice-front` exist with an `upstream` remote
- decided what a **Stop** means (tell the user, or end the run with a report)

The wrapper also chooses the docs branch between Part 1 and Part 2.

**Division of labour.** Environment setup, questions, branches, commits, and pull requests belong in the wrapper, never here. Repo paths, git refs, and shell conventions that the content steps depend on are stated here once so both wrappers share them. Anything about the entry itself belongs here or in `changelog.md`, never in a wrapper.

Part 1 only reads. Part 2 changes exactly one file.

---

## Repo Locations

Run commands from the docs repo root. Paths assume the backend and frontend repos are siblings.

| Repo | Path | Purpose |
|---|---|---|
| Backend | `../flexprice` | Go monolith: Gin, Ent ORM, Temporal, Kafka, ClickHouse |
| Frontend | `../flexprice-front` | React + Vite + TypeScript dashboard |
| Docs | `.` | Mintlify MDX documentation site |

The changelog file is `docs/changelog.mdx`.

**IMPORTANT**: Use `git -C <path>` to run git from outside the repo directory. Do NOT `cd` into repos, since shell state does not persist between commands.

All commit queries and source reads go through the fetched ref `remotes/upstream/main`, never through the checked-out files of the code repos. `origin` is a personal fork and may be behind; `upstream` is the flexprice org repo. Fetching updates the ref without touching working trees. Never pull, checkout, stash, or reset in the code repos.

---

# Part 1: Research (reads only)

Part 1 reads commits and source and produces a plan: which changes are major features and what they do, which items go in each accordion, and which docs cards and screenshots apply. Nothing is written to the repo.

Check: `git status --porcelain` prints nothing new when Part 1 ends.

## Step 1. Gather Raw Material

```bash
# Backend: use upstream/main (the canonical source of truth, NOT origin/main which is the fork)
git -C ../flexprice fetch upstream && \
git -C ../flexprice log \
  remotes/upstream/main \
  --format="%h %ad %s" --date=short \
  --since="YYYY-MM-DD" --until="YYYY-MM-DD" \
  --no-merges 2>&1 | head -100

# Frontend: use upstream/main (production; origin is the personal fork)
git -C ../flexprice-front fetch upstream && \
git -C ../flexprice-front log remotes/upstream/main \
  --format="%h %ad %s" --date=short \
  --since="YYYY-MM-DD" --until="YYYY-MM-DD" \
  --no-merges 2>&1 | head -100
```

Replace `YYYY-MM-DD` with `SINCE` and `UNTIL` from the wrapper.

If a log prints exactly 100 lines it may be cut off. Rerun that query with `head -300` so no commit is dropped.

Run both backend and frontend queries in **parallel** (single message, two tool calls) for speed.

**Stop** if either fetch fails: the log would be stale or empty for the wrong reason.

**Stop** if both logs are empty: no commits landed between `SINCE` and `UNTIL`.

## Step 2. Cross-Reference Against the Prior Changelog

Read the top entry of the changelog as published on `upstream/main`, not the working tree, which may be behind:

```bash
git fetch upstream
git show upstream/main:docs/changelog.mdx | sed -n '1,/<\/Update>/p'
```

Anything already in that `<Update>` block is off-limits, even if it falls inside the `SINCE` to `UNTIL` window. This is what keeps overlapping windows from producing duplicate items.

**Stop** if the top entry's label equals `LABEL`: this week is already published.

## Step 3. Categorize Changes

Every commit goes into one of these buckets:

| Bucket | Criteria | Where it appears |
|---|---|---|
| **Major feature** | New user-facing capability, significant new API endpoint, new integration, new billing model, major dashboard feature | Gets its own `##` heading |
| **Improvement** | Enhancement to existing feature, perf optimization, UI polish, observability, DX improvement | Accordion: Improvements |
| **Fix** | Bug fix, data correction, edge-case handling | Accordion: Fixes |
| **API** | New or changed endpoints, SDK releases, OpenAPI spec changes | Accordion: API |

**Skip entirely** (do not include):
- Internal testing suite additions (integration test suites, testutil updates)
- WIP commits, `xyz`, `wip`, design spec docs
- CI/CD pipeline plumbing with no user-facing impact
- SDK README-only changes with no feature content

A typical entry has **3 to 6 major features** and then the accordion section. Only include accordion sections that have content. An entry with no major feature and only accordion items is allowed.

**Stop** if nothing remains after categorizing: every commit fell into the skip list.

## Step 4. Deep-Dive Into Major Features

For each major feature, read source code to understand what was built. Commit messages alone are not enough.

For backend and frontend source, list files with `git -C <repo> ls-tree -r --name-only upstream/main` and read them with `git -C <repo> show upstream/main:<path>`. Here, `<path>` is relative to the code repo. Read from this fetched ref, not the current working tree, which may contain older code or unfinished changes.

```
../flexprice/internal/api/         : HTTP handlers, request/response structs
../flexprice/internal/service/     : Business logic, orchestration
../flexprice/internal/domain/      : Domain models, enums, constants
../flexprice/ent/schema/           : Database schema (Ent ORM)
../flexprice/internal/temporal/    : Background workflow definitions
../flexprice-front/src/pages/      : Dashboard page components
../flexprice-front/src/components/ : Shared UI components
../flexprice-front/src/api/        : API client hooks and types
docs/                              : Existing documentation pages
images/docs/                       : Screenshots for changelog
```

- **Check for screenshots** in `images/docs/`. If a relevant image exists, include it in a `<Frame>`
- **Check for existing docs**: look in `docs/` for a matching page; if found, link it with a `<Card>`

Check `docs/` and `images/docs/` on `upstream/main` (`git ls-tree -r --name-only upstream/main docs images/docs`), since that is what the branch will contain. If the file is not there, leave the `<Frame>` or `<Card>` out. The entry links to what exists; it never adds an image or a page.

Part 1 ends with a plan: the list of major features with a one-line summary each, the accordion items per bucket, and the cards and screenshots that will be linked.

---

# Part 2: Write (changes exactly one file)

The wrapper has put the docs repo on the right branch before this part starts.

## Step 5. Baseline Broken-Links Check (before)

From the docs repo root, run the link checker. Try these in order and use the first one that runs; use the same one again in Step 7. "Runs" means the command is found and prints a report. A non-zero exit with a list of broken links counts as running; "command not found" or a download failure does not.

```bash
mintlify broken-links
mint broken-links
npx --yes mint broken-links
```

Keep the reported broken links as the **before** baseline.

**Stop** if none of the three runs (for example, no CLI installed and no network for `npx`).

## Step 6. Write the Entry into docs/changelog.mdx (the only file you touch)

Write the entry once, straight into the file, from the Part 1 plan. There is no separate draft.

**Do NOT save to a separate staging file.** Write directly to `docs/changelog.mdx` by prepending the new `<Update>` block right after the closing `---` of the frontmatter, before the first existing `<Update>`.

Use the `Edit` tool. Take the previous top `<Update>` tag from the working-tree file (the file you are editing), which is the same as the `upstream/main` copy when the branch was cut from it:
- `old_string`: the closing `---` of the frontmatter + blank line + the previous top `<Update>` tag (e.g., `---\n\n<Update label="<previous label>">`)
- `new_string`: `---\n\n` + new `<Update>` block + `\n\n<Update label="<previous label>">`

Verify by reading the first ~100 lines of the file after saving.

Then confirm with `git status --porcelain --untracked-files=no` that `docs/changelog.mdx` is the only file that changed since Step 5. Files that were already modified before Part 2 began are not yours and do not count.

Read `changelog.md` in this folder for the full annotated MDX template. Structural summary:

```mdx
<Update label="Month Xth YYYY">
  ## Feature Heading 1

  Brief 1-2 sentence description.

  * **Sub-feature**: Detail
  * **Sub-feature**: Detail

  <br />

  <Frame>
    <img src="/images/docs/..." alt="..." style={{ borderRadius: '0.5rem' }} />
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

1. **Date label**: `<Update label="Month Xth YYYY">` with ordinal suffixes (1st, 2nd, 3rd, 4th to 20th, 21st, 22nd, 23rd, 24th to 30th, 31st)
2. **`##` headings** for each major feature, never `#` or `###`
3. **Description**: 1-2 sentences, neutral or second-person voice ("Subscriptions now support...")
4. **Bullets**: `* **Bold label**: Description`. Every bullet starts with a bolded label
5. **`<br />`** between every section (after bullets, after Frame, after Card, before "Other changes")
6. **Images**: `<Frame><img src="..." alt="..." style={{ borderRadius: '0.5rem' }} /></Frame>`
7. **Cards**: icon `"book-open"` for docs, `"code"` for API reference; always `horizontal={true}`
8. **Accordion bullets**: use `*` (not `-`), 6-space indent inside the `<Accordion>` tag
9. **2-space indentation** throughout the `<Update>` block
10. **No marketing words**: skip "exciting", "powerful", "seamless". Just describe what it does
11. **No em dashes** anywhere in the entry. Use a comma, colon, or a new sentence. Older entries quoted in `changelog.md` predate this rule; copy their structure, not their dashes

## Step 7. Broken-Links Check Again (after must match before)

Run the same command as Step 5. If it reports new broken links, fix them in `docs/changelog.mdx` and rerun. The reported broken links must match **before**; leave pre-existing broken links unchanged.

**Stop** if the lists still differ after three fix attempts.

When Step 7 passes, Part 2 is done. The wrapper decides what happens to the file next.

---

## Editorial Voice

- **Neutral or second-person**: "Subscriptions now support..." or "You can now configure...", not "We added..."
- **Concise**: One to two sentences per description. Every word earns its place.
- **Technical but accessible**: Name the mechanism (API endpoint, config field, UI component) and the user benefit
- **Present tense**: "Invoices now show..." not "We've added..." or "Invoices will show..."
- **No fluff**: Skip "exciting", "powerful", "seamless", "robust"

---

## Reference Files

Read `changelog.md` in this folder for the **full annotated MDX template** with real examples from the existing changelog, inline comments explaining every section, and integration instructions.
