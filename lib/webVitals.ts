/**
 * Performance Monitoring with Web Vitals
 * Tracks Core Web Vitals and custom metrics
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';
import { captureMessage, addBreadcrumb } from './sentry';

// Thresholds for Web Vitals (based on Google's recommendations)
const THRESHOLDS = {
  // Largest Contentful Paint
  LCP: { good: 2500, needsImprovement: 4000 },
  // Cumulative Layout Shift
  CLS: { good: 0.1, needsImprovement: 0.25 },
  // First Contentful Paint
  FCP: { good: 1800, needsImprovement: 3000 },
  // Time to First Byte
  TTFB: { good: 800, needsImprovement: 1800 },
  // Interaction to Next Paint (replaced FID)
  INP: { good: 200, needsImprovement: 500 },
};

type MetricName = keyof typeof THRESHOLDS;

/**
 * Get rating for a metric
 */
const getMetricRating = (
  name: MetricName,
  value: number
): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name];
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

/**
 * Storage for metrics
 */
const metricsStorage: Partial<Record<MetricName, Metric>> = {};

/**
 * Get stored metrics
 */
export const getStoredMetrics = (): Partial<Record<MetricName, Metric>> => {
  return { ...metricsStorage };
};

/**
 * Handle metric reporting
 */
const handleMetric = (metric: Metric): void => {
  const { name, value, id, delta, rating } = metric;
  
  // Store metric
  metricsStorage[name as MetricName] = metric;

  // Add breadcrumb for Sentry
  addBreadcrumb(
    `Web Vital: ${name}`,
    'performance',
    {
      value: Math.round(value),
      delta: Math.round(delta),
      rating,
      id,
    },
    rating === 'good' ? 'info' : rating === 'needs-improvement' ? 'warning' : 'error'
  );

  // Log in development
  if (import.meta.env.DEV) {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} ${name}: ${Math.round(value)}ms (${rating})`);
  }

  // Report poor metrics to Sentry
  if (rating === 'poor') {
    captureMessage(
      `Poor Web Vital: ${name}`,
      'warning',
      {
        metric: name,
        value: Math.round(value),
        threshold: THRESHOLDS[name as MetricName],
        url: window.location.href,
      }
    );
  }

  // Send to analytics if configured
  sendToAnalytics(metric);
};

/**
 * Send metrics to analytics endpoint
 */
const sendToAnalytics = (metric: Metric): void => {
  const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  
  if (!analyticsEndpoint) return;

  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    timestamp: Date.now(),
  });

  // Use sendBeacon for reliable delivery
  if (navigator.sendBeacon) {
    navigator.sendBeacon(analyticsEndpoint, body);
  } else {
    fetch(analyticsEndpoint, {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(console.error);
  }
};

/**
 * Initialize Web Vitals monitoring
 */
export const initWebVitals = (): void => {
  // Core Web Vitals (INP replaced FID in 2024)
  onLCP(handleMetric);
  onINP(handleMetric);
  onCLS(handleMetric);
  onINP(handleMetric);
  
  // Additional metrics
  onFCP(handleMetric);
  onTTFB(handleMetric);

  console.log('[WebVitals] Monitoring initialized');
};

/**
 * Custom performance measurement
 */
export const measurePerformance = (
  name: string,
  startMark: string,
  endMark?: string
): number | null => {
  try {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }

    const entries = performance.getEntriesByName(name, 'measure');
    const entry = entries[entries.length - 1];
    
    if (entry) {
      addBreadcrumb(
        `Performance: ${name}`,
        'performance',
        { duration: Math.round(entry.duration) },
        'info'
      );
      
      return entry.duration;
    }
  } catch (error) {
    console.error(`Error measuring performance for ${name}:`, error);
  }
  
  return null;
};

/**
 * Start a performance mark
 */
export const markStart = (name: string): void => {
  performance.mark(`${name}-start`);
};

/**
 * End a performance mark and measure
 */
export const markEnd = (name: string): number | null => {
  performance.mark(`${name}-end`);
  return measurePerformance(name, `${name}-start`, `${name}-end`);
};

/**
 * Track component render time
 */
export const trackComponentRender = (
  componentName: string,
  duration: number
): void => {
  if (duration > 16) { // More than one frame
    addBreadcrumb(
      `Slow render: ${componentName}`,
      'performance',
      { duration: Math.round(duration) },
      duration > 100 ? 'warning' : 'info'
    );
  }

  if (import.meta.env.DEV && duration > 50) {
    console.warn(`⚠️ Slow render: ${componentName} took ${Math.round(duration)}ms`);
  }
};

/**
 * Track API call duration
 */
export const trackApiCall = (
  endpoint: string,
  method: string,
  duration: number,
  status: number
): void => {
  const isError = status >= 400;
  const isSlow = duration > 1000;

  addBreadcrumb(
    `API: ${method} ${endpoint}`,
    'api',
    {
      duration: Math.round(duration),
      status,
    },
    isError ? 'error' : isSlow ? 'warning' : 'info'
  );

  if (import.meta.env.DEV) {
    const emoji = isError ? '❌' : isSlow ? '🐌' : '✅';
    console.log(`${emoji} API ${method} ${endpoint}: ${Math.round(duration)}ms (${status})`);
  }
};

/**
 * Performance observer for long tasks
 */
export const observeLongTasks = (): (() => void) => {
  if (!('PerformanceObserver' in window)) {
    return () => {};
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          addBreadcrumb(
            'Long Task Detected',
            'performance',
            {
              duration: Math.round(entry.duration),
              startTime: Math.round(entry.startTime),
            },
            entry.duration > 100 ? 'warning' : 'info'
          );

          if (import.meta.env.DEV) {
            console.warn(`⚠️ Long Task: ${Math.round(entry.duration)}ms`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  } catch (error) {
    console.error('Error setting up long task observer:', error);
    return () => {};
  }
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = (): {
  metrics: Partial<Record<MetricName, { value: number; rating: string }>>;
  score: number;
} => {
  const metrics: Partial<Record<MetricName, { value: number; rating: string }>> = {};
  let totalScore = 0;
  let metricCount = 0;

  Object.entries(metricsStorage).forEach(([name, metric]) => {
    if (metric) {
      const rating = getMetricRating(name as MetricName, metric.value);
      metrics[name as MetricName] = {
        value: Math.round(metric.value),
        rating,
      };
      
      // Score: good = 100, needs-improvement = 50, poor = 0
      totalScore += rating === 'good' ? 100 : rating === 'needs-improvement' ? 50 : 0;
      metricCount++;
    }
  });

  return {
    metrics,
    score: metricCount > 0 ? Math.round(totalScore / metricCount) : 0,
  };
};

export default {
  initWebVitals,
  measurePerformance,
  markStart,
  markEnd,
  trackComponentRender,
  trackApiCall,
  observeLongTasks,
  getPerformanceSummary,
  getStoredMetrics,
};
