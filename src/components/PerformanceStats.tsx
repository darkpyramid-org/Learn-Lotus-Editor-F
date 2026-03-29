import { useState, useEffect } from "react";
import { getCacheStats } from "@/services/optimizedGlyphLoader";
import { performanceMonitor } from "@/services/performanceMonitor";

export function PerformanceStats() {
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const cacheStats = getCacheStats();
      setStats(cacheStats);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show stats after 3 seconds to avoid cluttering initial load
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!stats || !isVisible) return null;

  const hitRate = stats.performance?.cacheHitRate || 0;
  const avgLoadTime = stats.performance?.averageLoadTime || 0;
  const totalRequests = stats.performance?.totalRequests || 0;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-50 max-w-xs">
      <div className="font-bold mb-2 text-green-400">⚡ Performance Stats</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Cache Hit Rate:</span>
          <span className={hitRate > 80 ? 'text-green-400' : hitRate > 50 ? 'text-yellow-400' : 'text-red-400'}>
            {hitRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cached Glyphs:</span>
          <span className="text-blue-400">{stats.cacheSize}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Requests:</span>
          <span className="text-cyan-400">{totalRequests}</span>
        </div>
        <div className="flex justify-between">
          <span>Avg Load Time:</span>
          <span className="text-purple-400">{avgLoadTime.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>Pending:</span>
          <span className="text-orange-400">{stats.pendingLoads}</span>
        </div>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-2 text-gray-400 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}