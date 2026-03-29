import { useEditorStore } from "@/store/editorStore";
import { copyToClipboard, pasteFromClipboard } from "@/services/clipboardService";
import { 
  RotateCw, 
  FlipHorizontal2, 
  FlipVertical2, 
  Minus, 
  Plus, 
  Trash2, 
  Copy, 
  ClipboardPaste, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Eraser,
  MousePointer,
  Command
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Toolbar() {
  const {
    nodes,
    selectedIds,
    quadratSize,
    zoom,
    updateTransform,
    removeSelected,
    reorderNode,
    setZoom,
    clearAll,
    addGlyph,
  } = useEditorStore();

  const selectedNodes = nodes.filter((n) => selectedIds.has(n.instanceId));
  const hasSelection = selectedNodes.length > 0;
  const firstSelected = selectedNodes[0];

  const applyToAll = (fn: (id: string, node: any) => void) => {
    selectedNodes.forEach((n) => fn(n.instanceId, n));
  };

  const handleRotate = () => {
    applyToAll((id, node) => {
      updateTransform(id, { rotate: (node.transform.rotate + 90) % 360 });
    });
  };

  const handleFlipX = () => {
    applyToAll((id, node) => {
      updateTransform(id, { flipX: !node.transform.flipX });
    });
  };

  const handleFlipY = () => {
    applyToAll((id, node) => {
      updateTransform(id, { flipY: !node.transform.flipY });
    });
  };

  const handleScale = (delta: number) => {
    applyToAll((id, node) => {
      const next = Math.max(0.2, Math.min(3, node.transform.scale + delta));
      updateTransform(id, { scale: +next.toFixed(2) });
    });
  };

  const handleReorder = (dir: "left" | "right") => {
    if (firstSelected) reorderNode(firstSelected.instanceId, dir);
  };

  const handleCopy = async (size: "small" | "large" | "wysiwyg") => {
    try {
      const toCopy = hasSelection ? selectedNodes : nodes;
      await copyToClipboard(toCopy, size, quadratSize);
      toast.success(`Copied ${toCopy.length} sign(s) to clipboard as Vector-SVG`, {
        description: `Format: ${size === 'wysiwyg' ? '1:1 Scale' : size.charAt(0).toUpperCase() + size.slice(1)}`
      });
    } catch (err) {
      toast.error("Clipboard access failed");
    }
  };

  const handlePaste = async () => {
    const parsed = await pasteFromClipboard();
    if (parsed.length > 0) {
      parsed.forEach((p) => addGlyph(p.glyphId));
      toast.success(`Pasted ${parsed.length} sign(s) into editor`);
    } else {
      toast.info("No valid hieroglyphic data found on clipboard");
    }
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-full overflow-x-auto no-scrollbar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mr-4 select-none shrink-0 group">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
           <span className="text-lg text-primary-foreground font-black">𓂀</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] leading-none">Lotus</span>
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Editor Pro</span>
        </div>
      </div>

      <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 shrink-0" />

      {/* Transform Group */}
      <div className="flex items-center gap-1 shrink-0">
        <ToolButton 
          icon={RotateCw} 
          tooltip="Rotate 90°" 
          onClick={handleRotate} 
          disabled={!hasSelection} 
        />
        <ToolButton 
          icon={FlipHorizontal2} 
          tooltip="Horizontal Flip" 
          onClick={handleFlipX} 
          disabled={!hasSelection} 
        />
        <ToolButton 
          icon={FlipVertical2} 
          tooltip="Vertical Flip" 
          onClick={handleFlipY} 
          disabled={!hasSelection} 
        />
      </div>

      <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 shrink-0" />

      {/* Scale Group */}
      <div className="flex items-center gap-1 shrink-0">
        <ToolButton 
          icon={Minus} 
          tooltip="Scale Down" 
          onClick={() => handleScale(-0.1)} 
          disabled={!hasSelection} 
        />
        <div className="h-8 px-2 flex items-center justify-center bg-muted/40 rounded-md border border-input/20 min-w-[50px]">
           <span className="text-[10px] font-black font-mono text-primary/80">
              {firstSelected ? `${Math.round(firstSelected.transform.scale * 100)}%` : "100%"}
           </span>
        </div>
        <ToolButton 
          icon={Plus} 
          tooltip="Scale Up" 
          onClick={() => handleScale(0.1)} 
          disabled={!hasSelection} 
        />
      </div>

      <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 shrink-0" />

      {/* Order Group */}
      <div className="flex items-center gap-1 shrink-0">
        <ToolButton 
          icon={ChevronLeft} 
          tooltip="Move Layer Left" 
          onClick={() => handleReorder("left")} 
          disabled={!firstSelected} 
        />
        <ToolButton 
          icon={ChevronRight} 
          tooltip="Move Layer Right" 
          onClick={() => handleReorder("right")} 
          disabled={!firstSelected} 
        />
      </div>

      <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 shrink-0" />

      {/* Clipboard Group */}
      <div className="flex items-center gap-1 shrink-0 bg-muted/20 p-1 rounded-lg">
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-7 px-2.5 text-[9px] font-black uppercase tracking-tighter"
          onClick={() => handleCopy('wysiwyg')}
          disabled={nodes.length === 0}
        >
          <Copy size={12} className="mr-1.5 opacity-60" />
          Copy SVG
        </Button>
        <ToolButton 
          icon={ClipboardPaste} 
          tooltip="Paste (MOD+V)" 
          onClick={handlePaste} 
        />
      </div>

      <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 shrink-0" />

      {/* View Group */}
      <div className="flex items-center gap-1 shrink-0">
        <ToolButton 
          icon={ZoomOut} 
          tooltip="Zoom Out" 
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} 
        />
        <span className="text-[10px] font-black font-mono w-10 text-center opacity-60">
          {Math.round(zoom * 100)}%
        </span>
        <ToolButton 
          icon={ZoomIn} 
          tooltip="Zoom In" 
          onClick={() => setZoom(Math.min(4, zoom + 0.25))} 
        />
      </div>

      <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 mt-auto shrink-0 mr-auto lg:mr-2" />

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <ToolButton 
          icon={Trash2} 
          tooltip="Delete Selected" 
          variant="ghost"
          className="text-destructive/60 hover:text-destructive hover:bg-destructive/10" 
          onClick={removeSelected} 
          disabled={!hasSelection} 
        />
        <ToolButton 
          icon={Eraser} 
          tooltip="Clear Workspace" 
          variant="ghost"
          className="text-destructive/60 hover:text-destructive hover:bg-destructive/10" 
          onClick={clearAll} 
          disabled={nodes.length === 0} 
        />
      </div>
    </div>
  );
}

interface ToolButtonProps {
  icon: any;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "ghost" | "secondary" | "outline" | "default";
  className?: string;
}

function ToolButton({ icon: Icon, tooltip, onClick, disabled, variant = "outline", className }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={cn("h-8 w-8 rounded-md border-input/20", className)}
          onClick={onClick}
          disabled={disabled}
        >
          <Icon size={14} strokeWidth={2.5} className="opacity-80" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest bg-foreground text-background py-1 px-2 border-none">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
