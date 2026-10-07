import { useEffect, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { copyToClipboard, pasteFromClipboard } from "@/services/clipboardService";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Toolbar } from "@/components/Toolbar";

// Lazy-load heavy components only when needed
const loaders: Record<string, () => Promise<any>> = {
  GlyphPalette: () => import("@/components/GlyphPalette").then((m) => m.GlyphPalette),
  EditorCanvas: () => import("@/components/EditorCanvas").then((m) => m.EditorCanvas),
  PropertiesPanel: () => import("@/components/PropertiesPanel").then((m) => m.PropertiesPanel),
  GlyphLightbox: () => import("@/components/GlyphLightbox").then((m) => m.GlyphLightbox),
  PerformanceStats: () => import("@/components/PerformanceStats").then((m) => m.PerformanceStats),
};
const loaded: Record<string, any> = {};

function LazyComponent({ name, ...props }: { name: string; [key: string]: any }) {
  const [Component, setComponent] = useState<any>(() => loaded[name] ?? null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (loaded[name]) {
      setComponent(() => loaded[name]);
      return;
    }
    let mounted = true;
    loaders[name]()
      .then((comp) => {
        loaded[name] = comp;
        if (mounted) setComponent(() => comp);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err : new Error(String(err)));
      });
    return () => {
      mounted = false;
    };
  }, [name]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 gap-1 text-center">
        <p className="text-xs text-destructive font-bold uppercase tracking-widest">Failed to load</p>
        <p className="text-[10px] text-muted-foreground">{error.message}</p>
      </div>
    );
  }
  if (!Component) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  return <Component {...props} />;
}

export default function EditorPage() {
  const nodes = useEditorStore((s) => s.nodes);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const quadratSize = useEditorStore((s) => s.quadratSize);
  const zoom = useEditorStore((s) => s.zoom);
  const removeSelected = useEditorStore((s) => s.removeSelected);
  const addGlyph = useEditorStore((s) => s.addGlyph);
  const lightboxInstanceId = useEditorStore((s) => s.lightboxInstanceId);
  const setLightboxInstanceId = useEditorStore((s) => s.setLightboxInstanceId);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Register the PWA service worker in production builds only
    let timeout: number | undefined;
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      timeout = window.setTimeout(async () => {
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
          console.warn("PWA registration failed:", e);
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable;

      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "c" && !isEditable) {
        e.preventDefault();
        const selectedNodes = nodes.filter((n) => selectedIds.has(n.instanceId));
        const toCopy = selectedNodes.length > 0 ? selectedNodes : nodes;
        try {
          await copyToClipboard(toCopy, "wysiwyg", quadratSize);
          toast.success(`Copied ${toCopy.length} sign(s) to clipboard as Vector-SVG`);
        } catch {
          toast.error("Clipboard access failed");
        }
      }
      if (mod && key === "v" && !isEditable) {
        e.preventDefault();
        const parsed = await pasteFromClipboard();
        if (parsed.length > 0) {
          parsed.forEach((p) => addGlyph(p.glyphId, p.transform));
          toast.success(`Pasted ${parsed.length} sign(s) into editor`);
        } else {
          toast.info("No valid hieroglyphic data found on clipboard");
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !isEditable) {
        removeSelected();
      }
      if (e.key === "Escape" && !lightboxInstanceId) {
        useEditorStore.getState().deselectAll();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, selectedIds, removeSelected, addGlyph, quadratSize, lightboxInstanceId]);

  return (
    <TooltipProvider>
      <div className="app-shell h-screen w-screen flex flex-col overflow-hidden bg-background">
        {/* Top Navigation / Toolbar */}
        <header className="toolbar-area border-b border-border bg-card/80 backdrop-blur-md z-50 shrink-0 h-14 flex items-center px-4 relative">
          <Toolbar
            isMobile={isMobile}
            paletteNode={isMobile ? <LazyComponent name="GlyphPalette" /> : undefined}
            propertiesNode={isMobile ? <LazyComponent name="PropertiesPanel" /> : undefined}
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
            <div className="canvas-bg h-full w-full relative">
              <LazyComponent name="EditorCanvas" />
            </div>
          </main>

          {/* Desktop Right Sidebar: Properties */}
          {!isMobile && (
            <aside className="props-sidebar border-l border-border bg-card transition-all duration-300 shadow-sm z-30" style={{ width: "260px", flexShrink: 0 }}>
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
        <Toaster position="bottom-center" richColors />
        {/* Debug overlay: development only (it covered the status bar in production) */}
        {import.meta.env.DEV && <LazyComponent name="PerformanceStats" />}
        {lightboxInstanceId && (
          <LazyComponent
            name="GlyphLightbox"
            instanceId={lightboxInstanceId}
            onClose={() => setLightboxInstanceId(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}