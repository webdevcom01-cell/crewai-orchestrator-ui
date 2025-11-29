/**
 * Performance Monitor Component
 * Displays real-time performance metrics in development
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getPerformanceSummary, getStoredMetrics } from '../../lib/webVitals';

interface PerformanceMonitorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showInProduction?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  position = 'bottom-right',
  showInProduction = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<ReturnType<typeof getPerformanceSummary> | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [memory, setMemory] = useState<{ used: number; total: number } | null>(null);

  // Don't render in production unless explicitly enabled
  if (import.meta.env.PROD && !showInProduction) {
    return null;
  }

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getPerformanceSummary());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  // FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const countFrames = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round(frameCount * 1000 / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(countFrames);
    };

    animationId = requestAnimationFrame(countFrames);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Memory usage (Chrome only)
  useEffect(() => {
    const updateMemory = () => {
      const perf = performance as any;
      if (perf.memory) {
        setMemory({
          used: Math.round(perf.memory.usedJSHeapSize / 1048576),
          total: Math.round(perf.memory.totalJSHeapSize / 1048576),
        });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, []);

  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRatingColor = (rating: string): string => {
    if (rating === 'good') return 'text-green-400';
    if (rating === 'needs-improvement') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getFpsColor = (fps: number): string => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`fixed ${positions[position]} z-[9999] font-mono text-xs`}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 flex items-center gap-3 hover:bg-slate-800 transition-colors"
          aria-label="Expand performance monitor"
        >
          <span className={getFpsColor(fps)}>{fps} FPS</span>
          {metrics && (
            <span className={getScoreColor(metrics.score)}>
              Score: {metrics.score}
            </span>
          )}
          <span className="text-slate-500">📊</span>
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 min-w-[280px] shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
            <span className="text-slate-300 font-semibold">Performance Monitor</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="Collapse performance monitor"
            >
              ✕
            </button>
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500 text-[10px] uppercase">FPS</div>
              <div className={`text-lg font-bold ${getFpsColor(fps)}`}>{fps}</div>
            </div>
            
            {memory && (
              <div className="bg-slate-800 rounded p-2">
                <div className="text-slate-500 text-[10px] uppercase">Memory</div>
                <div className="text-lg font-bold text-blue-400">
                  {memory.used}MB
                </div>
              </div>
            )}
          </div>

          {/* Performance Score */}
          {metrics && (
            <>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Performance Score</span>
                  <span className={`font-bold ${getScoreColor(metrics.score)}`}>
                    {metrics.score}/100
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      metrics.score >= 90
                        ? 'bg-green-500'
                        : metrics.score >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.score}%` }}
                  />
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="space-y-1">
                <div className="text-slate-400 text-[10px] uppercase mb-1">
                  Core Web Vitals
                </div>
                
                {Object.entries(metrics.metrics).map(([name, data]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between py-1 border-b border-slate-800 last:border-0"
                  >
                    <span className="text-slate-300">{name}</span>
                    <span className={getRatingColor(data?.rating || 'poor')}>
                      {data?.value}
                      {name === 'CLS' ? '' : 'ms'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-slate-700 text-slate-500 text-[10px]">
            Development Mode Only
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
