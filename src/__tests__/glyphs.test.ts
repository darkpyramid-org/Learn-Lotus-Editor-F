import { describe, it, expect } from "vitest";
import { GLYPH_DATASET, CATEGORIES, GLYPH_IDS } from "@/data/glyphs";

describe("glyph dataset", () => {
  it("exports a non-empty curated list", () => {
    expect(GLYPH_DATASET.length).toBeGreaterThan(50);
  });

  it("has unique glyph ids", () => {
    const ids = GLYPH_DATASET.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("exposes category list derived from dataset", () => {
    expect(CATEGORIES.length).toBeGreaterThan(5);
    expect(CATEGORIES).toContain("People");
    expect(CATEGORIES).toContain("Birds");
  });

  it("GLYPH_IDS matches dataset", () => {
    expect(GLYPH_IDS.size).toBe(GLYPH_DATASET.length);
    expect(GLYPH_IDS.has("A1")).toBe(true);
    expect(GLYPH_IDS.has("G17")).toBe(true);
  });

  it("every glyph has required fields", () => {
    for (const g of GLYPH_DATASET) {
      expect(g.id).toBeTruthy();
      expect(g.label).toBeTruthy();
      expect(g.category).toBeTruthy();
      expect(g.viewBox).toMatch(/^\d/);
    }
  });
});
