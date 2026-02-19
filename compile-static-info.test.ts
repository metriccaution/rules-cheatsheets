import { describe, expect, test } from "bun:test";
import { loadRules } from "compile-static-info";
import { join } from "node:path";

describe("Loading sources", () => {
  test("Can load the reference data", async () => {
    await expect(
      loadRules(join(__dirname, "rules", "dnd")),
    ).resolves.toBeDefined();
  });
});
