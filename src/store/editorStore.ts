import { create } from "zustand";
import { GlyphNode, GlyphTransform } from "@/types/editor";
import { GLYPH_DATASET } from "@/data/glyphs";
import { nanoid } from "nanoid";

interface EditorState {
  nodes: GlyphNode[];
  selectedIds: Set<string>;
  quadratSize: number;
  zoom: number;

  addGlyph: (glyphId: string) => void;
  removeSelected: () => void;
  selectNode: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  updateTransform: (id: string, patch: Partial<GlyphTransform>) => void;
  reorderNode: (id: string, direction: "left" | "right") => void;
  setZoom: (z: number) => void;
  clearAll: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  selectedIds: new Set(),
  quadratSize: 100,
  zoom: 1,

  addGlyph: (glyphId) => {
    const glyph = GLYPH_DATASET.find((g) => g.id === glyphId);
    if (!glyph) return;
    const node: GlyphNode = {
      instanceId: nanoid(),
      glyphId,
      transform: { rotate: 0, scale: 1, flipX: false, flipY: false },
    };
    set((s) => ({ nodes: [...s.nodes, node] }));
  },

  removeSelected: () => {
    const { selectedIds } = get();
    set((s) => ({
      nodes: s.nodes.filter((n) => !selectedIds.has(n.instanceId)),
      selectedIds: new Set(),
    }));
  },

  selectNode: (id, multi = false) => {
    set((s) => {
      if (multi) {
        const next = new Set(s.selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { selectedIds: next };
      }
      if (s.selectedIds.has(id) && s.selectedIds.size === 1) {
        return { selectedIds: new Set() };
      }
      return { selectedIds: new Set([id]) };
    });
  },

  deselectAll: () => set({ selectedIds: new Set() }),

  updateTransform: (id, patch) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.instanceId === id
          ? { ...n, transform: { ...n.transform, ...patch } }
          : n
      ),
    }));
  },

  reorderNode: (id, direction) => {
    set((s) => {
      const idx = s.nodes.findIndex((n) => n.instanceId === id);
      if (idx === -1) return s;
      const nodes = [...s.nodes];
      if (direction === "left" && idx > 0) {
        [nodes[idx - 1], nodes[idx]] = [nodes[idx], nodes[idx - 1]];
      } else if (direction === "right" && idx < nodes.length - 1) {
        [nodes[idx], nodes[idx + 1]] = [nodes[idx + 1], nodes[idx]];
      }
      return { nodes };
    });
  },

  setZoom: (zoom) => set({ zoom }),

  clearAll: () => set({ nodes: [], selectedIds: new Set() }),
}));
