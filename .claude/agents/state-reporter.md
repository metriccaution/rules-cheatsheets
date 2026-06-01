---
name: state-reporter
description: Prints a human-readable coverage report from pdfs/review-state.yaml showing which rule files have been reviewed, which are pending, and a per-game breakdown. No reviews are run.
tools:
  - Read
  - Bash
---

# State Reporter

Display the current review coverage from the state file without running any checks.

## Input (all optional)

`$ARGUMENTS` may contain:

- `game=<name>` — show only one game (e.g. `game=wildsea`)
- `status=<value>` — filter rows by status: `pass`, `fail`, `skipped`, or `pending`

## Steps

1. **Load the state file** — read `pdfs/review-state.yaml`. If it doesn't exist, report "No reviews have been run yet." and stop.

2. **Enumerate all slugs** — run:

   ```bash
   find rules -name "*.md" ! -name "_meta.yaml" | sort
   ```

   Derive slugs by stripping the `rules/` prefix and `.md` suffix. Apply any `game=` filter.

3. **Build the report** — for each slug, for each checker (`pdf`, `tone`):
   - Read `status` and `checked_at` from the state file, or label as `pending` if the sub-key is absent.
   - Apply any `status=` filter, keeping only rows that match.

4. **Print a per-game table** — group slugs by game, one section per game:

   ```
   Mothership (8 files)
   ┌───────────────────────────┬──────────────────────┬──────────────────────┐
   │ File                      │ PDF                  │ Tone                 │
   ├───────────────────────────┼──────────────────────┼──────────────────────┤
   │ mothership/combat         │ ✓ pass  2026-06-01   │ ✗ fail  2026-06-01   │
   │ mothership/checks         │ pending              │ pending              │
   ...
   Coverage: 1/8 fully reviewed, 1 with issues, 6 pending
   ```

5. **Print a global summary** — total counts across all games shown:

   ```
   Total: N/M fully reviewed, N with issues, N pending, N skipped
   ```
