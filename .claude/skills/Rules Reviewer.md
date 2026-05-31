---
name: rules-reviewer
description: Orchestrates a full review of a rule file — accuracy against the source PDF, then tone and style
---

# Rules Reviewer

Run a full review of a rule file by executing two checks in order and presenting their findings together.

## Arguments

`$ARGUMENTS` identifies the rule to review. Accept any of:

- A file path: `rules/mothership/combat.md`
- A slug pair: `mothership/combat`

## Steps

1. **Resolve the file** — confirm the rule file exists under `rules/`. If not, stop and tell the user.

2. **PDF check** — follow all steps in the `PDF Checker` skill for this file. Collect the full findings but do not report them yet.

3. **Tone check** — follow all steps in the `Tone Checker` skill for this file. Collect the full findings but do not report them yet.

4. **Report** — present findings under headings only where issues were found. If a check is clean, omit its section entirely. If both checks are clean, say "No issues found."

   ## Accuracy

   _(findings from the PDF check, if any)_

   ## Tone

   _(findings from the tone check, if any)_
