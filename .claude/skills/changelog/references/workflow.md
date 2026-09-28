# Changelog workflow (shared core)

Content steps for the weekly entry. The wrapper that loaded this file has already resolved `UNTIL`, `LABEL`, and the range request, prepared `../flexprice` and `../flexprice-front` with an `upstream` remote, and defined **Stop** (tell the user why and end the turn). The wrapper owns questions, branches, commits, and PRs, and chooses the branch between Part 1 and Part 2.

Part 1 only reads. Part 2 changes exactly one file, `docs/changelog.mdx`.

## Conventions

| Repo | Path |
|---|---|
| Backend (Go: Gin, Ent, Temporal, Kafka, ClickHouse) | `../flexprice` |
| Frontend (React + Vite + TypeScript dashboard) | `../flexprice-front` |
| Docs (Mintlify MDX; the changelog is `docs/changelog.mdx`) | `.` |

- Run from the docs root and use `git -C <path>`; never `cd` (shell state does not persist between commands).
- Write `"${SHA}:path"` with braces. In zsh, `$SHA:src/...` (even quoted) reads `:s`, `:a`, `:h`, `:t` as modifiers: `git show "$T:src/app.ts"` silently prints the commit instead of the file.
- Select ranges from the fetched org `main` history and query the captured SHAs, never the checked-out code or a moving ref. `origin` is a personal fork and may be behind; `upstream` is the flexprice org repo. Never pull, checkout, stash, or reset in the code repos.

# Part 1: Research (reads only)

Produces a plan; writes nothing. Check that `git status --porcelain` prints nothing new when Part 1 ends.

## Step 1. Gather raw material

Read [coverage.md](coverage.md); resolve both ranges and validate their objects and ancestry. For each repository run both queries, backend and frontend in parallel (one message, multiple tool calls):

```bash
git -C <repo> log --first-parent --format="%H %cI %s" "<FROM>..<TO>"   # promotions on main
git -C <repo> log --format="%H %cI %s" "<FROM>..<TO>"                  # all newly reachable commits
```

Never apply `--since`, `--until`, or `--no-merges` to the only candidate list: work promoted from `develop` carries old commit dates, and an early date is never a reason to skip a newly reachable commit. Inspect promotion diffs against their first parents for merge-only changes.

A squashed frontend promotion (`D2M (#1448)`, `Develop (#1443)`, `Release 2026-09-23 (#1435)`) bundles several PRs: read its body with `git -C ../flexprice-front show -s --format=%B <sha>` and treat each listed PR as a candidate. Bundle bodies repeat PR numbers within a range and across weeks; an earlier mention is a lead for comparison, not proof the current promotion adds nothing. Before deduplicating a repeated PR, diff the affected paths in each candidate promotion against its first parent (`git -C <repo> diff "<SHA>^1" "<SHA>" -- <paths>`) and compare behavior at `FROM` and `TO`. Deduplicate the verified change, not the PR number: keep genuine restorations after a revert, extensions, and reversals. Omit a repeat only with recorded promotion/path evidence and a reason on the Skipped list; if its scope is uncertain, keep it unresolved.

Read both lists to the end; never pipe through `head` (one promotion can bring hundreds of commits). If a list overflows one tool result, redirect it to a scratch file and read it in parts.

An empty range in one repository is valid. New entry: **stop** for lack of changes only when both ranges are empty; failed fetches, missing SHAs, and invalid ancestry are errors, never evidence that nothing shipped. Review mode: continue checking the draft even if both ranges are empty.

## Step 2. Cross-reference the published changelog

Read the published file at the captured SHA, not a moving ref or the working tree:

```bash
git show "<DOCS_SHA>:docs/changelog.mdx"
```

Check all entries published since the baseline, and older entries when a candidate repeats a feature. Never repeat an announced change; describe a later restoration, extension, or reversal explicitly. This also deduplicates against published entries whose coverage records were absent or incomplete. New entry: **stop** if `LABEL` is already published. Review mode: review the requested block normally but exclude it from this comparison.

## Step 3. Categorize

| Bucket | Criteria | Placement |
|---|---|---|
| Major feature | new user-facing capability, significant endpoint, new integration, new billing model, major dashboard feature | own `##` heading |
| Improvement | enhancement, perf, UI polish, observability, DX | accordion: Improvements |
| Fix | bug fix, data correction, edge case | accordion: Fixes |
| API | new or changed endpoints, SDK releases, OpenAPI changes | accordion: API |

Skip outright: internal test suites, WIP/`xyz` commits, design spec docs, CI plumbing with no user-facing impact, SDK README-only changes. Anything a user could notice that you leave out goes on a **Skipped** list with its SHA or PR number and a one-phrase reason (internal only, defaults off, reverted in the same window, already published on a given date); a commit's date is never a reason. The Skipped list is part of the plan.

When a change builds on a feature that landed before `FROM` but was never announced, describe it with one clause of context and list the earlier unannounced work at hand-off; do not announce that earlier work as part of this range.

A typical entry has 3 to 6 major features plus the accordion; an accordion-only entry is allowed; include only accordion sections with content. New entry: **stop** if everything fell into the skip list. Review mode: continue even with no candidates.

