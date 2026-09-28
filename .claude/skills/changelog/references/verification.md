# Changelog verification

Applied during research (Step 4) and to the complete entry before hand-off (Step 7). Link and build checks validate structure; they never establish factual accuracy.

## Evidence for the shipped behavior

Use the exact `BACKEND_TO` and `FRONTEND_TO` snapshots selected per [coverage.md](coverage.md) from the flexprice org's `main` history; never today's `upstream/main`, `develop`, a personal fork, or uncommitted source. Record each repository's full SHA in the notes. If source access fails, report what could not be checked instead of treating it as verified.

Keep compact research notes (not a committed file), one row per assertion, including each distinct assertion inside a multi-part bullet (related assertions can share evidence):

| Claim | Evidence (repo, SHA, path, symbol) | Conditions (limit, default, exception, release dependency) | Documentation (matching, missing, stale) |
|---|---|---|---|

Commit titles and PR bodies identify candidates and describe intent; read the diff and implementation to establish behavior (a body's "isn't reported as..." can describe code no user sees). Tests are supporting evidence for edge cases. Check backend and dashboard availability separately: a backend change does not prove the UI shipped, and an SDK generation change does not prove a package was published. State the supported scope; never infer deployment or package availability from a commit.

## Limits, defaults, and exceptions

For each claim, check the conditions that would change a reader's implementation or expectations:

- Collection size, pagination, retention, time range; whether a cap applies per customer, feature, entitlement, or request.
- Supported providers, pricing models, resource states, required configuration.
- Defaults, omitted fields, `null`, zero, unlimited values, mutually exclusive inputs.
- HTTP status vs a status inside a successful response; error behavior, effective dates, proration, webhook triggers.
- Whether a deprecated interface still works, and its replacement.
- Entry points: check every route, dashboard screen, portal flow, and background job a sentence names. Behavior in one path does not carry to its neighbors: a field on the subscription and customer reads may be absent from the resource's own endpoint, an override in one route may skip a validation another runs, a provider rule for automatic top-ups may not apply to portal top-ups.
- "Previously", "no longer", "now": read the old code at the landing's parent (`git show <landing sha>^1:<path>`) and confirm the difference is user-observable.
- Error text: the API returns the first `WithHint` text as `message` (`internal/rest/middleware/errhandler.go`, `getDisplayMessage`), or "An unexpected error occurred" when there is none. Quote the hint; the `NewError` string never reaches the caller.

Describe what the code does now. A limit is stated as a limit; never call a behavior a bug or suggest raising it with engineering. Follow the validation and service path rather than DTO field names alone. Check "all", "every", "always", "unlimited" against the implementation and preserve material conditions (a read that returns three recent windows per entitlement says so, rather than promising every window). Do not copy every internal validation rule into the changelog.

## Documentation and API contracts

Read the relevant section of every proposed card target: an existing page is insufficient if it describes old behavior or does not explain the advertised capability. Link a current, relevant page or omit the card and record the gap.

Compare named endpoints, request/response fields, enums, defaults, and status codes with the spec that `docs.json` at `DOCS_SHA` names as its `openapi` source (currently `/api-reference/openapi.json`), following `$ref` to the actual schema. Generated API pages need no physical `.mdx` file; check the operation, route, and the fields the feature uses before adding an API card, and recheck targets on the actual docs branch before hand-off.

Triage a mismatch by cause:

- Source does not support the claim: correct or omit the claim.
- Source supports it but the docs schema or guide lags: keep the accurate note, omit the misleading card, report the exact gap separately.
- Evidence unavailable or ambiguous: narrow or omit the claim and report the uncertainty.

A changelog task never regenerates OpenAPI or rewrites guides, and documentation lag is not proof a feature is unavailable. Inspect screenshot contents, not just paths; reuse an image only when it depicts the stated UI.

## Release date and editing scope

Use the requested publication date (a future date is valid for a scheduled release; never silently replace it with today); otherwise the skill's default. Do not include unshipped work because the date is later. Check date ordering, duplicate labels, and overlap with published notes; when an older entry says something different, describe the later change or revert explicitly and preserve the historical entry. Preserve frontmatter, older entries, footer, and unrelated user edits.

## Final editorial pass

Read the entire new `<Update>` block, not just its first 100 lines, and compare the wording with the notes: shortening a bullet must not drop a material qualification. One or two sentences per feature intro; one reader-facing change per bullet; review bullets past roughly 45 words for splitting (an editing prompt, not a hard limit). Detailed setup steps belong in a current guide. Keep the API accordion on contract changes, not repeated feature prose. No em dashes; quoted older examples are structural references only.

## Independent review

The writer misses their own overgeneralizations, so a second reader checks the finished entry against source. These reviewers are the only subagents permitted anywhere in the workflow: research and per-claim fact-checks are done in the main session. Dispatch them once, read-only, in parallel, all in one message, foreground (in Claude Code `run_in_background: false`) so every result returns before you continue. Keep the fan-out proportionate; never one reviewer per feature, per claim, or per question:

- Default: three reviewers: feature claims, accordion claims, and a completeness sweep comparing the Step 1 lists and squash-bundle bodies with the entry and Skipped list.
- Small entry (2 or fewer features and around 10 or fewer accordion bullets): two: all claims, completeness.

Reviewers need file reads and git only, told in the prompt to stay read-only (in Claude Code, `general-purpose`; a smaller model such as Sonnet is sufficient). Give each:

- the exact sentences to check, split into single assertions;
- repo paths and both exact `from`/`to` SHAs; read source at `to` (`git -C <repo> show "<TO_SHA>:<path>"`), a landing's parent only for before/after; never edit, checkout, or substitute a moving ref;
- the prior published entries from `DOCS_SHA` (plus older entries mentioning the same feature), so repeats and "new"/"now" claims are checked against everything already said;
- the instruction to do every check itself and start no sub-agents, since the fan-out limit above counts nested agents too;
- the output shape: per assertion a verdict, evidence as path and line, and replacement wording. Verdicts: **correct**; **imprecise** (true but broader than the code, or missing a qualifier a reader needs); **wrong**; **unverifiable**.

Tell the user when the review starts. Do not write the report or edit the entry until every reviewer returns; if one fails, check its assertions yourself. Reviewers err too: before changing the entry, read the cited code yourself for every verdict other than correct. Without subagents, do the same pass yourself after writing, one assertion at a time against source, not your notes.

## Completion and reporting

Before hand-off, verify:

- The independent review ran and every non-correct verdict was confirmed or rejected in source, or its absence is reported.
- Every retained claim has source evidence and preserves material limits and exceptions.
- Coverage metadata holds the exact inspected ranges; only a fully reviewed, continuous range advances the checkpoint ([coverage.md](coverage.md)).
- Cards and images are valid targets and relevant to the new behavior.
- Publication date, historical context, and edit scope are correct.
- The entry was checked for readability and complete MDX structure.
- Link checks, build validation, and the final diff inspection actually ran, or their absence is explicitly reported.

Report factual issues, documentation gaps, and checks that could not run separately. Say a check passed only when its output confirms it; "not run" and an infrastructure failure are not successful validation. Keep source notes out of the published prose.
