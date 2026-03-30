import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { GlyphNode } from "@/types/editor";
import { loadGlyph, GlyphCache } from "@/services/optimizedGlyphLoader";
import { cn } from "@/lib/utils";
import { Loader2, X, Search, ZoomIn } from "lucide-react";
import { extractInnerSVGContent } from "@/lib/svg-utils";
import { GLYPH_DATASET } from "@/data/glyphs";
import { Badge } from "@/components/ui/badge";

// Lightbox is now a standalone component in src/components/GlyphLightbox.tsx

/* ─────────────────────────────────────────────
   Main Canvas
───────────────────────────────────────────── */
export function EditorCanvas() {
  const { nodes, selectedIds, quadratSize, zoom, selectNode, deselectAll, setLightboxInstanceId } = useEditorStore();

  const handleBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) deselectAll();
  };

  return (
    <>
    <div className="relative w-full h-full overflow-hidden group/canvas">
      <div
        className="canvas-wrapper w-full h-full overflow-auto p-6 md:p-10"
        style={{ 
          background: "url('https://www.transparenttextures.com/patterns/natural-paper.png'), #f4ece1",
          minHeight: "calc(100vh - 120px)" // Account for header and footer
        }}
        onClick={handleBgClick}
      >
        {nodes.length === 0 && (
          /* Empty State */
          <div className="flex items-center justify-center min-h-full">
            <div
              className="flex flex-col items-center min-h-[220px] w-full max-w-[500px] border-2 border-dashed border-amber-300/50 rounded-2xl p-10 text-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              style={{
                backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')",
                backgroundColor: "#ffffffff",
              }}
            >
              <div className="text-7xl mb-6 opacity-10 animate-lotus-float text-primary select-none">𓆸</div>
              <p className="text-foreground/40 text-sm font-heading font-black uppercase tracking-[0.2em]">The Canvas is Empty</p>
              <p className="text-muted-foreground/30 text-xs font-serif italic mt-1">Select a sign from the left palette to begin</p>
            </div>
          </div>
        )}
        {/* Glyph Cards Grid */}
        {nodes.length > 0 && (
           <div
            className="flex flex-wrap gap-6 w-full items-start content-start"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
            onClick={handleBgClick}
          >
            {nodes.map((node) => (
              <GlyphNodeCard
                key={node.instanceId}
                node={node}
                quadratSize={quadratSize}
                selected={selectedIds.has(node.instanceId)}
                onSelect={(e) => {
                  e.stopPropagation();
                  selectNode(node.instanceId, e.metaKey || e.ctrlKey);
                }}
                onRemove={(e) => {
                  e.stopPropagation();
                  selectNode(node.instanceId, false);
                  setTimeout(() => useEditorStore.getState().removeSelected(), 0);
                }}
                onLightbox={(e) => {
                  e.stopPropagation();
                  setLightboxInstanceId(node.instanceId);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Individual Glyph Card
───────────────────────────────────────────── */
interface GlyphNodeCardProps {
  node: GlyphNode;
  quadratSize: number;
  selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onRemove: (e: React.MouseEvent) => void;
  onLightbox: (e: React.MouseEvent) => void;
}

function GlyphNodeCard({ node, quadratSize, selected, onSelect, onRemove, onLightbox }: GlyphNodeCardProps) {
  const [glyphContent, setGlyphContent] = useState<GlyphCache | null>(null);
  const [loading, setLoading] = useState(true);

  const glyphMeta = GLYPH_DATASET.find(g => g.id === node.glyphId);

  useEffect(() => {
    let mounted = true;
    loadGlyph(node.glyphId).then((data) => {
      if (mounted) { setGlyphContent(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [node.glyphId]);

  // Standard scale for canonical preview
  const naturalScale = glyphContent ? (quadratSize * 0.7) / Math.max(glyphContent.width, glyphContent.height) : 0;
  const finalScale = naturalScale;

  let minX = 0, minY = 0;
  if (glyphContent?.viewBox) {
    const parts = glyphContent.viewBox.trim().split(/\s+|,/).map(Number);
    if (parts.length >= 4) { minX = parts[0]; minY = parts[1]; }
  }
  const cx = glyphContent ? minX + glyphContent.width / 2 : 0;
  const cy = glyphContent ? minY + glyphContent.height / 2 : 0;
  const tx = quadratSize / 2;
  const ty = (quadratSize * 1.1) / 2; // Slightly lower center for icon overhead

  const transformStr = [
    `translate(${tx}, ${ty})`,
    `scale(${finalScale}, ${finalScale})`,
    `translate(${-cx}, ${-cy})`,
  ].join(" ");

  // A4-style dimensions: wider preview + compact footer
  const cardWidth = quadratSize * 2;
  const cardHeight = quadratSize + 100;

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-500 select-none overflow-hidden flex flex-col",
        "rounded-2xl bg-[#fdfaf4] border border-[#e8c07d]/30",
        "shadow-[0_4px_16px_rgba(0,0,0,0.07)]",
        "hover:shadow-[0_8px_32px_rgba(200,100,0,0.13)] hover:-translate-y-1",
        selected && "ring-2 ring-amber-500 ring-offset-2 shadow-[0_8px_32px_rgba(200,100,0,0.2)]"
      )}
      style={{ width: cardWidth, height: cardHeight }}
      onClick={onSelect}
    >
      {/* Floating X Remove — appears on hover */}
      <button
        className={cn(
          "absolute top-2.5 right-2.5 z-20 rounded-full w-6 h-6 flex items-center justify-center",
          "bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all duration-150",
          "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100",
        )}
        onClick={(e) => { e.stopPropagation(); onRemove(e); }}
        title="Remove"
      >
        <X size={11} strokeWidth={3.5} />
      </button>

      {/* Lightbox/Zoom button — appears when selected */}
      <button
        className={cn(
          "absolute top-2.5 left-2.5 z-20 rounded-full w-6 h-6 flex items-center justify-center",
          "bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all duration-150",
          "opacity-0 scale-90 transition-all",
          selected && "opacity-100 scale-100"
        )}
        onClick={(e) => { e.stopPropagation(); onLightbox(e); }}
        title="Open in Lightbox"
      >
        <ZoomIn size={11} strokeWidth={3.5} />
      </button>

      {/* Glyph Preview — warm cream area */}
      <div
        className="w-full flex items-center justify-center flex-1"
        style={{ background: "linear-gradient(160deg, #fdfaf4 60%, #f5ead6 100%)" }}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-amber-600/20" />
        ) : (
          <svg
            width={quadratSize * 0.72}
            height={quadratSize * 0.72}
            viewBox={`0 0 ${quadratSize} ${quadratSize}`}
            className="block overflow-visible transition-transform duration-500 group-hover:scale-105"
          >
            <g
              transform={transformStr}
              dangerouslySetInnerHTML={glyphContent ? { __html: extractInnerSVGContent(glyphContent.content) } : undefined}
              style={{ color: "#8B6914" }}
            />
          </svg>
        )}
      </div>

      {/* Footer — white card with metadata - always at bottom */}
      <div className="px-4 pt-3 pb-3 bg-white border-t border-amber-100/60 flex flex-col items-center text-center gap-1 mt-auto">
        <span className="text-[9px] font-black tracking-[0.22em] uppercase text-amber-600">
          Gardiner {node.glyphId}
        </span>
        <h3 className="text-[12.5px] font-bold text-gray-900 leading-tight line-clamp-1 font-sans">
          {glyphMeta?.label || "Unknown Sign"}
        </h3>
        <span className="mt-0.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-[#f4ece1] text-amber-700/70 border border-amber-200/60">
          {glyphMeta?.category || "Sign"}
        </span>
      </div>
    </div>
  );
}

// Utility extractInnerContent moved to src/lib/svg-utils.ts
