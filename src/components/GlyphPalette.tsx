import { useState, useMemo, useCallback } from "react";
import { GLYPH_DATASET, CATEGORIES } from "@/data/glyphs";
import { useEditorStore } from "@/store/editorStore";
import { GlyphDef } from "@/types/editor";
import { getGlyphUrl } from "@/services/glyphLoader";
import { Search, X, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function GlyphPalette() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const addGlyph = useEditorStore((s) => s.addGlyph);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return GLYPH_DATASET.filter((g) => {
      const matchCat = category === "All" || g.category === category;
      const matchSearch = !q || g.id.toLowerCase().includes(q) || g.label.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, category]);

  const clearSearch = useCallback(() => setSearch(""), []);

  return (
    <div className="palette-panel flex flex-col h-full bg-card">
      {/* Search Header */}
      <div className="px-4 pt-4 pb-2 space-y-3">
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

      {/* Tabs with Horizontal Scroll */}
      <Tabs defaultValue="All" value={category} onValueChange={setCategory} className="w-full">
        <div className="px-2 border-b border-border">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="bg-transparent h-9 w-max flex px-2 gap-1 pb-2">
              {["All", ...CATEGORIES].map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="rounded-full text-[10px] h-6 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase transition-all"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-170px)]">
            <div className="p-3 grid grid-cols-2 lg:grid-cols-3 gap-2">
              {filtered.map((glyph) => (
                <GlyphCard key={glyph.id} glyph={glyph} onAdd={addGlyph} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <div className="text-4xl mb-3">𓇌</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">No matching signs</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </Tabs>
      
      <div className="mt-auto px-4 py-2 border-t border-border bg-muted/20">
        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          {filtered.length} Signs {category !== "All" && `in ${category}`}
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
