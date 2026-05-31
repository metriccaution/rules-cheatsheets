---
name: rules-summariser
description: Creates a new rule cheat-sheet file from a source rulebook PDF
---

# Rules Summariser

Read a section of a rulebook PDF and produce a new rule file under `rules/<game>/` in the project's standard format.

## Arguments

`$ARGUMENTS` identifies the game and topic. Accept any of:

- A game and topic: `mothership combat`
- A game, topic, and page hint: `mothership combat page 26`

## Steps

1. **Resolve the game** — match the first word of `$ARGUMENTS` to a subdirectory under `rules/`. If no match, list available games and ask. Read `rules/<game>/_meta.yaml` to confirm the game name and find the canonical book title for page references.

2. **Find the PDFs** — list `pdfs/<game>/`. If the directory doesn't exist or is empty, stop and tell the user what path to place PDFs in. If multiple PDFs are present and it's unclear which covers the topic, list them and ask.

3. **Locate the relevant pages** — if a page hint was given, start there. Otherwise, use the PDF's table of contents (usually in the first 10 pages) to find the relevant chapter or section. Read those pages plus ±1 for context.

4. **Draft the rule file** — write a concise cheat-sheet, not a transcription. Aim for what a player needs at the table:
   - Strip flavour text, examples, and lore
   - Prefer bullet points and short tables over prose
   - Keep every mechanical number and die roll exact — never paraphrase stats
   - Omit optional or advanced rules unless they're central to the topic; note their existence with "(optional — see page N)"

5. **Handle ambiguity** — stop and ask the user before writing if:
   - The PDF uses ambiguous or contradictory wording that would require interpretation
   - Two or more rules interact in a way that isn't explicitly resolved in the source text
   - A number or procedure appears inconsistently across pages

   Quote the relevant PDF text when asking, and explain what's unclear.

6. **Write the file** — choose a slug matching `^[a-z0-9][a-z0-9-]+[a-z0-9]$` derived from the topic. The file goes at `rules/<game>/<slug>.md` with this frontmatter:

   ```markdown
   ---
   title: Short Rule Title
   reference:
     - <Book Name>, page N
     - <Book Name>, page N
   ---
   ```

   List every page actually used as a separate reference entry. After writing, confirm the path to the user.

7. **Review and fix** - follow all steps in the `PDF Checker` skill for this file, iterate on it until the feedback is resolved. Seek guidance if there's trouble resolving issues.
