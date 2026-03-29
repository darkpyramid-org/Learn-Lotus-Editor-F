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
  Menu,
  Palette,
  Settings2
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import React from "react";

interface ToolbarProps {
  isMobile?: boolean;
  paletteNode?: React.ReactNode;
  propertiesNode?: React.ReactNode;
}

export function Toolbar({ isMobile = false, paletteNode, propertiesNode }: ToolbarProps) {
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
    <div className={cn("flex items-center w-full max-w-full", isMobile ? "justify-between" : "gap-2 overflow-x-auto no-scrollbar")}>
      
      {/* Brand */}
      <div className={cn("flex items-center select-none shrink-0 group", isMobile ? "gap-2" : "gap-2.5 mr-4")}>
        <div className={cn("rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300", isMobile ? "h-8 w-8" : "h-9 w-9 shadow-primary/20")}>
           <span className={cn("text-primary-foreground font-black", isMobile ? "text-sm" : "text-lg")}>𓂀</span>
        </div>
        <div className="flex flex-col">
          <span className={cn("font-black text-foreground uppercase tracking-[0.15em] leading-none", isMobile ? "text-[10px]" : "text-[11px] tracking-[0.2em]")}>Lotus</span>
          <span className={cn("font-bold text-muted-foreground/60 uppercase tracking-tighter", isMobile ? "text-[8px]" : "text-[9px]")}>{isMobile ? "Editor" : "Editor Pro"}</span>
        </div>
      </div>

      {!isMobile && <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 shrink-0" />}

      {/* Primary Actions (Scrollable Center on Mobile, Standard Flex on Desktop) */}
      <div className={cn("flex items-center shrink-0", isMobile ? "gap-1 overflow-x-auto scrollbar-none px-2 flex-1 justify-center" : "gap-1")}>
        {/* Transform Group */}
        <ToolButton icon={RotateCw} tooltip="Rotate 90°" onClick={handleRotate} disabled={!hasSelection} />
        <ToolButton icon={FlipHorizontal2} tooltip="Horizontal Flip" onClick={handleFlipX} disabled={!hasSelection} />
        <ToolButton icon={FlipVertical2} tooltip="Vertical Flip" onClick={handleFlipY} disabled={!hasSelection} />
        
        <Separator orientation="vertical" className={cn("bg-border/50 shrink-0", isMobile ? "h-6 mx-1" : "h-8 mx-1")} />

        {/* Scale Group */}
        <ToolButton icon={Minus} tooltip="Scale Down" onClick={() => handleScale(-0.1)} disabled={!hasSelection} />
        <div className={cn("flex items-center justify-center bg-muted/40 font-mono text-primary/80 shrink-0", isMobile ? "h-6 px-2 rounded min-w-[40px] text-[9px]" : "h-8 px-2 rounded-md border border-input/20 min-w-[50px] font-black text-[10px]")}>
            {firstSelected ? `${Math.round(firstSelected.transform.scale * 100)}%` : "100%"}
        </div>
        <ToolButton icon={Plus} tooltip="Scale Up" onClick={() => handleScale(0.1)} disabled={!hasSelection} />

        <Separator orientation="vertical" className={cn("bg-border/50 shrink-0", isMobile ? "h-6 mx-1" : "h-8 mx-1")} />

        {/* Desktop-only Direct Order Tools (Hidden on Mobile main scroll) */}
        {!isMobile && (
          <>
            <ToolButton icon={ChevronLeft} tooltip="Move Layer Left" onClick={() => handleReorder("left")} disabled={!firstSelected} />
            <ToolButton icon={ChevronRight} tooltip="Move Layer Right" onClick={() => handleReorder("right")} disabled={!firstSelected} />
            <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 shrink-0" />
          </>
        )}

        {/* Clipboard Group */}
        {isMobile ? (
          <>
            <ToolButton icon={Copy} tooltip="Copy Selected" onClick={() => handleCopy('wysiwyg')} disabled={nodes.length === 0} />
            <ToolButton icon={ClipboardPaste} tooltip="Paste" onClick={handlePaste} />
          </>
        ) : (
          <div className="flex items-center gap-1 shrink-0 bg-muted/20 p-1 rounded-lg">
            <Button variant="secondary" size="sm" className="h-7 px-2.5 text-[9px] font-black uppercase tracking-tighter" onClick={() => handleCopy('wysiwyg')} disabled={nodes.length === 0}>
              <Copy size={12} className="mr-1.5 opacity-60" /> Copy SVG
            </Button>
            <ToolButton icon={ClipboardPaste} tooltip="Paste (MOD+V)" onClick={handlePaste} />
          </div>
        )}
      </div>

      {/* Right side options */}
      {!isMobile ? (
        <>
          <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 shrink-0" />
          
          {/* Desktop View Group */}
          <div className="flex items-center gap-1 shrink-0">
            <ToolButton icon={ZoomOut} tooltip="Zoom Out" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} />
            <span className="text-[10px] font-black font-mono w-10 text-center opacity-60">
              {Math.round(zoom * 100)}%
            </span>
            <ToolButton icon={ZoomIn} tooltip="Zoom In" onClick={() => setZoom(Math.min(4, zoom + 0.25))} />
          </div>

          <Separator orientation="vertical" className="h-8 bg-border/50 mx-1 mt-auto shrink-0 mr-auto lg:mr-2" />

          {/* Desktop Delete Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <ToolButton icon={Trash2} tooltip="Delete Selected" variant="ghost" className="text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={removeSelected} disabled={!hasSelection} />
            <ToolButton icon={Eraser} tooltip="Clear Workspace" variant="ghost" className="text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={clearAll} disabled={nodes.length === 0} />
          </div>
        </>
      ) : (
        /* Mobile Specific Hidden Tools Sheet Menus */
        <div className="flex items-center gap-1 shrink-0">
          {/* More Tools Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-900/70">
                <Menu size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto max-h-[50vh] bg-[#fdfaf5] border-b">
              <SheetHeader className="sr-only">
                <SheetTitle>More Tools</SheetTitle>
                <SheetDescription>Additional editing tools</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="grid grid-cols-4 gap-3">
                  <MobileMenuButton icon={ChevronLeft} label="Layer ←" onClick={() => handleReorder("left")} disabled={!firstSelected} />
                  <MobileMenuButton icon={ChevronRight} label="Layer →" onClick={() => handleReorder("right")} disabled={!firstSelected} />
                  <MobileMenuButton icon={ZoomOut} label="Zoom -" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} />
                  <MobileMenuButton icon={ZoomIn} label="Zoom +" onClick={() => setZoom(Math.min(4, zoom + 0.25))} />
                  <MobileMenuButton icon={Trash2} label="Delete" onClick={removeSelected} disabled={!hasSelection} className="text-destructive border-destructive/20" />
                  <MobileMenuButton icon={Eraser} label="Clear All" onClick={clearAll} disabled={nodes.length === 0} className="text-destructive border-destructive/20" />
                  
                  {/* Status Info */}
                  <div className="h-12 flex flex-col justify-center items-center bg-muted/20 rounded border border-dashed">
                    <span className="text-[10px] font-bold text-primary">{Math.round(zoom * 100)}%</span>
                    <span className="text-[8px] text-muted-foreground">Zoom</span>
                  </div>
                  <div className="h-12 flex flex-col justify-center items-center bg-muted/20 rounded border border-dashed">
                    <span className="text-[10px] font-bold text-primary">{nodes.length}</span>
                    <span className="text-[8px] text-muted-foreground">Signs</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Glyph Palette Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-900/70">
                <Palette size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[85vw] sm:w-[320px] bg-[#fdfaf5]">
              <SheetHeader className="sr-only">
                <SheetTitle>Glyph Palette</SheetTitle>
                <SheetDescription>Browse and add hieroglyphs</SheetDescription>
              </SheetHeader>
              {paletteNode}
            </SheetContent>
          </Sheet>

          {/* Properties Panel Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-900/70">
                <Settings2 size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[85vw] sm:w-[280px] lg:w-[240px] bg-[#fdfaf5]">
              <SheetHeader className="sr-only">
                <SheetTitle>Properties</SheetTitle>
                <SheetDescription>Edit selected glyph transform</SheetDescription>
              </SheetHeader>
              {propertiesNode}
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}

function MobileMenuButton({ icon: Icon, label, onClick, disabled, className }: any) {
  return (
    <Button variant="outline" size="sm" className={cn("h-12 flex flex-col gap-1", className)} onClick={onClick} disabled={disabled}>
      <Icon size={16} />
      <span className="text-[9px]">{label}</span>
    </Button>
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
