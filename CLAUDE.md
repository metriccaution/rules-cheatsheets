# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # install dependencies
bun run build        # compile rules + generate static site
bun run format       # format all files with prettier
bun test             # format + run tests
bun test --grep "pattern"  # run a single test by name
```

The `build` output goes to `static/`. Serve it with `bunx serve static`.

Always run `bun run format` after editing TypeScript or markdown files and before committing.

## Architecture

This is a static site generator for a tabletop RPG rules cheat-sheet. The pipeline is:

```
rules/<game>/*.md  →  compile-static-info.ts  →  generated/*.md  →  Metalsmith  →  static/*.html
```

### Rule files (`rules/dnd/*.md`)

Each file is a markdown document with YAML frontmatter:

```markdown
---
title: Short Rule Title
reference: Player's Handbook, page 42
---

# Section heading

Rule content...
```

- The filename (without `.md`) becomes the URL slug and must match `^[a-z0-9][a-z0-9-]+[a-z0-9]$`
- `reference` can be a single string or a YAML list of strings
- The body may have multiple `#` headings; they are promoted one level (prepended with `##`) in the final output

### `compile-static-info.ts`

- Reads all `.md` files from a rules directory, parses frontmatter with `yaml`, and validates with Zod (`ruleSchema`)
- Writes each rule to `generated/<slug>.md` (with nunjucks-compatible frontmatter) and an `index.md` combining all rules
- Exported functions: `loadRules(dir)` → `GameSystem`, `writeGameSystem(game, dir)`

### Metalsmith build (`build.ts`)

Currently only loads `rules/dnd/`. The `rules/mothership/` and `rules/wildsea/` directories exist but are not wired into the build yet.

Metalsmith pipeline: `generated/` → `@metalsmith/markdown` (renders `.md` to HTML) → `@metalsmith/layouts` (wraps in `layouts/default.nunjucks`) → `static/`.

### Layout (`layouts/default.nunjucks`)

Minimal HTML shell. Uses `{{ title }}` from frontmatter and `{{ contents | safe }}` for body. Inline `<style>` only — no external CSS files.
