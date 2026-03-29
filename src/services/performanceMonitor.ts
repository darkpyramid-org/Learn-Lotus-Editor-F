/**
 * performanceMonitor.ts
 * Simple performance monitoring for SVG loading optimization
 */

interface PerformanceMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTime: number;
  batchedRequests: number;
  individualRequests: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageLoadTime: 0,
    batchedRequests: 0,
    individualRequests: 0,
  };

  private loadTimes: number[] = [];

  recordCacheHit(): void {
    this.metrics.totalRequests++;
    this.metrics.cacheHits++;
  }

  recordCacheMiss(loadTime: number): void {
    this.metrics.totalRequests++;
    this.metrics.cacheMisses++;
    this.loadTimes.push(loadTime);
    this.updateAverageLoadTime();
  }

  recordBatchRequest(count: number): void {
    this.metrics.batchedRequests += count;
  }

  recordIndividualRequest(): void {
    this.metrics.individualRequests++;
  }

  private updateAverageLoadTime(): void {
    if (this.loadTimes.length > 0) {
      const sum = this.loadTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageLoadTime = sum / this.loadTimes.length;
    }
  }

  getMetrics(): PerformanceMetrics & { cacheHitRate: number } {
    const cacheHitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100 
      : 0;

    return {
      ...this.metrics,
      cacheHitRate,
    };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLoadTime: 0,
      batchedRequests: 0,
      individualRequests: 0,
    };
    this.loadTimes = [];
  }

  logStats(): void {
    const stats = this.getMetrics();
    console.group('🚀 SVG Loading Performance Stats');
    console.log(`Total Requests: ${stats.totalRequests}`);
    console.log(`Cache Hit Rate: ${stats.cacheHitRate.toFixed(1)}%`);
    console.log(`Average Load Time: ${stats.averageLoadTime.toFixed(2)}ms`);
    console.log(`Batched vs Individual: ${stats.batchedRequests} vs ${stats.individualRequests}`);
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();