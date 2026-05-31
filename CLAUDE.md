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
rules/<game>/*.md  →  compile-static-info.ts  →  generated/<game>/*.md  →  Metalsmith  →  static/*.html
```

### Rule files (`rules/<game>/*.md`)

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

### Adding a game system

A game system directory under `rules/` is included in the build if and only if it contains a `_meta.yaml` with a `name` field:

```yaml
name: My Game
```

### `compile-static-info.ts`

- `discoverSystems(rulesRoot)` — scans `rules/` for subdirectories with `_meta.yaml`, loads and validates every `.md` file in each, returns `GameSystem[]`
- `writeGameSystem(game, dir)` — writes one `<slug>.md` per rule (with nunjucks-compatible frontmatter) plus an `index.md` combining all rules into `generated/<game>/`
- `writeLandingPage(systems, dir)` — writes the root `generated/index.md` with a card for each system
- Frontmatter is parsed with `yaml`, validated with Zod (`ruleSchema`)

### Metalsmith build (`build.ts`)

Metalsmith pipeline: `generated/` → `@metalsmith/markdown` (renders `.md` to HTML) → `@metalsmith/layouts` (wraps in a nunjucks layout) → `static/`.

Two layouts exist: `layouts/default.nunjucks` (individual rule pages and system index) and `layouts/landing.nunjucks` (root landing page). Layout is chosen via the `layout` frontmatter key; `default.nunjucks` is the fallback.
