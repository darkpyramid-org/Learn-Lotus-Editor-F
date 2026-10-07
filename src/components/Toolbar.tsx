import { useEditorStore } from "@/store/editorStore";
import { copyToClipboard, pasteFromClipboard } from "@/services/clipboardService";
import { 
  Minus, 
  Plus, 
  Trash2, 
  Copy, 
  ClipboardPaste, 
  ChevronLeft, 
  ChevronRight, 
  Eraser,
  Menu,
  Palette,
  SlidersHorizontal,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Link } from "wouter";

function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("lotus-theme", isDark ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  }, [isDark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-lg transition-all duration-200 ease-out"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setIsDark((v) => !v)}
      aria-pressed={isDark}
    >
      <Sun size={16} className="sun-moon-icon sun" />
      <Moon size={16} className="sun-moon-icon moon absolute inset-0 rotate-90 scale-0 opacity-0" />
    </Button>
  );
}

interface ToolbarProps {
  isMobile?: boolean;
  paletteNode?: React.ReactNode;
  propertiesNode?: React.ReactNode;
}

export function Toolbar({ isMobile = false, paletteNode, propertiesNode }: ToolbarProps) {
  const { nodes, selectedIds, quadratSize, updateTransform, removeSelected, reorderNode, clearAll, addGlyph } = useEditorStore();

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
      parsed.forEach((p) => addGlyph(p.glyphId, p.transform));
      toast.success(`Pasted ${parsed.length} sign(s) into editor`);
    } else {
      toast.info("No valid hieroglyphic data found on clipboard");
    }
  };

  // Mobile layout - keep existing mobile functionality
  if (isMobile) {
    return (
      <div className="flex items-center justify-between w-full h-14 px-4">
        {/* Palette drawer (replaces the hidden left sidebar) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" aria-label="Open glyph palette">
              <Menu size={16} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[85vw] max-w-sm">
            <SheetHeader className="sr-only">
              <SheetTitle>Hieroglyph Palette</SheetTitle>
              <SheetDescription>Choose a sign to add to the canvas</SheetDescription>
            </SheetHeader>
            {paletteNode}
          </SheetContent>
        </Sheet>

        {/* Mobile Brand */}
        <Link href="/" className="flex items-center select-none group gap-2 mx-2 min-w-0" title="Back to home">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
             <span className="text-primary-foreground font-black text-sm">𓂀</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">Lotus</span>
            <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Editor</span>
          </div>
        </Link>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1 ms-auto">
          <LanguageToggle />
          <ThemeToggle />
          <ToolButton icon={Copy} tooltip="Copy" onClick={() => handleCopy('wysiwyg')} disabled={nodes.length === 0} />
          <ToolButton icon={ClipboardPaste} tooltip="Paste" onClick={handlePaste} />
          {/* Inspector drawer (replaces the hidden right sidebar) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Open sign properties">
                <SlidersHorizontal size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[85vw] max-w-sm">
              <SheetHeader className="sr-only">
                <SheetTitle>Sign Properties</SheetTitle>
                <SheetDescription>Rotate, scale and flip the selected signs</SheetDescription>
              </SheetHeader>
              {propertiesNode}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  // Desktop layout - three sections
  return (
    <div className="flex items-center w-full h-14">
      {/* Left Section - Brand (above Glyph Palette) */}
      <div className="flex items-center px-4" style={{ width: "260px", flexShrink: 0 }}>
        <Link href="/" className="flex items-center select-none group gap-2.5" title="Back to home">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
             <span className="text-primary-foreground font-black text-lg">𓂀</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] leading-none">Lotus</span>
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Editor Pro</span>
          </div>
        </Link>
      </div>

      {/* Center Section - Editor Controls (above Editor Canvas) */}
      <div className="flex-1 flex items-center justify-center gap-2 px-4">
        {/* Clipboard Group */}
        <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg">
          <Button variant="secondary" size="sm" className="h-7 px-2.5 text-[9px] font-black uppercase tracking-tighter" onClick={() => handleCopy('wysiwyg')} disabled={nodes.length === 0}>
            <Copy size={12} className="mr-1.5 opacity-60" /> Copy SVG
          </Button>
          <ToolButton icon={ClipboardPaste} tooltip="Paste (MOD+V)" onClick={handlePaste} />
        </div>
      </div>

      {/* Right Section - Menu Icons (above Sign Properties) */}
      <div className="flex items-center justify-end px-4" style={{ width: "240px", flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
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
        <Button variant={variant} size="icon" className={cn("h-8 w-8", className)} onClick={onClick} disabled={disabled}>
          <Icon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}