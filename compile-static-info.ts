import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import prettier from "prettier";
import yaml from "yaml";
import { z } from "zod";

const ruleSchema = z
  .object({
    title: z.string().min(5).describe("A short title for the rule"),
    reference: z
      .union([z.string(), z.array(z.string())])
      .describe("Where this rule's from, with a page number if possible"),
    content: z.string().describe("Markdown body of the rule"),
    slug: z
      .string()
      .min(2)
      .max(100)
      .regex(/^[a-z0-9][a-z0-9-]+[a-z0-9]$/)
      .describe("URL slug to serve this game under"),
  })
  .describe("A rule within a game");

export type Rule = z.infer<typeof ruleSchema>;

export interface GameSystem {
  name: string;
  slug: string;
  rules: Rule[];
}

export async function discoverSystems(
  rulesRoot: string,
): Promise<GameSystem[]> {
  const systems: GameSystem[] = [];
  for (const entry of await readdir(rulesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    let meta: { name: string };
    try {
      meta = yaml.parse(
        await readFile(join(rulesRoot, slug, "_meta.yaml"), "utf-8"),
      ) as { name: string };
    } catch {
      continue;
    }
    systems.push({
      name: meta.name,
      slug,
      rules: await loadGame(join(rulesRoot, slug)),
    });
  }
  return systems;
}

export async function writeGameSystem(
  game: GameSystem,
  outputDirectory: string,
): Promise<void> {
  await Promise.all(
    game.rules.map(async (rule) => {
      const targetFile = join(outputDirectory, `${rule.slug}.md`);
      const content = [
        `---\n${yaml.stringify({ title: rule.title })}---`,
        `<p><a class="back-link" href="./">← ${game.name}</a></p>`,
        ruleToMarkdown(rule, false),
      ].join("\n\n");
      await writeFile(targetFile, content, "utf-8");
    }),
  );

  await writeFile(
    join(outputDirectory, "index.md"),
    `---\n${yaml.stringify({ title: game.name })}---\n\n<p><a class="back-link" href="../">← All Systems</a></p>\n\n# ${game.name}\n\n` +
      indentTitles(
        game.rules
          .map((r) => ruleToMarkdown(r, false, `./${r.slug}`))
          .join("\n\n"),
      ),
  );
}

export async function writeLandingPage(
  systems: GameSystem[],
  outputDirectory: string,
): Promise<void> {
  const cards = systems
    .map(
      (s) =>
        `<a class="system-card" href="./${s.slug}/">\n  <span class="system-card-name">${s.name}</span>\n  <span class="system-card-count">${s.rules.length} rules</span>\n</a>`,
    )
    .join("\n\n");

  await writeFile(
    join(outputDirectory, "index.md"),
    `---\n${yaml.stringify({ title: "Rules Reference", layout: "landing.nunjucks" })}---\n\n# Rules Reference\n\n${cards}\n`,
  );
}

async function loadGame(gameDirectory: string): Promise<Rule[]> {
  const rules: Rule[] = [];

  for (const ruleFile of await readdir(gameDirectory)) {
    if (!ruleFile.endsWith(".md")) {
      continue;
    }

    const rulePath = join(gameDirectory, ruleFile);
    const rule = await parseMarkdown(
      rulePath,
      await readFile(rulePath, "utf-8"),
    );
    rules.push(rule);
  }

  return rules.sort((a, b) => a.title.localeCompare(b.title));
}

async function parseMarkdown(fileName: string, rawText: string): Promise<Rule> {
  const sections = rawText.split(/^-{3,}$/gim);
  if (sections.length < 3) {
    throw new Error(`No frontmatter in file`);
  }

  const metadata = yaml.parse(sections[1]!);

  const referenceList: unknown[] = Array.isArray(metadata.reference)
    ? metadata.reference
    : [metadata.reference];

  const reference = referenceList
    .filter((ref): ref is string => typeof ref === "string")
    .sort()
    .map((ref) => `_${ref}_`)
    .join(", ");

  const content = await prettier.format(
    [
      `# ${metadata.title}`,
      ...sections.slice(2).map((md) => md.replace(/^(#+)/gim, "$1#")),
      reference,
    ].join("\n\n"),
    { parser: "markdown" },
  );

  return ruleSchema.parse({
    ...metadata,
    slug: basename(fileName, ".md"),
    content,
  });
}

function ruleToMarkdown(
  rule: Rule,
  includeFrontmatter: boolean = true,
  titleLink?: string,
): string {
  const titleText = titleLink ? `[${rule.title}](${titleLink})` : rule.title;
  return [
    includeFrontmatter
      ? `---\n${yaml.stringify({ title: rule.title })}---`
      : "",
    '<section class="rule markdown">',
    `# ${titleText}`,
    indentTitles(rule.content),
    "</section>",
  ]
    .join("\n\n")
    .trim();
}

function indentTitles(markdown: string): string {
  return markdown
    .split("\n")
    .map((l) => l.replace(/^#/, "##"))
    .join("\n");
}
