import { describe, expect, test } from "bun:test";
import { discoverSystems } from "compile-static-info";
import { join } from "node:path";

describe("Loading sources", () => {
  test("Can discover and load all systems", async () => {
    const systems = await discoverSystems(join(__dirname, "rules"));
    expect(systems.length).toBeGreaterThan(0);
    expect(systems[0]!.rules.length).toBeGreaterThan(0);
  });
});
