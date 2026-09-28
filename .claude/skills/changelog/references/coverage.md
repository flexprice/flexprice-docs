# Release coverage and source snapshots

Used when selecting a research range, reviewing a draft, and recording the completed entry. Coverage is stored inside `docs/changelog.mdx`; never in a separate state file or machine-local memory.

## Resolve the range once

After the wrapper fetches all three repositories, capture their full `upstream/main` SHAs: `DOCS_SHA` for published history and documentation checks, plus a separate source range per code repository (`BACKEND_FROM`/`BACKEND_TO`, `FRONTEND_FROM`/`FRONTEND_TO`).

For an ordinary new entry, the baseline is the latest published `changelog-coverage` record with `"complete":true` at `DOCS_SHA`; its backend and frontend `to` SHAs become the next `from` SHAs. This lists every record with its label, newest first:

```bash
git show "${DOCS_SHA}:docs/changelog.mdx" | awk '/^<Update label=/{label=$0} /changelog-coverage:/{print label; print}'
```

A newer entry without a completed record does not advance coverage: keep the last completed baseline and check all intervening published entries for duplicates. Never use a local draft as the previous published checkpoint.

Default `to` values are the captured code-repository tips. For an explicit historical cutoff, prefer supplied release SHAs. If only dates are available, resolve them once against each captured tip's first-parent history with explicit UTC boundaries:

```bash
git -C "$R" rev-list -1 --first-parent --before="$UNTIL 23:59:59 +0000" "$MAIN_SHA"
```

This lookup locates a release snapshot; it is never a filter on the commits inside the range. Check adjacent promotion commits and their timestamps: first-parent timestamps approximate landings, and Git does not record fast-forwards. If dates cannot establish the boundary, use release evidence or ask for the intended SHA. A requested starting date may be resolved just before its UTC day begins, but must not silently replace the ongoing checkpoint.

Once selected, freeze both `to` SHAs: source reads, field checks, and reviewers use those snapshots, not a later `upstream/main` (reading a change's parent for before/after comparison is fine). If the user extends the range, recapture deliberately and recheck affected claims.

## Initial baseline and bounded reviews

When no completed record exists, in order:

1. Resume from published incomplete records (see the last section).
2. Look for exact source SHAs in the previous run's evidence or release records. A docs commit timestamp, publication label, or repeated heading is not evidence of the source cutoff.
3. Use an explicit user-supplied starting SHA or date and disclose that earlier coverage is unknown.
4. Otherwise ask for the starting point rather than assuming seven days. Make the question answerable: name the latest published entry and show `git log -5 --format='%h %cI %s' "$DOCS_SHA" -- docs/changelog.mdx`, saying those dates are context, not evidence. A slightly earlier start is the safer answer (Step 2 deduplicates published entries); a later one drops work that reached `main` before that date.

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

Set `complete: true` only when: both candidate lists were fully examined, every candidate is included or deliberately classified on the Skipped list, and the content and technical checks completed with no new findings. Unresolved or deferred user-facing changes, unavailable source, or a gap before this range keep it false. A deliberately excluded internal change is accounted for; an unverified feature is not. An explicit initial baseline may start a new checkpoint, with the earlier-coverage limitation reported at hand-off.

On a later run, an incomplete record does not advance the starting point, so deferred changes stay in the next range. With no complete record, resume from the published incomplete record's `from` SHAs (not its `to`); with several incomplete records, use the earliest `from` in each repository's ancestry so no unresolved interval is dropped, and resolve inconsistent ranges first. Choosing a later baseline requires the user's explicit decision to abandon the unresolved interval; report the excluded ranges rather than treating those commits as reviewed.

Recheck duplicates against all entries published since the selected starting point, and never mark a later checkpoint complete while an earlier deferred candidate in its range is unresolved. Preserve the ranges when revising wording; if the research scope changes, update the metadata and repeat verification. A local draft does not advance the published checkpoint. The metadata stays inside the one permitted changelog block.
