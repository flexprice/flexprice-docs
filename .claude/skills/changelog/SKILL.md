---
name: changelog
description: >
  Use when someone asks for a Flexprice changelog entry, release notes, what shipped this week,
  or recent commits and PRs summarised into a changelog, or asks to review, check, fix, or revise
  a drafted entry in docs/changelog.mdx (including one written by another session or routine).
---

# Changelog (interactive)

Writes the weekly entry into `docs/changelog.mdx` while a person is present to approve the plan and decide what happens to the result. This file covers the session: inputs, repo setup, the approval point, and the git policy. Content rules live in `references/` and are read at the step that needs them, not upfront:

| File | Read it when |
|---|---|
| `references/workflow.md` | running the research and write steps |
| `references/coverage.md` | resolving ranges (Step 1) and recording coverage |
| `references/verification.md` | verifying claims (Step 4) and the finished entry (Step 7) |
| `references/changelog.md` | writing the MDX (Step 6) |

**Stop** means: tell the user why and end the turn. In Part 1 nothing has been written; in Part 2 leave `docs/changelog.mdx` and the branch exactly as they are and say what state they are in.

## Inputs

| Input | Default |
|---|---|
| `UNTIL` | today (`date -u +%F`); each range ends at the fetched tip |
| Starting SHAs | backend and frontend `to` values of the latest completed coverage record on docs `upstream/main` |
| `SINCE` | unset; a user-supplied date is only for an initial baseline or a bounded historical request |
| `LABEL` | first Monday on or after `UNTIL` as `Month Xth YYYY` (entries publish on Mondays) |
| `BRANCH` | `changelog/<LABEL with hyphens>`, e.g. `changelog/September-13th-2026` |
| `OWNER` | owner of `origin`: `git remote get-url origin \| sed -E 's#.*[:/]([^/]+)/[^/]+$#\1#'` |

Default `LABEL` date:

```bash
N=$(( (8 - $(date -u -d "$UNTIL" +%u 2>/dev/null || date -u -j -f %F "$UNTIL" +%u)) % 7 ))
date -u -d "$UNTIL +$N days" +%F 2>/dev/null || date -u -j -v+${N}d -f %F "$UNTIL" +%F
```

Use an explicit user range when supplied; otherwise continue from the recorded coverage SHAs. "Last week" is a bounded historical request, not permission to reset the ongoing checkpoint. Never derive the start from a docs commit date, a heading search, or an assumed seven days. State the requested cutoff first, then the resolved backend and frontend SHA ranges after fetching. A user-supplied publication date sets `LABEL` but keeps the research window; a scheduled future label is valid. For a bounded historical request, ask which label to use: the default can collide with the next weekly entry.

## Prepare the repos

Sibling checkouts `../flexprice` and `../flexprice-front` must exist. If one is missing, offer `git clone https://github.com/flexprice/<repo> ../<repo>`; clone only after a yes, stop on a no. Never write the entry from commit titles, PR pages, or memory in place of source.

```bash
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream https://github.com/flexprice/flexprice-docs
git -C ../flexprice remote get-url upstream >/dev/null 2>&1       || git -C ../flexprice remote add upstream https://github.com/flexprice/flexprice
git -C ../flexprice-front remote get-url upstream >/dev/null 2>&1 || git -C ../flexprice-front remote add upstream https://github.com/flexprice/flexprice-front
git fetch upstream
git -C ../flexprice fetch upstream
git -C ../flexprice-front fetch upstream
```

**Stop** if any fetch fails. Capture the full backend, frontend, and docs `upstream/main` SHAs (docs is `DOCS_SHA`), then resolve and freeze the ranges per `references/coverage.md`. All later source reads use the captured SHAs, even if a remote ref moves.

## New entry: run the workflow

1. Run Part 1 (Steps 1 to 4) of `references/workflow.md`. It only reads.
2. Show the plan: both `from..to` ranges, each major feature with its one-line summary, the accordion items per bucket, and the Skipped list with each reason, so an omission can be vetoed. Ask whether to write it as is or change anything. Touch the docs repo only after they say go.
3. Choose the branch (below).
4. Run Part 2 (Steps 5 to 7). It changes only `docs/changelog.mdx`. If Step 5 falls back to `npx --yes mint broken-links` (a download), say so in one line.
5. Hand off (below).

## Choose the branch

After the go-ahead, before Part 2, so a Stop or a "not now" leaves no branch behind:

- Clean tree (`git status --porcelain` prints nothing): `git checkout -b <BRANCH> <DOCS_SHA>`. If `<BRANCH>` already exists, ask whether to reuse it as is or reset it with `git checkout -B <BRANCH> <DOCS_SHA>`.
- Dirty tree: ask whether to write on the current branch or clean up first. Never stash, discard, or commit their changes. If they clean up, wait, re-run the check, and take the clean path.

Writing on the current branch is allowed; `<BRANCH>` then means whichever branch holds the edit. Once on it, check the working tree for this week's label (Step 2 only looked at `DOCS_SHA`; a reused branch can hold an unpublished draft):

```bash
grep -n "<Update label=\"$LABEL\">" docs/changelog.mdx
```

If it matches, ask whether to replace that draft or leave it and end the turn. Never prepend a second block for the same label. Replacing means deleting the old block (its `<Update>` line through the matching `</Update>` and the blank line after) before Part 2, so Step 6 writes exactly one entry for `LABEL`.

## Reviewing an existing draft

When asked to review, check, or fix an entry already in `docs/changelog.mdx`, treat the draft as claims to test, not research. Take `LABEL` and both `from..to` ranges from its coverage record, even if marked incomplete; do not extend the cutoff to today unless asked. Prepare the repos and run Part 1 against those fixed ranges. If the draft has no record, follow the initial-baseline procedure in `references/coverage.md` and report completeness as unverified. Then:

1. Apply `references/verification.md` to every assertion in the block, including accordion bullets, cards, and images.
2. Compare the draft with the Part 1 plan in both directions: shipped user-facing items the draft leaves out, and draft items not in the Step 1 lists.
3. Run the Step 5 and Step 7 checks against the file as it is. There is no separate "before" run: findings inside the draft block belong to the draft, everything outside is pre-existing.
4. Report which branch holds the draft and any commits on it that are not on `DOCS_SHA`.

Report findings grouped as wrong, imprecise, missing, and housekeeping, each with its evidence. Edit nothing until the user says go. Then change only that `<Update>` block in place (Step 6's prepend does not apply), add its coverage record or update it to the reviewed ranges, and run Step 7 again.

## Hand-off

Do not commit and do not push. The user decides what happens to the file. Never run `gh`. Show:

1. `git status --short` and `git diff --stat`
2. Separate outcomes for source verification, link checks, and build validation; identify pre-existing failures and checks that could not run
3. The new entry, so they can read it in the conversation
4. Omitted claims or cards, and stale guides or OpenAPI fields, with source references and reasons. Keep these outside the publishable entry; do not change other files to resolve them
5. Both exact `from..to` ranges and whether the coverage record is complete (a draft's record becomes a baseline only after publication)

Then the commands they can run themselves:

```bash
git add docs/changelog.mdx
git commit -m "docs(changelog): add weekly entry for <LABEL>"
git push origin <BRANCH>
```

and the compare URL for a PR: `https://github.com/flexprice/flexprice-docs/compare/main...<OWNER>:<BRANCH>?expand=1`.

If the user asks you to commit or push, confirm once more before each command, and run only that command.
