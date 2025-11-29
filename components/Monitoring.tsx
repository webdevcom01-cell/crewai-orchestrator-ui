import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { BarChart3, TrendingUp, Clock, Users, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRuns: number;
    successRate: number;
    avgExecutionTime: number;
    activeUsers: number;
  };
  runsByDay: Array<{ date: string; count: number; success: number; failed: number }>;
  topAgents: Array<{ name: string; runs: number; successRate: number }>;
  performance: Array<{ name: string; avgTime: number; minTime: number; maxTime: number }>;
  errors: Array<{ message: string; count: number; lastOccurred: string }>;
}

interface MonitoringProps {
  workspaceId: string;
}

// 3D Hover effect helper
const apply3DHover = (e: React.MouseEvent<HTMLElement>, intensity: number = 5) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = (e.clientX - centerX) / (rect.width / 2);
  const deltaY = (e.clientY - centerY) / (rect.height / 2);
  
  e.currentTarget.style.transform = `perspective(1000px) rotateX(${deltaY * -intensity}deg) rotateY(${deltaX * intensity}deg) translateY(-4px) scale(1.02)`;
};

const reset3DHover = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
};

export const Monitoring: React.FC<MonitoringProps> = ({ workspaceId }) => {
  const { hasPermission } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasPermission('workspace:read')) {
      loadAnalytics();
    }
  }, [workspaceId, timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/analytics?range=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPermission('workspace:read')) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        You do not have permission to view analytics
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No analytics data available
      </div>
    );
  }

  const metrics = [
    { label: 'Total Runs', value: analytics.overview.totalRuns.toLocaleString(), icon: Activity, color: 'cyan' },
    { label: 'Success Rate', value: `${analytics.overview.successRate.toFixed(1)}%`, icon: CheckCircle, color: 'emerald' },
    { label: 'Avg Execution', value: `${analytics.overview.avgExecutionTime.toFixed(2)}s`, icon: Clock, color: 'purple' },
    { label: 'Active Users', value: analytics.overview.activeUsers.toString(), icon: Users, color: 'yellow' },
  ];

  const maxCount = Math.max(...analytics.runsByDay.map((d) => d.count), 1);

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <BarChart3 size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics & Monitoring</h1>
            <p className="text-sm text-slate-400 font-mono">workspace.analytics.dashboard</p>
          </div>
        </div>
        
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
          className="px-4 py-2.5 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div 
            key={metric.label}
            className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/5 border border-cyan-500/20 backdrop-blur-sm"
            style={{ 
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
            onMouseMove={(e) => apply3DHover(e)}
            onMouseLeave={reset3DHover}
          >
            <div className="flex items-center gap-3 mb-3">
              <metric.icon size={18} className="text-cyan-400" />
              <span className="text-sm text-slate-400">{metric.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runs Over Time */}
        <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            Runs Over Time
          </h3>
          <div className="flex items-end gap-2 h-48">
            {analytics.runsByDay.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center h-full">
                <div className="flex gap-0.5 items-end flex-1 w-full">
                  <div
                    className="flex-1 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t transition-all duration-300"
                    style={{ height: `${(day.success / maxCount) * 100}%`, minHeight: day.success > 0 ? '4px' : '0' }}
                    title={`Success: ${day.success}`}
                  />
                  <div
                    className="flex-1 bg-gradient-to-t from-red-500 to-pink-500 rounded-t transition-all duration-300"
                    style={{ height: `${(day.failed / maxCount) * 100}%`, minHeight: day.failed > 0 ? '4px' : '0' }}
                    title={`Failed: ${day.failed}`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-500 to-cyan-400" />
              <span className="text-xs text-slate-400">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-red-500 to-pink-500" />
              <span className="text-xs text-slate-400">Failed</span>
            </div>
          </div>
        </div>

        {/* Top Agents */}
        <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6">Top Performing Agents</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Agent</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Runs</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topAgents.map((agent) => (
                  <tr key={agent.name} className="border-b border-cyan-500/5">
                    <td className="py-3 text-sm text-white">{agent.name}</td>
                    <td className="py-3 text-sm text-slate-300">{agent.runs}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                            style={{ width: `${agent.successRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-12">{agent.successRate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" />
            Performance Metrics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Workflow</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Avg</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Min</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Max</th>
                </tr>
              </thead>
              <tbody>
                {analytics.performance.map((perf) => (
                  <tr key={perf.name} className="border-b border-cyan-500/5">
                    <td className="py-3 text-sm text-white">{perf.name}</td>
                    <td className="py-3 text-sm text-cyan-400 font-mono">{perf.avgTime.toFixed(2)}s</td>
                    <td className="py-3 text-sm text-emerald-400 font-mono">{perf.minTime.toFixed(2)}s</td>
                    <td className="py-3 text-sm text-orange-400 font-mono">{perf.maxTime.toFixed(2)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            Recent Errors
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Error</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Count</th>
                  <th className="text-left py-3 text-sm font-medium text-slate-400">Last</th>
                </tr>
              </thead>
              <tbody>
                {analytics.errors.map((error, idx) => (
                  <tr key={idx} className="border-b border-cyan-500/5">
                    <td className="py-3 text-sm text-red-400 font-mono max-w-[200px] truncate">{error.message}</td>
                    <td className="py-3 text-sm text-slate-300">{error.count}</td>
                    <td className="py-3 text-sm text-slate-400">{new Date(error.lastOccurred).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
