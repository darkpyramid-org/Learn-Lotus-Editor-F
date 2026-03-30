import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { GlyphNode } from "@/types/editor";
import { loadGlyph, GlyphCache } from "@/services/optimizedGlyphLoader";
import { cn } from "@/lib/utils";
import { Loader2, X, ZoomIn } from "lucide-react";

/* ─────────────────────────────────────────────
   Lightbox: shows one glyph full-size
───────────────────────────────────────────── */
interface LightboxProps {
  glyphId: string;
  onClose: () => void;
}

function GlyphLightbox({ glyphId, onClose }: LightboxProps) {
  const [glyph, setGlyph] = useState<GlyphCache | null>(null);

  useEffect(() => {
    loadGlyph(glyphId).then(setGlyph);
  }, [glyphId]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    /* Backdrop — absolute so it only covers the editor pane */
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(30,15,5,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "url('https://www.transparenttextures.com/patterns/natural-paper.png'), #fdfaf5",
          border: "1px solid rgba(180,140,80,0.35)",
          maxWidth: "min(82vw, 640px)",
          maxHeight: "min(80vh, 640px)",
          width: "min(82vw, 640px)",
          height: "min(80vh, 640px)",
          padding: "40px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-amber-900/10 hover:bg-red-500 text-amber-900/60 hover:text-white flex items-center justify-center transition-all duration-150 shadow-sm"
          onClick={onClose}
          title="Close"
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        {/* Glyph ID badge */}
        <div className="absolute top-3 left-4 text-[11px] font-mono font-black text-amber-700/50 tracking-widest uppercase">
          {glyphId}
        </div>

        {/* SVG fills container */}
        {glyph ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              viewBox={glyph.viewBox || `0 0 ${glyph.width} ${glyph.height}`}
              style={{ width: "100%", height: "100%", display: "block" }}
              preserveAspectRatio="xMidYMid meet"
              dangerouslySetInnerHTML={{ __html: extractInnerContent(glyph.content) }}
            />
          </div>
        ) : (
          <Loader2 className="w-12 h-12 animate-spin text-amber-600/40" />
        )}

        {/* Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-amber-700/30 font-mono uppercase tracking-widest whitespace-nowrap">
          Press Esc or click outside to close
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Canvas
───────────────────────────────────────────── */
export function EditorCanvas() {
  const { nodes, selectedIds, quadratSize, zoom, selectNode, deselectAll } = useEditorStore();
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  const openLightbox = useCallback((glyphId: string) => setLightboxId(glyphId), []);
  const closeLightbox = useCallback(() => setLightboxId(null), []);

  const handleBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) deselectAll();
  };

  return (
    <>
      <div
        className="canvas-wrapper w-full h-full overflow-auto p-6 md:p-10 relative"
        style={{ background: "url('https://www.transparenttextures.com/patterns/natural-paper.png'), #f4ece1" }}
        onClick={handleBgClick}
      >
        {nodes.length === 0 ? (
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
        ) : (
          /* Glyph Grid — fills full row, no trailing gap */
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
                  openLightbox(node.glyphId);
                }}
              />
            ))}
          </div>
        )}
        {/* Lightbox — scoped to this editor area only */}
        {lightboxId && <GlyphLightbox glyphId={lightboxId} onClose={closeLightbox} />}
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
  const [glyph, setGlyph] = useState<GlyphCache | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadGlyph(node.glyphId).then((data) => {
      if (mounted) { setGlyph(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [node.glyphId]);

  const { rotate, scale, flipX, flipY } = node.transform;
  const naturalScale = glyph ? (quadratSize * 0.8) / Math.max(glyph.width, glyph.height) : 0;
  const finalScale = naturalScale; // User scale is now applied to the board

  let minX = 0, minY = 0;
  if (glyph?.viewBox) {
    const parts = glyph.viewBox.trim().split(/\s+|,/).map(Number);
    if (parts.length >= 4) { minX = parts[0]; minY = parts[1]; }
  }
  const cx = glyph ? minX + glyph.width / 2 : 0;
  const cy = glyph ? minY + glyph.height / 2 : 0;
  const tx = quadratSize / 2;
  const ty = quadratSize / 2;

  const transformStr = [
    `translate(${tx}, ${ty})`,
    `scale(${flipX ? -finalScale : finalScale}, ${flipY ? -finalScale : finalScale})`,
    `rotate(${rotate})`,
    `translate(${-cx}, ${-cy})`,
  ].join(" ");

  return (
    <div
      className={cn(
        "relative group cursor-pointer rounded-xl transition-all duration-200 select-none",
        "shadow-[0_2px_8px_rgba(0,0,0,0.08)] border",
        selected
          ? "border-primary/60 ring-2 ring-primary/40 shadow-[0_4px_16px_rgba(200,100,0,0.2)]"
          : "border-amber-200/60 hover:border-amber-400/60 hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)]",
      )}
      style={{
        width: quadratSize * scale,
        height: (quadratSize + 32) * scale,
        backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')",
        backgroundColor: selected ? "#fef9f0" : "#fdfaf5",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease",
      }}
      onClick={onSelect}
    >
      {/* Glyph ID */}
      <div className="absolute top-1.5 left-2 text-[9px] font-mono font-bold text-amber-700/40 leading-none pointer-events-none">
        {node.glyphId}
      </div>

      {/* ✕ Remove button */}
      <button
        className={cn(
          "absolute top-1 right-1 z-20 rounded-full w-5 h-5 flex items-center justify-center",
          "bg-red-500/80 hover:bg-red-600 text-white shadow-sm transition-all duration-150",
          "opacity-0 group-hover:opacity-100",
          selected && "opacity-100",
        )}
        onClick={onRemove}
        title="Remove"
      >
        <X size={10} strokeWidth={3} />
      </button>

      {/* 🔍 Lightbox button (bottom-right) */}
      <button
        className={cn(
          "absolute bottom-1 right-1 z-20 rounded-full w-5 h-5 flex items-center justify-center",
          "bg-amber-600/70 hover:bg-amber-700 text-white shadow-sm transition-all duration-150",
          "opacity-0 group-hover:opacity-100",
          selected && "opacity-100",
        )}
        onClick={onLightbox}
        title="View full size"
      >
        <ZoomIn size={9} strokeWidth={2.5} />
      </button>

      {/* SVG glyph */}
      <div
        className="flex items-center justify-center w-full"
        style={{ height: (quadratSize + 8) * scale, paddingTop: 16 * scale }}
      >
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
        ) : (
          <svg
            width={quadratSize * scale}
            height={quadratSize * scale}
            viewBox={`0 0 ${quadratSize} ${quadratSize}`}
            className="block overflow-visible"
          >
            <g
              transform={transformStr}
              dangerouslySetInnerHTML={glyph ? { __html: extractInnerContent(glyph.content) } : undefined}
              className="transition-colors duration-300 pointer-events-none"
              style={{ color: selected ? "var(--primary)" : "var(--foreground)" }}
            />
          </svg>
        )}
      </div>

      {/* Selected dot */}
      {selected && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary/60" />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Utility
───────────────────────────────────────────── */
function extractInnerContent(svgText: string): string {
  let content = svgText
    .replace(/<\?xml.*?\?>/i, "")
    .replace(/<!DOCTYPE.*?>/i, "")
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>/i, "");
  content = content.replace(/fill\s*[:=]\s*["']?#000000["']?/gi, 'fill="currentColor"');
  content = content.replace(/stroke\s*[:=]\s*["']?#000000["']?/gi, 'stroke="currentColor"');
  return content;
}
