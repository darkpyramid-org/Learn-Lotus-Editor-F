import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/store/editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().clearAll();
    useEditorStore.getState().setZoom(1);
  });

  it("starts empty", () => {
    const s = useEditorStore.getState();
    expect(s.nodes).toEqual([]);
    expect(s.selectedIds.size).toBe(0);
    expect(s.zoom).toBe(1);
  });

  it("adds a known glyph", () => {
    useEditorStore.getState().addGlyph("A1");
    const s = useEditorStore.getState();
    expect(s.nodes).toHaveLength(1);
    expect(s.nodes[0].glyphId).toBe("A1");
    expect(s.nodes[0].instanceId).toBeTruthy();
    expect(s.nodes[0].transform).toEqual({
      rotate: 0,
      scale: 1,
      flipX: false,
      flipY: false,
    });
  });

  it("ignores unknown glyph ids", () => {
    useEditorStore.getState().addGlyph("NOT_A_GLYPH");
    expect(useEditorStore.getState().nodes).toHaveLength(0);
  });

  it("selects and removes nodes", () => {
    useEditorStore.getState().addGlyph("A1");
    useEditorStore.getState().addGlyph("G17");
    const [a, b] = useEditorStore.getState().nodes;
    useEditorStore.getState().selectNode(a.instanceId);
    expect(useEditorStore.getState().selectedIds.has(a.instanceId)).toBe(true);
    useEditorStore.getState().removeSelected();
    const remaining = useEditorStore.getState().nodes;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].instanceId).toBe(b.instanceId);
  });

  it("clamps zoom between 0.25 and 4", () => {
    useEditorStore.getState().setZoom(0.01);
    expect(useEditorStore.getState().zoom).toBe(0.25);
    useEditorStore.getState().setZoom(99);
    expect(useEditorStore.getState().zoom).toBe(4);
  });

  it("updates transform", () => {
    useEditorStore.getState().addGlyph("N35");
    const id = useEditorStore.getState().nodes[0].instanceId;
    useEditorStore.getState().updateTransform(id, { rotate: 90, scale: 1.5 });
    const t = useEditorStore.getState().nodes[0].transform;
    expect(t.rotate).toBe(90);
    expect(t.scale).toBe(1.5);
  });
});
