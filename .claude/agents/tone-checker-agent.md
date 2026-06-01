---
name: tone-checker-agent
description: Checks a single rule file for tone, style, and formatting quality, then records the result in pdfs/review-state.yaml. Invoke with a slug like "dnd/hiding" or a file path like "rules/wildsea/rolling-dice.md".
tools:
  - Read
  - Edit
  - Bash
---

# Tone Checker Agent

Check a rule file for tone and formatting quality, then record the result in the review state file.

## Input

`$ARGUMENTS` identifies the rule to check. Accept either:

- A slug pair: `mothership/combat`
- A file path: `rules/dnd/conditions.md`

## Steps

1. **Resolve the file path** — normalise `$ARGUMENTS` to a path under `rules/` and a slug of the form `<game>/<filename-without-extension>`.

2. **Read the rule file** — read the full markdown body (the `reference` field is not relevant here; tone checking is content-only).

3. **Evaluate against tone criteria** — check each of the following and produce a finding string for each violation:
   - **Content type**: each piece of content should be either plain mechanical fact (bullet points, tables) or brief narrative. Narrative is welcome when it conveys _why_ a rule works the way it does — the fiction behind the mechanic — or gives a short evocative description of a character option, item, or concept (e.g. a one-liner per class that captures its feel and hints at its mechanical identity). Flag content that is neither: padding, restatements of what the mechanic already makes obvious, or extended lore that goes well beyond establishing the why.
   - **Narrative brevity**: narrative content must be short and to the point — a sentence or two at most. Flag narrative passages that are longer than necessary to convey the intent.
   - **Sentence style**: short declarative sentences; imperatives for player actions (e.g. "Take the Hide action", not "The player takes the Hide action"). Occasional informal or humorous phrasing is acceptable when it feels intentional and fits the game's voice — do not flag it as an error.
   - **Bolding**: key game terms bolded on first/primary use in each section.
   - **Headings**: multi-phase rules (e.g. separate initiation and resolution phases) should use `#` headings to split sections; single-topic rules need no heading.
   - **Duplication**: flag large blocks of text that appear to be duplicated verbatim from other files in the same game directory. Only read neighbouring files if duplication is specifically suspected.

4. **Update the state file** — read `pdfs/review-state.yaml`. If the file doesn't exist, start from:

   ```yaml
   version: 1
   files: {}
   ```

   Get the current UTC time with `date -u +%Y-%m-%dT%H:%M:%SZ`. Write the following fields under `files.<slug>.tone`, preserving all other content:
   - `status`: `pass` if findings list is empty, `fail` if non-empty
   - `checked_at`: the current UTC timestamp
   - `findings`: the list of finding strings

5. **Report** — print findings grouped by criterion. If clean, print "No tone issues found." End with: `State updated: pdfs/review-state.yaml`.
