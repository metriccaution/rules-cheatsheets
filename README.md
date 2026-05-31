# Rules Cheat-Sheet

[Deployed here.](https://metriccaution.github.io/rules-cheatsheets/)

A searchable rules reference for tabletop RPGs, built from markdown snippets in [./rules/](./rules/).

Migrated over from an [old mono-repo project](https://metriccaution.github.io/web-snippets/dnd-cheatsheet/).

## Adding Rules

Each rule is a markdown file with YAML frontmatter:

```markdown
---
title: Short Rule Title
reference: Player's Handbook, page 42
---

Rule content in bullet-point format...
```

Drop the file into the relevant `rules/<game>/` directory — it will be picked up automatically on the next build. The filename becomes the URL slug and must be lowercase alphanumeric with hyphens (`^[a-z0-9][a-z0-9-]+[a-z0-9]$`).

To add a new game system, create a `rules/<game>/` directory containing a `_meta.yaml` file:

```yaml
name: My Game
```

## Development

```bash
bun install        # install dependencies
bun test           # run tests
bun run build      # compile rules and generate static site
bun run format     # format all files with prettier
```

The build output goes to `static/`. Preview it with:

```bash
bunx serve static
```
