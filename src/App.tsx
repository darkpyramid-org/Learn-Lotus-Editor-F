import { useEffect, useState, lazy, Suspense } from "react";
import { useEditorStore } from "@/store/editorStore";
import { copyToClipboard, pasteFromClipboard } from "@/services/clipboardService";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PerformanceStats } from "@/components/PerformanceStats";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Settings2, 
  Menu,
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
  Eraser
} from "lucide-react";
import { toast } from "sonner";

// Lazy load heavy components
const GlyphPalette = lazy(() => import("@/components/GlyphPalette").then(m => ({ default: m.GlyphPalette })));
const EditorCanvas = lazy(() => import("@/components/EditorCanvas").then(m => ({ default: m.EditorCanvas })));
const Toolbar = lazy(() => import("@/components/Toolbar").then(m => ({ default: m.Toolbar })));
const PropertiesPanel = lazy(() => import("@/components/PropertiesPanel").then(m => ({ default: m.PropertiesPanel })));

// Lightweight loading component
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
    </div>
  );
}

function Editor() {
  const { 
    nodes, 
    selectedIds, 
    quadratSize, 
    zoom, 
    removeSelected, 
    addGlyph, 
    updateTransform,
    reorderNode,
    setZoom,
    clearAll
  } = useEditorStore();
  const [isMobile, setIsMobile] = useState(false);

  const selectedNodes = nodes.filter((n) => selectedIds.has(n.instanceId));
  const hasSelection = selectedNodes.length > 0;
  const firstSelected = selectedNodes[0];

  // Mobile toolbar functions
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

  const handleCopy = async () => {
    try {
      const toCopy = hasSelection ? selectedNodes : nodes;
      await copyToClipboard(toCopy, "wysiwyg", quadratSize);
      toast.success(`Copied ${toCopy.length} sign(s) to clipboard as Vector-SVG`);
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === "c") {
        e.preventDefault();
        const selectedNodes = nodes.filter((n) => selectedIds.has(n.instanceId));
        const toCopy = selectedNodes.length > 0 ? selectedNodes : nodes;
        await copyToClipboard(toCopy, "wysiwyg", quadratSize);
      }
      if (mod && e.key === "v") {
        e.preventDefault();
        const parsed = await pasteFromClipboard();
        parsed.forEach((p) => addGlyph(p.glyphId));
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
        removeSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, selectedIds, removeSelected, addGlyph, quadratSize]);

  return (
    <TooltipProvider>
      <div className="app-shell h-screen w-screen flex flex-col overflow-hidden bg-background">
        {/* Top Navigation / Toolbar */}
        <header className="toolbar-area border-b border-border bg-card/80 backdrop-blur-md z-50 shrink-0 h-14 flex items-center px-4 relative">
          {/* Desktop Toolbar */}
          <div className="hidden lg:flex w-full">
            <Suspense fallback={<ComponentLoader />}>
              <Toolbar />
            </Suspense>
          </div>
          
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between w-full">
            {/* Left: Brand */}
            <div className="flex items-center gap-2 select-none shrink-0">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <span className="text-sm text-primary-foreground font-black">𓂀</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] leading-none">Lotus</span>
                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Editor</span>
              </div>
            </div>

            {/* Center: Quick Actions */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-2 flex-1 justify-center">
              {/* Transform buttons */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0" 
                onClick={handleRotate}
                disabled={!hasSelection}
              >
                <RotateCw size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0" 
                onClick={handleFlipX}
                disabled={!hasSelection}
              >
                <FlipHorizontal2 size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0" 
                onClick={handleFlipY}
                disabled={!hasSelection}
              >
                <FlipVertical2 size={14} />
              </Button>
              
              <Separator orientation="vertical" className="h-6 mx-1" />
              
              {/* Scale buttons */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0" 
                onClick={() => handleScale(-0.1)}
                disabled={!hasSelection}
              >
                <Minus size={14} />
              </Button>
              <div className="h-6 px-2 flex items-center justify-center bg-muted/40 rounded text-[9px] font-mono min-w-[40px] shrink-0">
                {firstSelected ? `${Math.round(firstSelected.transform.scale * 100)}%` : "100%"}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0" 
                onClick={() => handleScale(0.1)}
                disabled={!hasSelection}
              >
                <Plus size={14} />
              </Button>
              
              <Separator orientation="vertical" className="h-6 mx-1" />
              
              {/* Copy/Paste */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0" 
                onClick={handleCopy}
                disabled={nodes.length === 0}
              >
                <Copy size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0" 
                onClick={handlePaste}
              >
                <ClipboardPaste size={14} />
              </Button>
            </div>

            {/* Right: Menu Actions */}
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
                      {/* Layer Order */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-12 flex flex-col gap-1" 
                        onClick={() => handleReorder("left")}
                        disabled={!firstSelected}
                      >
                        <ChevronLeft size={16} />
                        <span className="text-[9px]">Layer ←</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-12 flex flex-col gap-1" 
                        onClick={() => handleReorder("right")}
                        disabled={!firstSelected}
                      >
                        <ChevronRight size={16} />
                        <span className="text-[9px]">Layer →</span>
                      </Button>
                      
                      {/* Zoom */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-12 flex flex-col gap-1" 
                        onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                      >
                        <ZoomOut size={16} />
                        <span className="text-[9px]">Zoom -</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-12 flex flex-col gap-1" 
                        onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                      >
                        <ZoomIn size={16} />
                        <span className="text-[9px]">Zoom +</span>
                      </Button>
                      
                      {/* Delete Actions */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-12 flex flex-col gap-1 text-destructive border-destructive/20" 
                        onClick={removeSelected}
                        disabled={!hasSelection}
                      >
                        <Trash2 size={16} />
                        <span className="text-[9px]">Delete</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-12 flex flex-col gap-1 text-destructive border-destructive/20" 
                        onClick={clearAll}
                        disabled={nodes.length === 0}
                      >
                        <Eraser size={16} />
                        <span className="text-[9px]">Clear All</span>
                      </Button>
                      
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

              {/* Glyph Palette */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-900/70">
                    <Palette size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] bg-[#fdfaf5]">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Glyph Palette</SheetTitle>
                    <SheetDescription>Browse and add hieroglyphs</SheetDescription>
                  </SheetHeader>
                  <Suspense fallback={<ComponentLoader />}>
                    <GlyphPalette />
                  </Suspense>
                </SheetContent>
              </Sheet>

              {/* Properties Panel */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-900/70">
                    <Settings2 size={16} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-[240px] bg-[#fdfaf5]">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Properties</SheetTitle>
                    <SheetDescription>Edit selected glyph transform</SheetDescription>
                  </SheetHeader>
                  <Suspense fallback={<ComponentLoader />}>
                    <PropertiesPanel />
                  </Suspense>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <div className="main-area flex flex-1 overflow-hidden relative">
          {/* Desktop Left Sidebar: Palette */}
          {!isMobile && (
            <aside className="palette-sidebar border-r border-border bg-card transition-all duration-300 shadow-sm z-30" style={{ width: "260px", flexShrink: 0 }}>
              <Suspense fallback={<ComponentLoader />}>
                <GlyphPalette />
              </Suspense>
            </aside>
          )}

          {/* Center: Editor Content */}
          <main className="editor-main flex-1 overflow-hidden relative bg-[#f4ece1]">
            <div className="canvas-bg h-full w-full overflow-auto scrollbar-thin">
              <Suspense fallback={<ComponentLoader />}>
                <EditorCanvas />
              </Suspense>
            </div>
          </main>

          {/* Desktop Right Sidebar: Properties */}
          {!isMobile && (
            <aside className="props-sidebar border-l border-border bg-card transition-all duration-300 shadow-sm z-30" style={{ width: "240px", flexShrink: 0 }}>
              <Suspense fallback={<ComponentLoader />}>
                <PropertiesPanel />
              </Suspense>
            </aside>
          )}
        </div>

        {/* Mobile Status Bar */}
        {isMobile && (
          <div className="lg:hidden border-t border-border bg-card/30 backdrop-blur-sm px-4 py-2 flex items-center justify-between h-10 shrink-0 z-40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-900/60 uppercase tracking-widest">
                {nodes.length} Sign{nodes.length !== 1 ? "s" : ""}
              </span>
            </div>
            {selectedIds.size > 0 && (
              <div className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded uppercase">
                {selectedIds.size} Selected
              </div>
            )}
            <div className="text-[9px] text-amber-900/40 font-mono">
              {Math.round(zoom * 100)}% Zoom
            </div>
          </div>
        )}

        {/* Global Footer / Status Bar - Desktop Only */}
        {!isMobile && (
          <footer className="status-bar border-t border-border bg-card/30 backdrop-blur-sm px-4 py-1.5 flex items-center gap-6 h-8 shrink-0 z-40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-900/60 uppercase tracking-widest">
                {nodes.length} Sign{nodes.length !== 1 ? "s" : ""} in Scene
              </span>
            </div>
            {selectedIds.size > 0 && (
              <div className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded uppercase">
                {selectedIds.size} Selected
              </div>
            )}
            <div className="ml-auto hidden sm:flex items-center gap-4 text-[9px] text-amber-900/40 font-mono">
              <span>MOD + C COPY</span>
              <span>MOD + V PASTE</span>
              <span>DEL REMOVE</span>
            </div>
          </footer>
        )}
      </div>
      <Toaster position="bottom-center" richColors />
      <PerformanceStats />
    </TooltipProvider>
  );
}

function App() {
  return <Editor />;
}

export default App;
