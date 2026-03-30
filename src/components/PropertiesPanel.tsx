import { useEditorStore } from "@/store/editorStore";
import { GLYPH_DATASET } from "@/data/glyphs";
import { 
  RotateCw, 
  FlipHorizontal2, 
  FlipVertical2, 
  Layers, 
  Maximize, 
  MousePointer2,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut
} from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PropertiesPanel() {
  const { nodes, selectedIds, zoom, setZoom, updateTransform } = useEditorStore();

  const selectedNodes = nodes.filter((n) => selectedIds.has(n.instanceId));
  const hasSelection = selectedNodes.length > 0;

  if (!hasSelection) {
    return (
      <div className="properties-panel h-full flex flex-col bg-card/50">
        <header className="px-4 py-5 border-b border-border bg-card flex items-center justify-between">
          <h3 className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-[0.2em]">
            Inspector
          </h3>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-3xl bg-muted/40 flex items-center justify-center mb-6 shadow-sm ring-1 ring-border/50">
            <MousePointer2 size={24} className="text-muted-foreground/60 animate-pulse" />
          </div>
          <h4 className="text-sm font-bold text-foreground/60 mb-1.5 font-heading">No Sign Selected</h4>
          <p className="text-[11px] text-muted-foreground/50 leading-relaxed font-medium">
            Click on a hieroglyph on the canvas to view and modify its properties.
          </p>
        </div>
      </div>
    );
  }

  const node = selectedNodes[0];
  const glyph = GLYPH_DATASET.find((g) => g.id === node.glyphId);
  const { rotate, scale, flipX, flipY } = node.transform;

  const handleRotate = (deg: number) => {
    selectedNodes.forEach((n) => updateTransform(n.instanceId, { rotate: deg }));
  };

  const handleScale = (val: number) => {
    const next = Math.max(0.2, Math.min(3, val));
    selectedNodes.forEach((n) => updateTransform(n.instanceId, { scale: +next.toFixed(2) }));
  };

  const setFlip = (dir: 'x' | 'y', active: boolean) => {
    selectedNodes.forEach((n) => {
      const patch = dir === 'x' ? { flipX: active } : { flipY: active };
      updateTransform(n.instanceId, patch);
    });
  };

  return (
    <div className="properties-panel h-full flex flex-col bg-card/50 overflow-hidden">
      <header className="px-4 py-5 border-b border-border bg-card flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-[0.2em]">
            Sign Properties
          </h3>
          {selectedNodes.length > 1 && (
            <Badge variant="secondary" className="text-[9px] font-black h-5 uppercase tracking-tighter bg-primary/20 text-primary border-none">
              {selectedNodes.length} Selected
            </Badge>
          )}
        </div>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-4 space-y-6">
          {/* Controls — Now primary focus as Identity moved to Canvas & Lightbox */}

          {/* Canvas Zoom Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <ZoomIn size={12} className="text-foreground/60" />
                Canvas Zoom
              </Label>
              <span className="text-[11px] font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 rounded-full border-input/40 shrink-0"
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              >
                <ZoomOut size={12} strokeWidth={3} />
              </Button>
              <Slider
                min={0.25}
                max={4}
                step={0.25}
                value={[zoom]}
                onValueChange={([val]: number[]) => setZoom(val)}
                className="flex-1 cursor-pointer"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 rounded-full border-input/40 shrink-0"
                onClick={() => setZoom(Math.min(4, zoom + 0.25))}
              >
                <ZoomIn size={12} strokeWidth={3} />
              </Button>
            </div>
            <ToggleGroup 
              type="single" 
              value={zoom.toString()} 
              onValueChange={(val: string) => val && setZoom(Number(val))}
              className="grid grid-cols-4 gap-1 w-full"
            >
              {[0.5, 1, 1.5, 2].map((z) => (
                <ToggleGroupItem 
                  key={z} 
                  value={z.toString()} 
                  className="text-[9px] font-black h-8 px-0 rounded-md border border-input/40 bg-card hover:bg-accent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200"
                >
                  {Math.round(z * 100)}%
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Separator className="bg-border/40" />

          {/* Controls */}
          <div className="space-y-7">
            {/* Rotation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <RotateCw size={12} className="text-foreground/60" />
                  Orientation
                </Label>
                <span className="text-[11px] font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                  {rotate}°
                </span>
              </div>
              <ToggleGroup 
                type="single" 
                value={rotate.toString()} 
                onValueChange={(val: string) => val && handleRotate(Number(val))}
                className="grid grid-cols-4 gap-1 w-full"
              >
                {[0, 90, 180, 270].map((deg) => (
                  <ToggleGroupItem 
                    key={deg} 
                    value={deg.toString()} 
                    className="text-[10px] font-black h-8 px-0 rounded-md border border-input/40 bg-card hover:bg-accent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200"
                  >
                    {deg}°
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Slider
                min={0}
                max={359}
                step={1}
                value={[rotate]}
                onValueChange={([val]: number[]) => handleRotate(val)}
                className="cursor-pointer"
              />
            </div>

            {/* Scale */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Maximize size={12} className="text-foreground/60" />
                  Magnification
                </Label>
                <span className="text-[11px] font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7 rounded-full border-input/40 shrink-0"
                  onClick={() => handleScale(scale - 0.1)}
                >
                  <Minus size={12} strokeWidth={3} />
                </Button>
                <Slider
                  min={0.2}
                  max={3.0}
                  step={0.05}
                  value={[scale]}
                  onValueChange={([val]: number[]) => handleScale(val)}
                  className="flex-1 cursor-pointer"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7 rounded-full border-input/40 shrink-0"
                  onClick={() => handleScale(scale + 0.1)}
                >
                  <Plus size={12} strokeWidth={3} />
                </Button>
              </div>
              <ToggleGroup 
                type="single" 
                value={scale.toString()} 
                onValueChange={(val: string) => val && handleScale(Number(val))}
                className="grid grid-cols-5 gap-1 w-full"
              >
                {[0.5, 0.75, 1, 1.5, 2].map((s) => (
                  <ToggleGroupItem 
                    key={s} 
                    value={s.toString()} 
                    className="text-[9px] font-black h-8 px-0 rounded-md border border-input/40 bg-card hover:bg-accent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200"
                  >
                    {Math.round(s * 100)}%
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Flip Controls */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Layers size={12} className="text-foreground/60" />
                Symmetry
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={cn(
                    "p-2.5 flex flex-col items-center gap-2 cursor-pointer transition-all rounded-md ring-1 ring-border/50",
                    flipX ? "bg-primary/10 ring-primary/40" : "bg-card hover:bg-accent/40"
                  )}
                  onClick={() => setFlip('x', !flipX)}
                >
                  <FlipHorizontal2 size={16} className={flipX ? "text-primary" : "text-foreground/60"} />
                  <span className={cn("text-[9px] font-black uppercase tracking-tighter", flipX ? "text-primary" : "text-muted-foreground/60")}>Horizontal</span>
                </div>
                <div
                  className={cn(
                    "p-2.5 flex flex-col items-center gap-2 cursor-pointer transition-all rounded-md ring-1 ring-border/50",
                    flipY ? "bg-primary/10 ring-primary/40" : "bg-card hover:bg-accent/40"
                  )}
                  onClick={() => setFlip('y', !flipY)}
                >
                  <FlipVertical2 size={16} className={flipY ? "text-primary" : "text-foreground/60"} />
                  <span className={cn("text-[9px] font-black uppercase tracking-tighter", flipY ? "text-primary" : "text-muted-foreground/60")}>Vertical</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </ScrollArea>
      </div>
      
      <footer className="shrink-0 p-4 border-t border-border bg-muted/20">
         <div className="flex items-center justify-between text-[9px] font-mono font-bold text-muted-foreground/40">
           <span className="uppercase tracking-tighter truncate max-w-[120px]">UID: {node.instanceId}</span>
           <span className="bg-card px-1.5 py-0.5 rounded shadow-xs uppercase tracking-widest">{glyph?.category}</span>
         </div>
      </footer>
    </div>
  );
}