## Step 4. Verify claims and supporting documentation

Read [verification.md](verification.md) and keep the evidence notes it describes. Read source for every retained claim at the Step 1 `TO` SHAs; do not resolve a newer `upstream/main`. Commit messages alone are never enough. Do this verification yourself in the main session with targeted reads of the files a claim touches; never dispatch a subagent per claim or per question. The only subagents in this whole workflow are the capped independent reviewers in verification.md Step 7. List and read files at the pinned snapshot:

```bash
git -C <repo> ls-tree -r --name-only <TO_SHA>
git -C <repo> show "<TO_SHA>:<path>"
```

Where to look: backend `internal/api/` (handlers, request/response structs), `internal/service/` and `internal/ee/service/` (business logic), `internal/domain/` (models, enums), `ent/schema/` (DB schema), `internal/temporal/` (workflows); frontend `src/pages/`, `src/components/`, `src/api/`; docs repo `docs/` and `images/docs/`.

- Inspect a screenshot in `images/docs/` before using it in a `<Frame>`; it must depict the stated UI.
- Read the relevant guide section before adding a `<Card>`; omit stale or unrelated targets.
- Compare API claims (operations, fields, values) with the spec that `docs.json` at `DOCS_SHA` names as its `openapi` source (currently `/api-reference/openapi.json`); record missing or lagging contracts separately from factual errors. An API card `href` is the tag directory plus the slugged operation summary (`Execute subscription modification` under Subscriptions is `/api-reference/subscriptions/execute-subscription-modification`); generated API routes need no physical MDX file.

Check targets at `DOCS_SHA`; if the user chose an existing branch, recheck them in Step 7. Never add an image, rewrite a guide, or regenerate the schema; missing or misleading targets are omitted.

Part 1 ends with the plan: each major feature with a one-line summary, accordion items per bucket, the Skipped list, the cards and screenshots to link, and the qualifications, withheld claims, and documentation gaps that must survive drafting.

# Part 2: Write (the wrapper has chosen the branch)

## Step 5. Baseline link and build checks (before)

Record `git status --short`, including untracked files, so the final scope check can tell existing work from new changes. Run the link checker: the first of these that runs, and the same one again in Step 7. "Runs" means found and prints a report; a broken-link list with non-zero exit counts, "command not found" or a download failure does not.

```bash
mintlify broken-links
mint broken-links
npx --yes mint broken-links
```

Keep the reported links as the before baseline. Run `validate` with the same CLI and keep its diagnostics; distinguish a completed validation with findings from a command that failed to run. **Stop** if none of the three runs.

## Step 6. Write the entry into docs/changelog.mdx (the only file you touch)

Read [changelog.md](changelog.md) for the template, formatting rules, and voice. Write straight into the file (no staging file) with the `Edit` tool, prepending the new `<Update>` block right after the frontmatter's closing `---`, taking the previous top `<Update>` tag from the working-tree file:

- `old_string`: `---\n\n<Update label="<previous top label>">`
- `new_string`: `---\n\n` + new block + `\n\n<Update label="<previous top label>">`

Put the `changelog-coverage` JSON comment from [coverage.md](coverage.md) immediately inside the block, with both exact ranges and `complete: false` until verification finishes. After saving, read the complete new block, even past 100 lines. Nothing outside it changes: not the frontmatter, older entries, footer, or the file's final newline. Never rewrite the whole file to insert the block. Confirm with `git status --porcelain --untracked-files=no` that `docs/changelog.mdx` is the only file changed since Step 5 (files already modified before Part 2 are not yours).

## Step 7. Final content, link, and build verification

Apply [verification.md](verification.md) to the finished entry: check each assertion against the research notes and source, preserve material limits, correct or remove unsupported wording, and recheck cards and images against the actual docs branch. Report stale documentation separately; the edit stays scoped to the changelog.

Rerun the Step 5 commands. Fix new findings caused by the entry and rerun the affected check; leave pre-existing findings unchanged and report them accurately. **Stop** if new findings remain after three fix attempts. A check that cannot run is reported as incomplete, never as passing.

Diff scope: inspect `git diff -- docs/changelog.mdx` and any staged diff, run `git diff --check` and `git diff --cached --check`, and check the final newline directly (`--check` misses it; this prints nothing when intact):

```bash
[ -z "$(tail -c1 docs/changelog.mdx)" ] || echo "final newline missing"
```

Every hunk of `git diff HEAD -- docs/changelog.mdx` must fall inside the new block (for an already committed draft, use `git diff <draft commit>^ -- docs/changelog.mdx`). Compare final status with the Step 5 baseline, untracked files included, so accidental generated files are noticed without deleting the user's files.

Completeness in both directions: every Step 1 candidate is in the entry or on the Skipped list with its reason, and every entry item traces to a candidate. Validate the coverage comment against the inspected ranges and ancestry; set `complete: true` only when [coverage.md](coverage.md)'s conditions are met, otherwise keep it false and explain why. Recheck the final diff after updating the comment.

Part 2 is verified only when the content review is complete and the technical checks have no new findings. If checks are incomplete or the baseline already fails, hand off with that qualification. The wrapper decides what happens to the file next.
