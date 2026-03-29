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
import { Palette, Settings2 } from "lucide-react";

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
  const { nodes, selectedIds, removeSelected, addGlyph, quadratSize } = useEditorStore();
  const [isMobile, setIsMobile] = useState(false);

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
          <Suspense fallback={<ComponentLoader />}>
            <Toolbar />
          </Suspense>
          
          {/* Mobile Action Buttons */}
          <div className="lg:hidden flex items-center gap-1 ml-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-900/70">
                  <Palette className="h-5 w-5" />
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

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-900/70">
                  <Settings2 className="h-5 w-5" />
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

        {/* Global Footer / Status Bar */}
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
