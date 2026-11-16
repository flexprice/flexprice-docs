# Release coverage and source snapshots

Used when selecting a research range, reviewing a draft, and recording the completed entry. Coverage is stored inside `docs/changelog.mdx`; never in a separate state file or machine-local memory.

## Resolve the range once

After the wrapper fetches all three repositories, capture their full `upstream/main` SHAs: `DOCS_SHA` for published history and documentation checks, plus a separate source range per code repository (`BACKEND_FROM`/`BACKEND_TO`, `FRONTEND_FROM`/`FRONTEND_TO`).

For an ordinary new entry, the baseline is, per repository, the published `changelog-coverage` record at `DOCS_SHA` whose `to` is newest in that repository's history (every other record's `to` is its ancestor), whatever its `complete` flag; those backend and frontend `to` SHAs become the next `from` SHAs. Normally that is the newest weekly entry; a bounded historical entry's `to` is an ancestor of it, so it never becomes the baseline. The record tracks the last commit the published changelog covers, so the next entry always starts there. Coverage tracks `flexprice/flexprice` (backend) and `flexprice/portal` (frontend) only. A frontend `to` that is not a portal commit (old `flexprice-front` history) is skipped for the frontend: use the newest record whose frontend `to` is in portal. This lists every record with its label, newest first:

```bash
git show "${DOCS_SHA}:docs/changelog.mdx" | awk '/^<Update label=/{label=$0} /changelog-coverage:/{print label; print}'
```

Never use a local draft as the previous published checkpoint.

Default `to` values are the captured code-repository tips. For an explicit historical cutoff, prefer supplied release SHAs. If only dates are available, resolve them once against each captured tip's first-parent history with explicit UTC boundaries:

```bash
git -C "$R" rev-list -1 --first-parent --before="$UNTIL 23:59:59 +0000" "$MAIN_SHA"
```

This lookup locates a release snapshot; it is never a filter on the commits inside the range. Check adjacent promotion commits and their timestamps: first-parent timestamps approximate landings, and Git does not record fast-forwards. If dates cannot establish the boundary, use release evidence or ask for the intended SHA. A requested starting date may be resolved just before its UTC day begins, but must not silently replace the ongoing checkpoint.

Once selected, freeze both `to` SHAs: source reads, field checks, and reviewers use those snapshots, not a later `upstream/main` (reading a change's parent for before/after comparison is fine). If the user extends the range, recapture deliberately and recheck affected claims.

## Initial baseline and bounded reviews

When no usable record exists for a repository, in order:

1. Look for exact source SHAs in the previous run's evidence or release records. A docs commit timestamp, publication label, or repeated heading is not evidence of the source cutoff.
2. Use an explicit user-supplied starting SHA or date and disclose that earlier coverage is unknown.
3. Otherwise ask for the starting point rather than assuming seven days. Make the question answerable: name the latest published entry and show `git log -5 --format='%h %cI %s' "$DOCS_SHA" -- docs/changelog.mdx`, saying those dates are context, not evidence. A slightly earlier start is the safer answer (Step 2 deduplicates published entries); a later one drops work that reached `main` before that date.

You may keep checking known draft assertions without a resolved baseline, but cannot certify completeness or advance coverage.

For an existing draft, use the ranges in its own record regardless of `complete`, never recomputed from today. A legacy draft without a record gets the procedure above.

A bounded historical request may differ from the ongoing checkpoint: record the range for reproducibility, but leave `complete: false` unless it continues the checkpoint without a gap or the user explicitly establishes it as the initial baseline. A published checkpoint never moves backwards or jumps over unreviewed commits.

## Validate both repositories before gathering

For each repository, `from` and `to` must be real commits, `from` an ancestor of `to`, and `to` in the captured `main` history:

```bash
git -C "$R" cat-file -e "$FROM^{commit}" &&
git -C "$R" cat-file -e "$TO^{commit}" &&
git -C "$R" merge-base --is-ancestor "$FROM" "$TO" &&
git -C "$R" merge-base --is-ancestor "$TO" "$MAIN_SHA"
```

An empty SHA, missing object, or failed ancestry check is a boundary error, not an empty release; resolve it, never silently substitute a merge base or the current tip. `from == to` is a valid empty range: continue when one repository is unchanged, and for a new entry stop for lack of changes only when both are empty. An existing draft can be reviewed even with empty ranges.

## Persist the reviewed ranges in the entry

Immediately inside the new `<Update>` block, one non-rendering MDX comment with one JSON object, full SHAs only:

```mdx
  {/* changelog-coverage: {"version":1,"complete":false,"backend":{"from":"BACKEND_FROM_SHA","to":"BACKEND_TO_SHA"},"frontend":{"from":"FRONTEND_FROM_SHA","to":"FRONTEND_TO_SHA"}} */}
```

`from` is exclusive, `to` inclusive. Parse the JSON within its Update block, not by matching a heading. Require version 1, a boolean `complete`, and valid full SHAs for both repositories; report malformed records instead of guessing. An unchanged repository keeps equal `from`/`to`.

Set `complete: true` only when: both candidate lists were fully examined, every candidate is included or deliberately classified on the Skipped list, and the content and technical checks completed with no new findings. Unresolved or deferred user-facing changes or unavailable source keep it false; a record from an earlier week does not. A deliberately excluded internal change is accounted for; an unverified feature is not. An explicit initial baseline may start a new checkpoint, with the earlier-coverage limitation reported at hand-off.

On a later run, always start from the baseline above, the newest published `to` SHAs, even when that record is `complete:false`; never carry an older record's `from` forward. A change an earlier entry deferred is not lost: the run that deferred it lists it on its Skipped list or in its PR description, so it can be announced later from that note. If a `from` fails the ancestry check, report the boundary error rather than substituting an older SHA.

Recheck duplicates against all entries published since the selected starting point, and never mark a later checkpoint complete while an earlier deferred candidate in its range is unresolved. Preserve the ranges when revising wording; if the research scope changes, update the metadata and repeat verification. A local draft does not advance the published checkpoint. The metadata stays inside the one permitted changelog block.
