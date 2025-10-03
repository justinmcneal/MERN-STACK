/**
 * Performance utilities for optimization
 */

/**
 * Debounce function to limit calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

/**
 * Throttle function to limit execution frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): ((...args: Parameters<T>) => void) => {
  const { leading = true, trailing = true } = options;
  let lastCallTime = 0;
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();

    if (leading && now - lastCallTime >= limit) {
      func(...args);
      lastCallTime = now;
    }

    if (trailing && !timeout) {
      timeout = window.setTimeout(() => {
        if (now - lastCallTime >= limit) {
          func(...args);
          lastCallTime = now;
        }
        timeout = null;
      }, limit - (now - lastCallTime));
    }
  };
};

/**
 * Memoize function results
 */
export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) return cache.get(key);
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

/**
 * Create a virtual scrolling hook for large lists
 */
export const createVirtualScrollHooks = (
  itemHeight: number,
  containerHeight: number
) => {
  return {
    getVisibleRange: (scrollTop: number, itemCount: number) => {
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        start + Math.ceil(containerHeight / itemHeight) + 1,
        itemCount
      );
      
      return { start, end };
    },
    
    getTotalHeight: (itemCount: number) => itemCount * itemHeight,
    
    getOffsetTop: (index: number) => index * itemHeight,
  };
};

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates: (() => void)[]): void => {
  // Use requestAnimationFrame for optimal performance
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

/**
 * Image lazy loading utility
 */
export const createLazyImageObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Performance monitoring utility
 */
export const createPerformanceTimer = (label: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
      return duration;
    },
    
    checkpoint: (checkpointName: string) => {
      const checkpoint = performance.now();
      const duration = checkpoint - start;
      console.log(`📍 ${label} - ${checkpointName}: ${duration.toFixed(2)}ms`);
    },
  };
};

/**
 * Bundle size optimization helpers
 */
export const preloadComponent = (componentName: string) => {
  return import(`../components/${componentName}`).catch((error) => {
    console.warn(`Failed to preload component ${componentName}:`, error);
  });
};

/**
 * Optimize JSON serialization
 */
export const optimizedJSON = {
  parse: <T>(json: string): T | null => {
    try {
      return JSON.parse(json) as T;
    } catch (error) {
      console.warn('JSON parse error:', error);
      return null;
    }
  },
  
  stringify: (obj: any, replacer?: any, space?: string | number): string => {
    try {
      return JSON.stringify(obj, replacer, space);
    } catch (error) {
      console.warn('JSON stringify error:', error);
      return '{}';
    }
  },
};

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = (): {
  used: number;
  total: number;
  formatted: string;
} | null => {
  const memory = (performance as any).memory;
  
  if (!memory) return null;
  
  const used = memory.usedJSHeapSize;
  const total = memory.totalJSHeapSize;
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  return {
    used,
    total,
    formatted: `${formatBytes(used)} / ${formatBytes(total)}`,
  };
};
