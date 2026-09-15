---
name: changelog
description: >
  Use when a person in a session asks for a Flexprice changelog entry, release notes, what shipped this week,
  a weekly release, "add changelog", "write changelog", or any month plus "changelog", or says something casual
  like "let's do the changelog", "time for release notes", or "do the docs". Also use when they want recent
  commits or PRs summarised into a changelog entry. The unattended weekly routine does not use this skill;
  it follows `.mintlify/changelog-instructions.md` instead.
---

# Changelog (interactive)

Writes the weekly entry into `docs/changelog.mdx` while a person is present to answer questions and to decide what happens to the result.

The content steps live in `references/workflow.md`. This file covers only what is specific to a laptop session: inputs, the environment, the approval point, and the git policy. Do not put content rules here.

---

## Inputs

| Input | Default | Used for |
|---|---|---|
| `UNTIL` | today, from `date -u +%F` | end of the window and the label date |
| `SINCE` | `UNTIL` minus 7 days: `date -u -d "$UNTIL -7 days" +%F 2>/dev/null \|\| date -u -j -v-7d -f %Y-%m-%d "$UNTIL" +%Y-%m-%d` | start of the window |
| `LABEL` | `UNTIL` as `Month Xth YYYY` (e.g. `September 13th 2026`) | the `<Update label>` |
| `BRANCH` | `changelog/<LABEL with spaces as hyphens>` (e.g. `changelog/September-13th-2026`) | the branch to write on |
| `OWNER` | owner of `origin`: `git remote get-url origin \| sed -E 's#.*[:/]([^/]+)/[^/]+$#\1#'` | the compare URL in the hand-off |

Use whatever range the user gave. "Last week" or no range means the defaults; say the resolved `SINCE` and `UNTIL` in your first message. If the range is ambiguous ("after the 30th"), ask before running anything. Overlap with the previous published entry is fine: Step 2 of the workflow excludes anything already published.

---

## Prepare the Repos

The sibling checkouts `../flexprice` and `../flexprice-front` must already exist. If one is missing, tell the user and stop. Do not clone repos onto their machine without being asked.

Add the `upstream` remote wherever it is missing, then fetch all three. Working trees stay untouched.

```bash
git remote get-url upstream >/dev/null 2>&1 || git remote add upstream https://github.com/flexprice/flexprice-docs
git -C ../flexprice remote get-url upstream >/dev/null 2>&1       || git -C ../flexprice remote add upstream https://github.com/flexprice/flexprice
git -C ../flexprice-front remote get-url upstream >/dev/null 2>&1 || git -C ../flexprice-front remote add upstream https://github.com/flexprice/flexprice-front
git fetch upstream
git -C ../flexprice fetch upstream
git -C ../flexprice-front fetch upstream
```

---

## Run Part 1 of the Workflow

Read `references/workflow.md` and run Part 1 (Steps 1 to 4). It only reads.

A **Stop** in this skill means: tell the user why, and end the turn. In Part 1 nothing has been written. In Part 2 leave `docs/changelog.mdx` and the branch exactly as they are, say what state they are in, and let the user decide.

---

## Show the Plan and Get a Go-Ahead

Part 1 ends with a plan. Show it to the user as a short list: each major feature with its one-line summary, then the accordion items per bucket. Ask whether to write it as is or change anything. Do not touch the docs repo until they say go.

---

## Choose the Branch

Do this after the go-ahead and before Part 2, so a Stop in Part 1 or a "not now" leaves no branch behind.

- If `git status --porcelain` prints nothing: `git checkout -b <BRANCH> upstream/main`. If `<BRANCH>` already exists locally, ask the user whether to reuse it as is or reset it to `upstream/main` with `git checkout -B <BRANCH> upstream/main`.
- If it prints anything: ask the user whether to write on the current branch or to clean up first. Never stash, discard, or commit their changes to make room. If they choose to clean up, wait for them to say it is done, then run `git status --porcelain` again and take the clean-tree path.

Writing on the current branch is allowed. Step 6 of the workflow takes the previous `<Update>` tag from the working-tree file, so an older or newer local copy still edits correctly. From here on, `<BRANCH>` means whichever branch holds the edit: the new one, or the current one if the user chose it.

Once on `<BRANCH>`, check the working-tree file for this week's label. Step 2 only looked at `upstream/main`, so a reused branch can already hold an unpublished draft:

```bash
grep -n "<Update label=\"$LABEL\">" docs/changelog.mdx
```

If it matches, tell the user and ask whether to replace that draft with the new plan or leave it and end the turn. Never prepend a second block for the same label. If they choose to replace it, delete the existing block (its `<Update label="$LABEL">` line through the matching `</Update>` and the blank line after it) before running Part 2, so Step 6 sees the previous published entry at the top and writes exactly one entry for `LABEL`.

---

## Run Part 2 of the Workflow

Run Part 2 (Steps 5 to 7). It changes only `docs/changelog.mdx`. Step 5 may fall back to `npx --yes mint broken-links`, which downloads a package; mention it in one line if that fallback is the one that runs.

---

## Hand-off

Do not commit and do not push. The user decides what happens to the file. Never run `gh`.

Show the user:

1. `git status --short` and `git diff --stat`
2. The outcome of the Step 7 link check, in one line
3. The new entry, so they can read it in the conversation

Then give them the commands they can run themselves:

```bash
git add docs/changelog.mdx
git commit -m "docs(changelog): add weekly entry for <LABEL>"
git push origin <BRANCH>
```

and the compare URL for opening a pull request from the pushed branch: `https://github.com/flexprice/flexprice-docs/compare/main...<OWNER>:<BRANCH>?expand=1`.

If the user asks you to commit or push, confirm once more before each command, and run only that command.
