---
name: pdf-checker
description: Checks a rule file against the source rulebook PDF for accuracy
---

# PDF Checker

Check a rule file against its source rulebook PDF and report any inaccuracies.

## Arguments

`$ARGUMENTS` identifies the rule to check. Accept any of:

- A file path: `rules/mothership/combat.md`
- A slug pair: `mothership/combat`

## Steps

1. **Find the rule file** — resolve `$ARGUMENTS` to a path under `rules/`. Read the file to extract:
   - `title` and `reference` from the YAML frontmatter
   - The markdown body (the rule content as written)

2. **Find the PDFs** — list the contents of `pdfs/<game>/`. If the directory doesn't exist or is empty, stop and tell the user what path to place PDFs in.

3. **Match the PDF** — the `reference` field names the source book (e.g. "Player's Survival Guide, page 42"). Match it against the filenames in `pdfs/<game>/` by fuzzy name comparison. If there are multiple PDFs and it's unclear which matches, list them and ask.

4. **Read the relevant pages** — use the Read tool on the matched PDF, targeting the page number(s) from `reference`. Read ±1 page for context (e.g. reference says page 42 → read pages 41–43).

5. **Compare and report** — assess the rule content against the PDF text:
   - **Errors**: anything factually wrong (wrong numbers, wrong procedure)
   - **Misleading simplifications**: omissions that could cause incorrect rulings at the table
   - **Missing edge cases**: key exceptions or conditions the PDF covers that the rule file skips
   - **Accurate**: confirm what is correct

   Keep the report concise — one bullet per finding.
