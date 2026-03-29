/**
 * glyphLoader.ts
 * Fetches real JSesh SVG files from /glyphs/{id}.svg on demand.
 * Caches parsed content in memory for the session.
 * 
 * The JSesh SVGs have two formats:
 *  - Some use mm-unit coords (width='16.1' height='17.78') 
 *  - Some use 1800px coords (width='1800px' height='1800px')
 * 
 * We use the SVG as a standalone file via <img> or <image xlink:href>
 * so no coordinate normalization is needed in the loader.
 * The SVG's own internal viewBox makes it self-rendering.
 */

interface GlyphCache {
  content: string;        // Full raw SVG string
  viewBox: string;        // Extracted viewBox
  width: number;          // Natural width (px equiv)
  height: number;         // Natural height (px equiv)
  aspectRatio: number;    // width/height
}

const cache = new Map<string, GlyphCache>();
const pending = new Map<string, Promise<GlyphCache>>();

/** Extract viewBox or derive one from width/height attributes */
function extractMeta(svgText: string): Omit<GlyphCache, "content"> {
  const vbMatch = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  const wMatch  = svgText.match(/width\s*=\s*["']([\d.]+)[^"']*["']/i);
  const hMatch  = svgText.match(/height\s*=\s*["']([\d.]+)[^"']*["']/i);

  const w = wMatch  ? parseFloat(wMatch[1])  : 1800;
  const h = hMatch  ? parseFloat(hMatch[1])  : 1800;

  let viewBox = vbMatch ? vbMatch[1] : `0 0 ${w} ${h}`;

  return {
    viewBox,
    width:  w,
    height: h,
    aspectRatio: w / (h || 1),
  };
}

/** Load a single glyph SVG by id, with deduplication of in-flight requests */
export async function loadGlyph(id: string): Promise<GlyphCache> {
  if (cache.has(id)) return cache.get(id)!;

  if (pending.has(id)) return pending.get(id)!;

  const promise = (async () => {
    try {
      const res = await fetch(`/jseshGlyphs/${id}.svg`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const meta = extractMeta(text);
      const entry: GlyphCache = { content: text, ...meta };
      cache.set(id, entry);
      return entry;
    } catch (e) {
      // Fallback: return a placeholder crossed-box SVG
      const fallback: GlyphCache = {
        content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="#b45309" stroke-width="4" rx="8"/>
          <line x1="15" y1="15" x2="85" y2="85" stroke="#b45309" stroke-width="3"/>
          <line x1="85" y1="15" x2="15" y2="85" stroke="#b45309" stroke-width="3"/>
          <text x="50" y="96" font-size="18" text-anchor="middle" fill="#b45309" font-family="monospace">${id}</text>
        </svg>`,
        viewBox: "0 0 100 100",
        width: 100,
        height: 100,
        aspectRatio: 1,
      };
      cache.set(id, fallback);
      return fallback;
    } finally {
      pending.delete(id);
    }
  })();

  pending.set(id, promise);
  return promise;
}

/** Preload a batch of glyphs (fire and forget) */
export function preloadGlyphs(ids: string[]): void {
  ids.forEach((id) => {
    if (!cache.has(id) && !pending.has(id)) {
      loadGlyph(id).catch(() => {/* silently ignore */});
    }
  });
}

/** Get cached glyph synchronously (null if not loaded yet) */
export function getCachedGlyph(id: string): GlyphCache | null {
  return cache.get(id) ?? null;
}

/** Get the public URL for a glyph SVG file (for use in <img src> or <image href>) */
export function getGlyphUrl(id: string): string {
  return `/jseshGlyphs/${id}.svg`;
}

export type { GlyphCache };
