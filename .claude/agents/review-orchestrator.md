---
name: review-orchestrator
description: Reads pdfs/review-state.yaml, finds rule files not yet checked by pdf-checker-agent or tone-checker-agent, and dispatches those agents. Accepts optional flags: game=, checker=, limit=, recheck-failed, dry-run.
tools:
  - Read
  - Bash
  - Agent
---

# Review Orchestrator

Discover rule files that need review and dispatch reviewer agents to cover them.

## Input (all optional)

`$ARGUMENTS` may contain any combination of the following flags, space-separated:

- `game=<name>` — restrict to one game (e.g. `game=dnd`, `game=mothership`)
- `checker=pdf` or `checker=tone` — run only one checker instead of both
- `limit=N` — process at most N files this run (useful for incremental batches)
- `recheck-failed` — also re-dispatch any file where the last run recorded `fail` (by default only absent entries are treated as pending)
- `dry-run` — print the dispatch plan without running any agents

## Steps

1. **Load the state file** — read `pdfs/review-state.yaml`. If it doesn't exist, treat all files as unchecked (state is effectively empty).

2. **Enumerate rule files** — run:

   ```bash
   find rules -name "*.md" ! -name "_meta.yaml" | sort
   ```

   Convert each path to a slug by stripping the `rules/` prefix and `.md` suffix. Apply any `game=` filter.

3. **Determine pending work** — for each slug, check the state file:
   - A checker is **pending** if its sub-key is absent under `files.<slug>`
   - If `recheck-failed` is set, also treat any sub-key with `status: fail` as pending
   - `status: skipped` is never re-dispatched (the prerequisite PDF directory is missing — human action required)

   Build a work list: a list of `{slug, checkers[]}` entries where `checkers` contains the pending checker names for that slug.

   Apply `checker=` filter to remove non-selected checkers from each entry. Drop entries whose `checkers` list becomes empty. Apply `limit=N` by truncating to the first N slugs.

4. **Report the plan** — print a summary:

   ```
   Pending work (N files, M checks):
     dnd/ability-checks     [pdf, tone]
     mothership/combat      [tone]
     ...
   ```

   If the work list is empty, print "All files are up to date." and stop. If `dry-run` was set, stop here.

5. **Dispatch agents** — for each entry in the work list, for each checker in `entry.checkers`, use the Agent tool to invoke `pdf-checker-agent` or `tone-checker-agent` with the slug as the argument. Wait for each agent to complete before dispatching the next one — sequential dispatch prevents concurrent writes to the state file.

6. **Final summary** — after all dispatches complete, read the state file again and print:

   ```
   Run complete.
     Passed:  N checks
     Failed:  N checks  (re-run with recheck-failed to retry)
     Skipped: N checks
   ```
