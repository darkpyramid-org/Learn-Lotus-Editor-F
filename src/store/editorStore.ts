import { create } from "zustand";
import { GlyphNode, GlyphTransform } from "@/types/editor";
import { GLYPH_DATASET } from "@/data/glyphs";
import { nanoid } from "nanoid";

interface EditorState {
  nodes: GlyphNode[];
  selectedIds: Set<string>;
  quadratSize: number;
  zoom: number;

  addGlyph: (glyphId: string, transform?: Partial<GlyphTransform>) => void;
  removeNode: (id: string) => void;
  removeSelected: () => void;
  selectNode: (id: string, multi?: boolean) => void;
  deselectAll: () => void;
  updateTransform: (id: string, patch: Partial<GlyphTransform>) => void;
  reorderNode: (id: string, direction: "left" | "right") => void;
  setZoom: (z: number) => void;
  clearAll: () => void;
  lightboxInstanceId: string | null;
  setLightboxInstanceId: (id: string | null) => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  selectedIds: new Set(),
  quadratSize: 100,
  zoom: 1,

  addGlyph: (glyphId, transform) => {
    const glyph = GLYPH_DATASET.find((g) => g.id === glyphId);
    if (!glyph) return;
    const node: GlyphNode = {
      instanceId: nanoid(),
      glyphId,
      transform: {
        rotate: transform?.rotate ?? 0,
        scale: transform?.scale ?? 1,
        flipX: transform?.flipX ?? false,
        flipY: transform?.flipY ?? false,
      },
    };
    set((s) => ({ nodes: [...s.nodes, node] }));
  },

  removeNode: (id) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.instanceId !== id),
      selectedIds: new Set([...s.selectedIds].filter((x) => x !== id)),
      lightboxInstanceId: s.lightboxInstanceId === id ? null : s.lightboxInstanceId,
    }));
  },

  removeSelected: () => {
    const { selectedIds, lightboxInstanceId } = get();
    set((s) => ({
      nodes: s.nodes.filter((n) => !selectedIds.has(n.instanceId)),
      selectedIds: new Set(),
      lightboxInstanceId:
        lightboxInstanceId && selectedIds.has(lightboxInstanceId)
          ? null
          : lightboxInstanceId,
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

  setZoom: (zoom) => {
    if (typeof zoom !== "number" || Number.isNaN(zoom)) return;
    set({ zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)) });
  },

  clearAll: () => set({ nodes: [], selectedIds: new Set(), lightboxInstanceId: null }),

  lightboxInstanceId: null,
  setLightboxInstanceId: (id) => set({ lightboxInstanceId: id }),
}));
