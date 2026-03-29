import { useState, useMemo, useCallback } from "react";
import { GLYPH_DATASET, CATEGORIES } from "@/data/glyphs";
import { useEditorStore } from "@/store/editorStore";
import { GlyphDef } from "@/types/editor";
import { getGlyphUrl } from "@/services/glyphLoader";
import { Search, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlyphPalette() {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const addGlyph = useEditorStore((s) => s.addGlyph);

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const groups: Record<string, GlyphDef[]> = {};
    
    GLYPH_DATASET.forEach(g => {
      const matchSearch = !q || g.id.toLowerCase().includes(q) || g.label.toLowerCase().includes(q);
      if (matchSearch) {
        if (!groups[g.category]) groups[g.category] = [];
        groups[g.category].push(g);
      }
    });

    return groups;
  }, [search]);

  const clearSearch = useCallback(() => setSearch(""), []);

  return (
    <div className="palette-panel flex flex-col h-full bg-card">
      {/* Search Header */}
      <div className="px-4 pt-4 pb-2 space-y-3 shrink-0">
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
          Hieroglyph Palette
        </h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search Gardiner ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/30 border-none ring-offset-background focus-visible:ring-1 focus-visible:ring-primary/30"
          />
          {search && (
            <button 
              onClick={clearSearch} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full custom-scrollbar">
          <div className="p-4 space-y-8">
            {Object.keys(grouped).length > 0 ? (
              Object.entries(grouped).map(([cat, glyphs]) => {
                const isExpanded = expandedCats[cat] || search.length > 0;
                const visibleGlyphs = isExpanded ? glyphs : glyphs.slice(0, 4);
                const hasMore = glyphs.length > 4;

                return (
                  <div key={cat} className="space-y-4">
                    <div 
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => toggleCat(cat)}
                    >
                      <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                        {cat}
                      </h3>
                      {hasMore && !search && (
                        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground/40 group-hover:text-primary transition-colors uppercase">
                          <span>{glyphs.length} signs</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {visibleGlyphs.map((glyph) => (
                        <GlyphCard key={glyph.id} glyph={glyph} onAdd={addGlyph} />
                      ))}
                    </div>

                    {hasMore && !isExpanded && !search && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCat(cat)}
                        className="w-full h-8 text-[9px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 border border-dashed border-primary/20 rounded-xl"
                      >
                        Show all signs
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <div className="text-4xl mb-3">𓇌</div>
                <p className="text-[10px] font-bold uppercase tracking-widest">No matching signs</p>
              </div>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      <div className="mt-auto px-4 py-2 border-t border-border bg-muted/20 shrink-0">
        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
           Signs categorized by Gardiner group
        </p>
      </div>
    </div>
  );
}

function GlyphCard({
  glyph,
  onAdd,
}: {
  glyph: GlyphDef;
  onAdd: (id: string) => void;
}) {
  const [imgStatus, setImgStatus] = useState<"loading" | "success" | "error">("loading");
  const url = getGlyphUrl(glyph.id);

  return (
    <Card 
      className="cursor-pointer group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 overflow-hidden"
      onClick={() => onAdd(glyph.id)}
    >
      <div className="flex flex-col items-center p-2 gap-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 rounded-xl">
        <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden rounded-lg bg-secondary/20 group-hover:bg-accent/40 transition-colors duration-300">
          {imgStatus === "loading" && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/30 absolute" />
          )}
          <img
            src={url}
            alt={glyph.label}
            onLoad={() => setImgStatus("success")}
            onError={() => setImgStatus("error")}
            className={cn(
              "w-full h-full object-contain p-1 transition-opacity duration-300",
              imgStatus === "success" ? "opacity-100" : "opacity-0"
            )}
            style={{ 
              filter: "brightness(0) saturate(100%) invert(30%) sepia(50%) saturate(600%) hue-rotate(10deg)" 
            }}
          />
          {imgStatus === "error" && (
            <div className="text-[10px] font-mono font-bold text-destructive/40">{glyph.id}</div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-foreground/80 group-hover:text-primary transition-colors">
            {glyph.id}
          </span>
          <span className="text-[8px] text-muted-foreground/70 leading-none text-center line-clamp-1 w-full font-medium">
            {glyph.label}
          </span>
        </div>
      </div>
    </Card>
  );
}
