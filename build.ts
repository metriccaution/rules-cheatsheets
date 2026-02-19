import Metalsmith from "metalsmith";
import layouts from "@metalsmith/layouts";
import markdown from "@metalsmith/markdown";
import { join } from "node:path";
import { loadRules, writeGameSystem } from "compile-static-info";
import { mkdir } from "node:fs/promises";

const game = await loadRules(join(__dirname, "rules", "dnd"));
await mkdir(join(__dirname, "generated"), { recursive: true });
await writeGameSystem(game, join(__dirname, "generated"));

await Metalsmith(__dirname)
  .source("./generated")
  .destination("./static")
  .clean(true)
  .metadata({
    buildTime: new Date().toISOString(),
  })
  .use(markdown())
  .use(
    layouts({
      transform: "nunjucks",
      default: "default.nunjucks",
      pattern: "**/*.html", // Input pattern - but markdown has already turned it into HTML
    }),
  )
  // .env("DEBUG", "@metalsmith/layouts*")
  .build();
