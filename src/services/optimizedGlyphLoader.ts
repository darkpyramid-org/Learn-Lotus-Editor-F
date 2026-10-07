/**
 * optimizedGlyphLoader.ts
 * Ultra-fast native SVG loader eliminating artificial queue bottlenecks
 */

import { performanceMonitor } from "./performanceMonitor";

interface GlyphCache {
  content: string;
  viewBox: string;
  width: number;
  height: number;
  aspectRatio: number;
  lastUsed: number;
  /** True when this entry is a local placeholder for a failed request (never cached). */
  isFallback?: boolean;
}

interface LoadingState {
  loading: Set<string>;
  pending: Map<string, Promise<GlyphCache>>;
  cache: Map<string, GlyphCache>;
  preloadQueue: string[];
  maxCacheSize: number;
  priorityGlyphs: Set<string>;
}

const state: LoadingState = {
  loading: new Set(),
  pending: new Map(),
  cache: new Map(),
  preloadQueue: [],
  maxCacheSize: 200, 
  priorityGlyphs: new Set(['A1', 'G17', 'N35', 'M17', 'D21', 'I9', 'G1', 'F35']),
};

function extractMeta(svgText: string): Omit<GlyphCache, "content" | "lastUsed"> {
  const vbMatch = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  const wMatch = svgText.match(/width\s*=\s*["']([\d.]+)[^"']*["']/i);
  const hMatch = svgText.match(/height\s*=\s*["']([\d.]+)[^"']*["']/i);

  const w = wMatch ? parseFloat(wMatch[1]) : 1800;
  const h = hMatch ? parseFloat(hMatch[1]) : 1800;
  const viewBox = vbMatch ? vbMatch[1] : `0 0 ${w} ${h}`;

  return { viewBox, width: w, height: h, aspectRatio: w / (h || 1) };
}

function createFallbackGlyph(id: string): GlyphCache {
  return {
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="5" y="5" width="90" height="90" fill="none" stroke="#b45309" stroke-width="4" rx="8"/>
      <line x1="15" y1="15" x2="85" y2="85" stroke="#b45309" stroke-width="3"/>
      <line x1="85" y1="15" x2="15" y2="85" stroke="#b45309" stroke-width="3"/>
      <text x="50" y="96" font-size="18" text-anchor="middle" fill="#b45309" font-family="monospace">${id}</text>
    </svg>`,
    viewBox: "0 0 100 100", width: 100, height: 100, aspectRatio: 1, lastUsed: Date.now(), isFallback: true,
  };
}

async function loadSingleGlyph(id: string): Promise<GlyphCache> {
  const startTime = performance.now();
  performanceMonitor.recordIndividualRequest();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch(`/jseshGlyphs/${id}.svg`, {
      signal: controller.signal,
      cache: 'force-cache'
    });
    
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const text = await res.text();
    const meta = extractMeta(text);
    const loadTime = performance.now() - startTime;
    performanceMonitor.recordCacheMiss(loadTime);
    
    return { content: text, ...meta, lastUsed: Date.now() };
  } catch (error) {
    const loadTime = performance.now() - startTime;
    performanceMonitor.recordCacheMiss(loadTime);
    return createFallbackGlyph(id);
  }
}

function evictLRU(): void {
  if (state.cache.size <= state.maxCacheSize) return;

  const entries = Array.from(state.cache.entries());
  entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
  
  const toRemove = Math.floor(entries.length * 0.3);
  for (let i = 0; i < toRemove; i++) {
    state.cache.delete(entries[i][0]);
  }
}

/** Load a glyph without arbitrary batch queues. Use native browser concurrency safely. */
export function loadGlyph(id: string): Promise<GlyphCache> {
  if (state.cache.has(id)) {
    const cached = state.cache.get(id)!;
    cached.lastUsed = Date.now();
    return Promise.resolve(cached);
  }

  if (state.pending.has(id)) {
    return state.pending.get(id)!;
  }

  state.loading.add(id);
  
  const promise = loadSingleGlyph(id).then(glyph => {
    // Never cache fallback placeholders – a transient failure must not
    // permanently shadow the real glyph for the rest of the session.
    if (!glyph.isFallback) {
      state.cache.set(id, glyph);
    }
    state.pending.delete(id);
    state.loading.delete(id);
    evictLRU();
    return glyph;
  });

  state.pending.set(id, promise);
  return promise;
}

export function preloadPriorityGlyphs(): void {
  Array.from(state.priorityGlyphs).forEach(id => loadGlyph(id).catch(() => {}));
}

export function preloadGlyphs(ids: string[]): void {
  ids.forEach(id => loadGlyph(id).catch(() => {}));
}

export function getCachedGlyph(id: string): GlyphCache | null {
  const cached = state.cache.get(id);
  if (cached) {
    cached.lastUsed = Date.now();
    performanceMonitor.recordCacheHit();
    return cached;
  }
  return null;
}

export function getGlyphUrl(id: string): string {
  return `/jseshGlyphs/${id}.svg`;
}

export function clearCache(): void {
  state.cache.clear();
  state.pending.clear();
  state.loading.clear();
  state.preloadQueue.length = 0;
}

export function getCacheStats() {
  return {
    cacheSize: state.cache.size,
    pendingLoads: state.pending.size,
    maxCacheSize: state.maxCacheSize,
    performance: performanceMonitor.getMetrics(),
  };
}

export type { GlyphCache };