/**
 * optimizedGlyphLoader.ts
 * Ultra-fast SVG loading with aggressive optimizations for initial load
 */

import { performanceMonitor } from "./performanceMonitor";

interface GlyphCache {
  content: string;
  viewBox: string;
  width: number;
  height: number;
  aspectRatio: number;
  lastUsed: number;
}

interface LoadingState {
  loading: Set<string>;
  pending: Map<string, Promise<GlyphCache>>;
  cache: Map<string, GlyphCache>;
  preloadQueue: string[];
  batchSize: number;
  maxCacheSize: number;
  priorityGlyphs: Set<string>;
}

const state: LoadingState = {
  loading: new Set(),
  pending: new Map(),
  cache: new Map(),
  preloadQueue: [],
  batchSize: 15, // Increased batch size for faster loading
  maxCacheSize: 100, // Reduced cache size for faster initial load
  priorityGlyphs: new Set(['A1', 'G17', 'N35', 'M17', 'D21', 'I9', 'G1', 'F35']), // Most common glyphs
};

/** Extract metadata from SVG content */
function extractMeta(svgText: string): Omit<GlyphCache, "content" | "lastUsed"> {
  const vbMatch = svgText.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  const wMatch = svgText.match(/width\s*=\s*["']([\d.]+)[^"']*["']/i);
  const hMatch = svgText.match(/height\s*=\s*["']([\d.]+)[^"']*["']/i);

  const w = wMatch ? parseFloat(wMatch[1]) : 1800;
  const h = hMatch ? parseFloat(hMatch[1]) : 1800;
  const viewBox = vbMatch ? vbMatch[1] : `0 0 ${w} ${h}`;

  return {
    viewBox,
    width: w,
    height: h,
    aspectRatio: w / (h || 1),
  };
}

/** Create fallback SVG for failed loads */
function createFallbackGlyph(id: string): GlyphCache {
  return {
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
    lastUsed: Date.now(),
  };
}

/** Load a single glyph with error handling and timeout */
async function loadSingleGlyph(id: string): Promise<GlyphCache> {
  const startTime = performance.now();
  performanceMonitor.recordIndividualRequest();
  
  try {
    // Add timeout for faster failure handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    const res = await fetch(`/jseshGlyphs/${id}.svg`, {
      signal: controller.signal,
      cache: 'force-cache' // Aggressive caching
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const text = await res.text();
    const meta = extractMeta(text);
    
    const loadTime = performance.now() - startTime;
    performanceMonitor.recordCacheMiss(loadTime);
    
    return {
      content: text,
      ...meta,
      lastUsed: Date.now(),
    };
  } catch (error) {
    const loadTime = performance.now() - startTime;
    performanceMonitor.recordCacheMiss(loadTime);
    return createFallbackGlyph(id);
  }
}

/** Load multiple glyphs in parallel batch with priority handling */
async function loadGlyphBatch(ids: string[]): Promise<Map<string, GlyphCache>> {
  const results = new Map<string, GlyphCache>();
  performanceMonitor.recordBatchRequest(ids.length);
  
  // Sort by priority (priority glyphs first)
  const sortedIds = ids.sort((a, b) => {
    const aPriority = state.priorityGlyphs.has(a) ? 0 : 1;
    const bPriority = state.priorityGlyphs.has(b) ? 0 : 1;
    return aPriority - bPriority;
  });
  
  // Load all glyphs in parallel
  const promises = sortedIds.map(async (id) => {
    const glyph = await loadSingleGlyph(id);
    results.set(id, glyph);
    return { id, glyph };
  });

  await Promise.allSettled(promises);
  return results;
}

/** Manage cache size by removing least recently used items */
function evictLRU(): void {
  if (state.cache.size <= state.maxCacheSize) return;

  const entries = Array.from(state.cache.entries());
  entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
  
  // Remove oldest 30% of entries for more aggressive cleanup
  const toRemove = Math.floor(entries.length * 0.3);
  for (let i = 0; i < toRemove; i++) {
    state.cache.delete(entries[i][0]);
  }
}

/** Load a glyph with intelligent batching and caching */
export async function loadGlyph(id: string): Promise<GlyphCache> {
  // Return cached glyph if available
  if (state.cache.has(id)) {
    const cached = state.cache.get(id)!;
    cached.lastUsed = Date.now();
    return cached;
  }

  // Return pending promise if already loading
  if (state.pending.has(id)) {
    return state.pending.get(id)!;
  }

  // Add to batch loading queue
  if (!state.loading.has(id)) {
    state.preloadQueue.push(id);
    state.loading.add(id);
  }

  // Create promise for this glyph
  const promise = new Promise<GlyphCache>((resolve) => {
    // Process batch when queue is full or after short delay
    const processBatch = async () => {
      if (state.preloadQueue.length === 0) return;
      
      const batch = state.preloadQueue.splice(0, state.batchSize);
      const results = await loadGlyphBatch(batch);
      
      // Update cache and resolve promises
      for (const [glyphId, glyph] of results) {
        state.cache.set(glyphId, glyph);
        state.loading.delete(glyphId);
        
        if (glyphId === id) {
          resolve(glyph);
        }
      }
      
      // Clean up pending promises
      batch.forEach(batchId => state.pending.delete(batchId));
      
      // Manage cache size
      evictLRU();
    };

    // Process immediately if batch is full, otherwise wait briefly for more requests
    if (state.preloadQueue.length >= state.batchSize) {
      processBatch();
    } else {
      setTimeout(processBatch, 25); // Reduced delay for faster response
    }
  });

  state.pending.set(id, promise);
  return promise;
}

/** Preload priority glyphs immediately on app start */
export function preloadPriorityGlyphs(): void {
  const priorityIds = Array.from(state.priorityGlyphs);
  preloadGlyphs(priorityIds);
}

/** Preload a list of glyphs (fire and forget) */
export function preloadGlyphs(ids: string[]): void {
  const uncachedIds = ids.filter(id => 
    !state.cache.has(id) && 
    !state.pending.has(id) && 
    !state.loading.has(id)
  );

  uncachedIds.forEach(id => {
    state.preloadQueue.push(id);
    state.loading.add(id);
  });

  // Process batches immediately for preloading
  const processBatches = async () => {
    while (state.preloadQueue.length > 0) {
      const batch = state.preloadQueue.splice(0, state.batchSize);
      const results = await loadGlyphBatch(batch);
      
      for (const [id, glyph] of results) {
        state.cache.set(id, glyph);
        state.loading.delete(id);
      }
      
      evictLRU();
    }
  };

  processBatches().catch(console.warn);
}

/** Get cached glyph synchronously */
export function getCachedGlyph(id: string): GlyphCache | null {
  const cached = state.cache.get(id);
  if (cached) {
    cached.lastUsed = Date.now();
    performanceMonitor.recordCacheHit();
    return cached;
  }
  return null;
}

/** Get glyph URL for direct image loading */
export function getGlyphUrl(id: string): string {
  return `/jseshGlyphs/${id}.svg`;
}

/** Clear cache and reset state */
export function clearCache(): void {
  state.cache.clear();
  state.pending.clear();
  state.loading.clear();
  state.preloadQueue.length = 0;
}

/** Get cache statistics */
export function getCacheStats() {
  return {
    cacheSize: state.cache.size,
    pendingLoads: state.pending.size,
    queueSize: state.preloadQueue.length,
    maxCacheSize: state.maxCacheSize,
    performance: performanceMonitor.getMetrics(),
  };
}

export type { GlyphCache };