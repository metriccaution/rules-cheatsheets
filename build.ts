import Metalsmith from "metalsmith";
import layouts from "@metalsmith/layouts";
import markdown from "@metalsmith/markdown";
import { join } from "node:path";
import {
  discoverSystems,
  writeLandingPage,
  writeGameSystem,
} from "compile-static-info";
import { mkdir, rm } from "node:fs/promises";

const systems = await discoverSystems(join(__dirname, "rules"));

await rm(join(__dirname, "generated"), { recursive: true, force: true });
await mkdir(join(__dirname, "generated"), { recursive: true });
for (const system of systems) {
  await mkdir(join(__dirname, "generated", system.slug), { recursive: true });
  await writeGameSystem(system, join(__dirname, "generated", system.slug));
}
await writeLandingPage(systems, join(__dirname, "generated"));

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
