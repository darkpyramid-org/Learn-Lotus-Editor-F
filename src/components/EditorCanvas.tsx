import { useRef, useState, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { GlyphNode } from "@/types/editor";
import { loadGlyph, GlyphCache } from "@/services/glyphLoader";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function EditorCanvas() {
  const { nodes, selectedIds, quadratSize, zoom, selectNode, deselectAll } =
    useEditorStore();
  const svgRef = useRef<SVGSVGElement>(null);

  const totalWidth = Math.max(nodes.length * quadratSize + 200, quadratSize * 8);
  const totalHeight = quadratSize + 100;

  const handleBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as SVGElement).tagName === "svg") {
      deselectAll();
    }
  };

  return (
    <div 
      className="canvas-wrapper w-full h-full overflow-auto flex items-start justify-center p-10 md:p-20 relative"
      onClick={handleBgClick}
    >
      <div
        className="canvas-container relative transition-transform duration-300 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/40 rounded-sm bg-white"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          background: "url('https://www.transparenttextures.com/patterns/natural-paper.png'), #fdfdfb",
        }}
      >
        {nodes.length === 0 ? (
          <div className="empty-canvas flex flex-col items-center justify-center min-h-[220px] min-w-[700px] border-2 border-dashed border-muted/30 rounded-lg m-4">
            <div className="text-7xl mb-6 opacity-10 animate-lotus-float text-primary select-none">𓆸</div>
            <div className="space-y-1 text-center">
              <p className="text-foreground/40 text-sm font-heading font-black uppercase tracking-[0.2em]">The Canvas is Empty</p>
              <p className="text-muted-foreground/30 text-xs font-serif italic italic">Select a sign from the left palette to begin your composition</p>
            </div>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={totalWidth}
            height={totalHeight}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            className="editor-svg block select-none"
            onClick={handleBgClick}
          >
            <defs>
              <filter id="selected-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subtle horizontal guide lines */}
            <line x1="0" y1={50} x2={totalWidth} y2={50} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="5,5" className="opacity-30" />
            <line x1="0" y1={totalHeight - 50} x2={totalWidth} y2={totalHeight - 50} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="5,5" className="opacity-30" />

            {nodes.map((node, i) => (
              <GlyphNodeSVG
                key={node.instanceId}
                node={node}
                index={i}
                quadratSize={quadratSize}
                selected={selectedIds.has(node.instanceId)}
                onClick={(e) => {
                  e.stopPropagation();
                  selectNode(node.instanceId, e.metaKey || e.ctrlKey);
                }}
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

interface GlyphNodeSVGProps {
  node: GlyphNode;
  index: number;
  quadratSize: number;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

function GlyphNodeSVG({
  node,
  index,
  quadratSize,
  selected,
  onClick,
}: GlyphNodeSVGProps) {
  const [glyph, setGlyph] = useState<GlyphCache | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadGlyph(node.glyphId).then((data) => {
      if (mounted) {
        setGlyph(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [node.glyphId]);

  const x = index * (quadratSize * 0.9) + 100; 
  const y = 50; 
  const { rotate, scale, flipX, flipY } = node.transform;
  
  const naturalScale = glyph ? (quadratSize * 0.8) / Math.max(glyph.width, glyph.height) : 0;
  const finalScale = naturalScale * scale;
  
  const cx = glyph ? glyph.width / 2 : 0;
  const cy = glyph ? glyph.height / 2 : 0;

  const tx = x + quadratSize / 2;
  const ty = y + quadratSize / 2;

  const transformStr = [
    `translate(${tx}, ${ty})`,
    `scale(${flipX ? -finalScale : finalScale}, ${flipY ? -finalScale : finalScale})`,
    `rotate(${rotate})`,
    `translate(${-cx}, ${-cy})`,
  ].join(" ");

  return (
    <g
      className="glyph-node group transition-opacity duration-300"
      onClick={onClick}
      style={{ cursor: "pointer", opacity: loading ? 0 : 1 }}
    >
      {/* Selection Highlight */}
      {selected && (
        <g>
          <rect
            x={x}
            y={y}
            width={quadratSize}
            height={quadratSize}
            rx={8}
            className="fill-primary/5 stroke-primary stroke-[2] animate-pulse"
            strokeDasharray="4 4"
          />
          <circle cx={x} cy={y} r="3" className="fill-primary" />
          <circle cx={x+quadratSize} cy={y} r="3" className="fill-primary" />
          <circle cx={x} cy={y+quadratSize} r="3" className="fill-primary" />
          <circle cx={x+quadratSize} cy={y+quadratSize} r="3" className="fill-primary" />
        </g>
      )}
      
      {/* Invisible hit area */}
      <rect
        x={x}
        y={y}
        width={quadratSize}
        height={quadratSize}
        fill="transparent"
      />

      {loading ? (
        <g transform={`translate(${tx}, ${ty})`}>
          <circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 6" className="animate-spin text-muted-foreground/30" />
        </g>
      ) : (
        <g
          transform={transformStr}
          dangerouslySetInnerHTML={glyph ? { __html: extractInnerContent(glyph.content) } : undefined}
          className="transition-colors duration-300"
          style={{ color: selected ? "var(--primary)" : "var(--foreground)" }}
        />
      )}
    </g>
  );
}

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
