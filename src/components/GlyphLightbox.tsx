import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { loadGlyph, GlyphCache } from "@/services/optimizedGlyphLoader";
import { extractInnerSVGContent } from "@/lib/svg-utils";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  X, 
  RotateCw, 
  FlipHorizontal2, 
  FlipVertical2, 
  Minus, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Maximize,
  Trash2,
  Layers,
  ZoomIn,
  ZoomOut,
  Copy,
  Info
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { copyToClipboard } from "@/services/clipboardService";
import { toast } from "sonner";
import { GLYPH_DATASET } from "@/data/glyphs";
import { Badge } from "@/components/ui/badge";

interface GlyphLightboxProps {
  instanceId: string;
  onClose: () => void;
}

export function GlyphLightbox({ instanceId, onClose }: GlyphLightboxProps) {
  const { nodes, zoom, setZoom, updateTransform, reorderNode, quadratSize } = useEditorStore();
  const node = nodes.find((n) => n.instanceId === instanceId);
  const [glyph, setGlyph] = useState<GlyphCache | null>(null);
  const glyphMeta = GLYPH_DATASET.find(g => g.id === node?.glyphId);

  useEffect(() => {
    if (node) {
      loadGlyph(node.glyphId).then(setGlyph);
    }
  }, [node?.glyphId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!node) return null;

  const { rotate, scale, flipX, flipY } = node.transform;

  const naturalScale = glyph ? (quadratSize * 0.8) / Math.max(glyph.width, glyph.height) : 0;
  const finalScale = naturalScale * scale;

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

  const handleRotate = (deg: number) => updateTransform(instanceId, { rotate: deg });
  const handleScale = (val: number) => updateTransform(instanceId, { scale: Math.max(0.2, Math.min(3, val)) });
  const toggleFlipX = () => updateTransform(instanceId, { flipX: !flipX });
  const toggleFlipY = () => updateTransform(instanceId, { flipY: !flipY });

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden animate-in fade-in duration-300 pointer-events-auto"
      style={{ background: "rgba(10, 8, 5, 0.75)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col md:flex-row w-[99%] max-w-7xl h-[92%] max-h-[820px] rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-amber-500/10 group/lightbox bg-[#fdfaf5]"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Glyph Preview */}
        <div className="flex-1 relative flex flex-col bg-black/[0.02]">
          {/* Top Header Bar: Identity and Actions */}
          <div className="w-full h-24 px-10 flex items-center justify-between z-50 shrink-0 border-b border-amber-900/5 bg-white/30 backdrop-blur-sm">
            {/* Identity Badge */}
            <div className="flex items-center gap-5 select-none animate-in slide-in-from-left duration-700">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-amber-700/60 uppercase tracking-[0.4em]">Gardiner Sign</span>
                <span className="text-4xl font-black text-amber-900/90 font-mono tracking-tight leading-none">{node.glyphId}</span>
              </div>
              <Separator orientation="vertical" className="h-10 bg-amber-900/10" />
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-black text-amber-950 font-heading leading-tight leading-none">{glyphMeta?.label}</h2>
                <Badge variant="outline" className="h-5 w-fit text-[9px] font-black uppercase tracking-wider text-amber-700/60 bg-amber-50/50 border-amber-200/50">
                  {glyphMeta?.category}
                </Badge>
              </div>
            </div>

            {/* Combined Horizontal Actions (Toolbar + Close) */}
            <div className="flex items-center gap-3 animate-in slide-in-from-right duration-700">
              {/* Desktop Transformation Pill */}
              <div className="hidden lg:flex items-center gap-1.5 bg-white/60 backdrop-blur-md p-1.5 rounded-[1.25rem] border border-amber-900/10 shadow-sm">
                {/* Transform */}
                <div className="flex items-center gap-1 bg-amber-900/5 p-1 rounded-xl">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-900/60 hover:text-amber-900 hover:bg-white" onClick={() => handleRotate((rotate + 90) % 360)}>
                    <RotateCw size={14} strokeWidth={2.5} />
                  </Button>
                  <Separator orientation="vertical" className="h-3 bg-amber-900/10" />
                  <Button variant={flipX ? "secondary" : "ghost"} size="icon" className={cn("h-8 w-8 rounded-lg transition-all", flipX ? "bg-amber-600 text-white shadow-sm" : "hover:bg-white")} onClick={toggleFlipX}>
                    <FlipHorizontal2 size={14} strokeWidth={2.5} />
                  </Button>
                  <Button variant={flipY ? "secondary" : "ghost"} size="icon" className={cn("h-8 w-8 rounded-lg transition-all", flipY ? "bg-amber-600 text-white shadow-sm" : "hover:bg-white")} onClick={toggleFlipY}>
                    <FlipVertical2 size={14} strokeWidth={2.5} />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6 bg-amber-900/10 mx-0.5" />

                {/* Canvas Zoom */}
                <div className="flex items-center gap-1 bg-amber-900/5 p-1 rounded-xl">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-900/60 hover:text-amber-900 hover:bg-white transition-all" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
                    <ZoomOut size={14} strokeWidth={2.5} />
                  </Button>
                  <div className="min-w-[40px] text-center text-[10px] font-black text-amber-950/60 font-mono">{Math.round(zoom * 100)}%</div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-900/60 hover:text-amber-900 hover:bg-white transition-all" onClick={() => setZoom(Math.min(4, zoom + 0.25))}>
                    <ZoomIn size={14} strokeWidth={2.5} />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6 bg-amber-900/10 mx-0.5" />

                {/* Sign Scale */}
                <div className="flex items-center gap-1 bg-amber-900/5 p-1 rounded-xl">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-900/60 hover:text-amber-900 hover:bg-white transition-all" onClick={() => handleScale(scale - 0.1)}>
                    <Minus size={14} strokeWidth={3} />
                  </Button>
                  <div className="min-w-[40px] text-center text-[10px] font-black text-amber-950/60 font-mono">{Math.round(scale * 100)}%</div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-amber-900/60 hover:text-amber-900 hover:bg-white transition-all" onClick={() => handleScale(scale + 0.1)}>
                    <Plus size={14} strokeWidth={3} />
                  </Button>
                </div>
              </div>

              {/* Close Button (Shared horizontal row) */}
              <button
                className="w-10 h-10 rounded-2xl bg-amber-900/5 hover:bg-red-500/10 text-amber-900/40 hover:text-red-500 flex items-center justify-center transition-all duration-300 group/close border border-amber-900/10 shadow-sm"
                onClick={onClose}
                title="Close (Esc)"
              >
                <X size={20} strokeWidth={2.5} className="group-hover/close:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Main Preview Content */}
          <div className="flex-1 relative flex items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#b48c50 1.5px, transparent 1.5px)", backgroundSize: "30px 30px" }} />
            
            {glyph ? (
              <div
                className="w-full h-full flex items-center justify-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-out"
                style={{ transform: `scale(${1.5 * zoom})` }}
              >
                <svg
                  width={quadratSize}
                  height={quadratSize}
                  viewBox={`0 0 ${quadratSize} ${quadratSize}`}
                  className="block overflow-visible"
                  style={{ width: "80%", height: "80%" }}
                >
                  <g
                    transform={transformStr}
                    dangerouslySetInnerHTML={{ __html: extractInnerSVGContent(glyph.content) }}
                    className="transition-all duration-400 ease-out text-amber-950"
                    style={{ transitionProperty: "transform" }}
                  />
                </svg>
              </div>
            ) : (
              <Loader2 className="w-12 h-12 animate-spin text-amber-600/40" />
            )}

            <div className="absolute bottom-8 left-10 flex items-center gap-3 text-[9px] font-black text-amber-900/30 uppercase tracking-[0.2em] animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600/40" /> Live Preview Sync
            </div>
          </div>
        </div>

        {/* Right Side: Tool Panel */}
        <div className="w-full md:w-[380px] bg-white/60 backdrop-blur-2xl border-l border-amber-900/10 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.05)] h-full">
          <header className="px-8 py-8 border-b border-amber-900/5 flex items-center justify-between shrink-0 bg-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg shadow-amber-600/20 flex items-center justify-center text-white">
                <Info size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-black uppercase tracking-[0.25em] text-amber-950/80">Sign Inspector</h2>
                <span className="text-[10px] font-bold text-amber-700/40 uppercase tracking-tight">Technical Properties</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-8 py-7 space-y-9 no-scrollbar">
            {/* Transformations */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-800/60 flex items-center gap-2">
                    <RotateCw size={12} strokeWidth={2.5} /> Orientation
                  </label>
                  <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-lg border border-amber-200/50">{rotate}°</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 90, 180, 270].map((deg) => (
                    <Button key={deg} variant={rotate === deg ? "default" : "outline"} className={cn("h-9 text-[10px] font-black border-amber-100/60 transition-all", rotate === deg ? "bg-amber-600 hover:bg-amber-700 text-white" : "hover:bg-amber-100/30")} onClick={() => handleRotate(deg)}>
                      {deg}°
                    </Button>
                  ))}
                </div>
                <Slider min={0} max={359} step={1} value={[rotate]} onValueChange={([v]) => handleRotate(v)} className="py-2" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-800/60 flex items-center gap-2">
                    <Maximize size={12} strokeWidth={2.5} /> Magnification
                  </label>
                  <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-lg border border-amber-200/50">{Math.round(scale * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-amber-200/50 hover:bg-amber-100/30" onClick={() => handleScale(scale - 0.1)}>
                    <Minus size={14} strokeWidth={3} />
                  </Button>
                  <Slider min={0.2} max={3} step={0.05} value={[scale]} onValueChange={([v]) => handleScale(v)} className="flex-1 py-2" />
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-amber-200/50 hover:bg-amber-100/30" onClick={() => handleScale(scale + 0.1)}>
                    <Plus size={14} strokeWidth={3} />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-800/60 flex items-center gap-2">
                  <Layers size={14} strokeWidth={2.5} /> Symmetry
                </label>
                <div className="flex gap-2">
                  <Button variant={flipX ? "default" : "outline"} className={cn("flex-1 h-11 gap-2 border-amber-100/60 transition-all", flipX ? "bg-amber-600 text-white" : "hover:bg-amber-100/30")} onClick={toggleFlipX}>
                    <FlipHorizontal2 size={16} /><span className="text-[10px] font-black uppercase tracking-tighter">Flip H</span>
                  </Button>
                  <Button variant={flipY ? "secondary" : "outline"} className={cn("flex-1 h-11 gap-2 border-amber-100/60 transition-all", flipY ? "bg-amber-600 text-white shadow-none" : "hover:bg-amber-100/30")} onClick={toggleFlipY}>
                    <FlipVertical2 size={16} /><span className="text-[10px] font-black uppercase tracking-tighter">Flip V</span>
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="bg-amber-900/5" />

            {/* Global Workspace Control */}
            <div className="space-y-4 p-5 rounded-3xl bg-amber-600/[0.04] border border-amber-600/10 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-600 flex items-center gap-2">
                  <ZoomIn size={14} /> Workspace Zoom
                </label>
                <span className="text-xs font-mono font-black text-amber-600">{Math.round(zoom * 100)}%</span>
              </div>
              <Slider min={0.25} max={4} step={0.25} value={[zoom]} onValueChange={([v]) => setZoom(v)} className="cursor-pointer" />
            </div>

            {/* Arrangement Control */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-amber-800/60 flex items-center gap-2">
                <Layers size={12} strokeWidth={2.5} /> Arrangement
              </label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10 border-amber-100/60 hover:bg-amber-900/5 text-amber-900/70" onClick={() => reorderNode(instanceId, "left")}>
                  <ChevronLeft size={16} className="mr-1" /> Earlier
                </Button>
                <Button variant="outline" className="flex-1 h-10 border-amber-100/60 hover:bg-amber-900/5 text-amber-900/70" onClick={() => reorderNode(instanceId, "right")}>
                  Later <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <footer className="px-8 py-7 border-t border-amber-900/5 bg-amber-900/[0.02] shrink-0 space-y-3">
            <Button variant="secondary" className="w-full h-11 text-[11px] font-black uppercase tracking-[0.2em] border-amber-200/50 hover:bg-amber-100/30 transition-all font-mono" onClick={async () => {
              try {
                await copyToClipboard([node], "wysiwyg", quadratSize);
                toast.success("Vector SVG copied to clipboard");
              } catch (err) {
                toast.error("Copy failed");
              }
            }}>
              <Copy size={14} className="mr-2 opacity-70" />Copy Vector
            </Button>
            <Button variant="destructive" className="w-full h-11 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all font-mono" onClick={() => {
              useEditorStore.getState().selectNode(instanceId, false);
              setTimeout(() => {
                useEditorStore.getState().removeSelected();
                onClose();
              }, 0);
            }}>
              <Trash2 size={14} className="mr-2" />Remove Sign
            </Button>
          </footer>
        </div>
      </div>
    </div>
  )
}
