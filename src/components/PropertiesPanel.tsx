import { useEditorStore } from "@/store/editorStore";
import { GLYPH_DATASET } from "@/data/glyphs";
import { getGlyphUrl } from "@/services/glyphLoader";
import { 
  RotateCw, 
  FlipHorizontal2, 
  FlipVertical2, 
  Info, 
  Layers, 
  Maximize, 
  MousePointer2 
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PropertiesPanel() {
  const { nodes, selectedIds, updateTransform } = useEditorStore();

  const selectedNodes = nodes.filter((n) => selectedIds.has(n.instanceId));
  const hasSelection = selectedNodes.length > 0;

  if (!hasSelection) {
    return (
      <div className="properties-panel h-full flex flex-col bg-card/50">
        <header className="px-4 py-3 border-b border-border bg-card">
          <h3 className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-[0.2em]">
            Inspector
          </h3>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-3xl bg-muted/40 flex items-center justify-center mb-6 shadow-sm ring-1 ring-border/50">
            <MousePointer2 size={24} className="text-muted-foreground/30 animate-pulse" />
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
    selectedNodes.forEach((n) => updateTransform(n.instanceId, { scale: val }));
  };

  const setFlip = (dir: 'x' | 'y', active: boolean) => {
    selectedNodes.forEach((n) => {
      const patch = dir === 'x' ? { flipX: active } : { flipY: active };
      updateTransform(n.instanceId, patch);
    });
  };

  return (
    <div className="properties-panel h-full flex flex-col bg-card/50">
      <header className="px-4 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
        <h3 className="text-[10px] font-extrabold text-foreground/70 uppercase tracking-[0.2em]">
          Sign Properties
        </h3>
        {selectedNodes.length > 1 && (
          <Badge variant="secondary" className="text-[9px] font-black h-5 uppercase tracking-tighter bg-primary/20 text-primary border-none">
            {selectedNodes.length} Selected
          </Badge>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Identity Card */}
          {glyph ? (
            <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
              <div className="w-full h-48 flex items-center justify-center p-0.5 bg-gradient-to-b from-muted/50 to-muted/20 relative">
                 <img 
                   src={getGlyphUrl(glyph.id)} 
                   alt={glyph.label} 
                   className="w-[85%] h-[85%] object-contain drop-shadow-md transition-transform duration-500 hover:scale-105"
                   style={{ 
                     filter: "brightness(0) saturate(100%) invert(30%) sepia(50%) saturate(600%) hue-rotate(10deg)",
                     marginTop: "-1px" 
                   }}
                 />
              </div>
              <CardContent className="p-4 text-center">
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Gardiner {glyph.id}</p>
                <p className="font-heading font-bold text-foreground text-sm leading-tight mb-2.5">{glyph.label}</p>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/70 bg-muted/30">
                  {glyph.category}
                </Badge>
              </CardContent>
            </Card>
          ) : (
            null
          )}

          <Separator className="bg-border/40" />

          {/* Controls */}
          <div className="space-y-7">
            {/* Rotation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <RotateCw size={12} className="text-secondary-foreground/40" />
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
                  <Maximize size={12} className="text-secondary-foreground/40" />
                  Magnification
                </Label>
                <span className="text-[11px] font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <ToggleGroup 
                type="single" 
                value={scale.toString()} 
                onValueChange={(val: string) => val && handleScale(Number(val))}
                className="grid grid-cols-3 gap-1 w-full"
              >
                {[0.5, 1, 1.5].map((s) => (
                  <ToggleGroupItem 
                    key={s} 
                    value={s.toString()} 
                    className="text-[10px] font-black h-8 px-0 rounded-md border border-input/40 bg-card hover:bg-accent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200"
                  >
                    {s * 100}%
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Slider
                min={0.2}
                max={3.0}
                step={0.05}
                value={[scale]}
                onValueChange={([val]: number[]) => handleScale(val)}
                className="cursor-pointer"
              />
            </div>

            {/* Flip Controls */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Layers size={12} className="text-secondary-foreground/40" />
                Symmetry
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Card 
                  className={cn(
                    "p-2.5 flex flex-col items-center gap-2 cursor-pointer transition-all border-none ring-1 ring-border/50",
                    flipX ? "bg-primary/10 ring-primary/40" : "bg-card hover:bg-accent/40"
                  )}
                  onClick={() => setFlip('x', !flipX)}
                >
                  <FlipHorizontal2 size={16} className={flipX ? "text-primary" : "text-muted-foreground/50"} />
                  <span className={cn("text-[9px] font-black uppercase tracking-tighter", flipX ? "text-primary" : "text-muted-foreground/60")}>Horizontal</span>
                </Card>
                <Card 
                  className={cn(
                    "p-2.5 flex flex-col items-center gap-2 cursor-pointer transition-all border-none ring-1 ring-border/50",
                    flipY ? "bg-primary/10 ring-primary/40" : "bg-card hover:bg-accent/40"
                  )}
                  onClick={() => setFlip('y', !flipY)}
                >
                  <FlipVertical2 size={16} className={flipY ? "text-primary" : "text-muted-foreground/50"} />
                  <span className={cn("text-[9px] font-black uppercase tracking-tighter", flipY ? "text-primary" : "text-muted-foreground/60")}>Vertical</span>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <footer className="shrink-0 p-4 border-t border-border bg-muted/20">
         <div className="flex items-center justify-between text-[9px] font-mono font-bold text-muted-foreground/40">
           <span className="uppercase tracking-tighter truncate max-w-[120px]">UID: {node.instanceId}</span>
           <span className="bg-card px-1.5 py-0.5 rounded shadow-xs uppercase tracking-widest">{glyph?.category}</span>
         </div>
      </footer>
    </div>
  );
}
