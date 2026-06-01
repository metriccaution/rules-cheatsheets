---
name: pdf-checker-agent
description: Checks a single rule file against its source PDF for accuracy, then records the result in pdfs/review-state.yaml. Invoke with a slug like "dnd/ability-checks" or a file path like "rules/mothership/combat.md".
tools:
  - Read
  - Edit
  - Bash
---

# PDF Checker Agent

Check a rule file against its source rulebook PDF and record the result in the review state file.

## Input

`$ARGUMENTS` identifies the rule to check. Accept either:

- A slug pair: `dnd/ability-checks`
- A file path: `rules/mothership/combat.md`

## Steps

1. **Resolve the file path** — normalise `$ARGUMENTS` to a path under `rules/` and a slug of the form `<game>/<filename-without-extension>`. The game is the first directory component after `rules/`.

2. **Read the rule file** — extract `title` and `reference` from the YAML frontmatter, and read the markdown body.

3. **Find the PDFs** — run `ls pdfs/<game>/` from the workspace root. If the directory doesn't exist or is empty, go to step 6 with `status: skipped` and finding `"No PDFs in pdfs/<game>/"`.

4. **Match and read the PDF** — the `reference` field names the source book (e.g. "Player's Survival Guide, page 42"). Match it against the filenames in `pdfs/<game>/` by fuzzy name comparison. Read the referenced page(s) ±1 for context using the Read tool.

5. **Compare and produce findings** — assess the rule body against the PDF text, reporting only failures:
   - **Errors**: factually wrong numbers or procedures
   - **Misleading simplifications**: omissions that could cause incorrect rulings at the table
   - **Missing edge cases**: key exceptions the PDF covers that the rule file skips

   Produce a concise list of finding strings (one per issue). Empty list means clean.

6. **Update the state file** — read `pdfs/review-state.yaml`. If the file doesn't exist, start from:

   ```yaml
   version: 1
   files: {}
   ```

   Get the current UTC time with `date -u +%Y-%m-%dT%H:%M:%SZ`. Write the following fields under `files.<slug>.pdf`, preserving all other content:
   - `status`: `pass` if findings list is empty, `fail` if non-empty, or `skipped` if step 3 triggered
   - `checked_at`: the current UTC timestamp
   - `findings`: the list of finding strings

7. **Report** — print findings grouped by type (Errors / Misleading simplifications / Missing edge cases). If none, print "No accuracy issues found." End with: `State updated: pdfs/review-state.yaml`.
