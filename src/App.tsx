import { useEffect, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { copyToClipboard, pasteFromClipboard } from "@/services/clipboardService";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { toast } from "sonner";
import { Toolbar } from "@/components/Toolbar";

// Ultra-lazy load heavy components - only when actually needed
let GlyphPalette: any = null;
let EditorCanvas: any = null;
let PropertiesPanel: any = null;
let PerformanceStats: any = null;

const loadComponent = async (name: string) => {
  switch (name) {
    case 'GlyphPalette':
      if (!GlyphPalette) {
        const module = await import("@/components/GlyphPalette");
        GlyphPalette = module.GlyphPalette;
      }
      return GlyphPalette;
    case 'EditorCanvas':
      if (!EditorCanvas) {
        const module = await import("@/components/EditorCanvas");
        EditorCanvas = module.EditorCanvas;
      }
      return EditorCanvas;
    case 'PropertiesPanel':
      if (!PropertiesPanel) {
        const module = await import("@/components/PropertiesPanel");
        PropertiesPanel = module.PropertiesPanel;
      }
      return PropertiesPanel;
    case 'PerformanceStats':
      if (!PerformanceStats) {
        const module = await import("@/components/PerformanceStats");
        PerformanceStats = module.PerformanceStats;
      }
      return PerformanceStats;
    default:
      return null;
  }
};

// Lightweight component wrapper
function LazyComponent({ name, fallback = null }: { name: string; fallback?: React.ReactNode }) {
  const [Component, setComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComponent(name).then((comp) => {
      setComponent(() => comp);
      setLoading(false);
    });
  }, [name]);

  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return Component ? <Component /> : null;
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
    
    // Register PWA after app is loaded
    setTimeout(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const { registerSW } = await import("virtual:pwa-register");
          registerSW({
            onNeedRefresh() {
              console.log("New content available, please refresh.");
            },
            onOfflineReady() {
              console.log("App ready to work offline.");
            },
          });
        } catch (e) {
          console.log("PWA registration failed:", e);
        }
      }
    }, 2000);
    
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
          <Toolbar 
            isMobile={isMobile}
            paletteNode={<LazyComponent name="GlyphPalette" />}
            propertiesNode={<LazyComponent name="PropertiesPanel" />}
          />
        </header>

        <div className="main-area flex flex-1 overflow-hidden relative">
          {/* Desktop Left Sidebar: Palette */}
          {!isMobile && (
            <aside className="palette-sidebar border-r border-border bg-card transition-all duration-300 shadow-sm z-30" style={{ width: "260px", flexShrink: 0 }}>
              <LazyComponent name="GlyphPalette" />
            </aside>
          )}

          {/* Center: Editor Content */}
          <main className="editor-main flex-1 overflow-hidden relative bg-[#f4ece1] h-full">
            <div className="canvas-bg h-full w-full overflow-auto scrollbar-thin">
              <LazyComponent name="EditorCanvas" />
            </div>
          </main>

          {/* Desktop Right Sidebar: Properties */}
          {!isMobile && (
            <aside className="props-sidebar border-l border-border bg-card transition-all duration-300 shadow-sm z-30" style={{ width: "240px", flexShrink: 0 }}>
              <LazyComponent name="PropertiesPanel" />
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
      <LazyComponent name="PerformanceStats" />
    </TooltipProvider>
  );
}

function App() {
  return <Editor />;
}

export default App;
