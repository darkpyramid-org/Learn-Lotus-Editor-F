import { describe, it, expect } from "vitest";
import { buildEditorSVG, buildExportSVG } from "@/services/svgBuilder";
import type { GlyphNode } from "@/types/editor";

const nodes: GlyphNode[] = [
  {
    instanceId: "n1",
    glyphId: "A1",
    transform: { rotate: 0, scale: 1, flipX: false, flipY: false },
  },
];

const svgMap = {
  A1: {
    content: '<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="#000000"/></svg>',
    width: 10,
    height: 10,
  },
};

describe("svgBuilder", () => {
  it("returns empty string for no nodes", () => {
    expect(buildEditorSVG([], svgMap)).toBe("");
  });

  it("builds an svg with lotus data comment", () => {
    const out = buildEditorSVG(nodes, svgMap);
    expect(out).toContain("<svg");
    expect(out).toContain("data-glyph-id=\"A1\"");
    expect(out).toContain("<!--LOTUS_DATA:");
  });

  it("buildExportSVG respects size presets", () => {
    const small = buildExportSVG(nodes, svgMap, "small");
    const large = buildExportSVG(nodes, svgMap, "large");
    expect(small).toContain('width="40"');
    expect(large).toContain('width="120"');
  });
});
