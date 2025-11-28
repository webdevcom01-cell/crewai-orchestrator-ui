import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

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
    return <div>You do not have permission to view analytics</div>;
  }

  if (isLoading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="monitoring">
      <div className="header">
        <h2>Analytics & Monitoring</h2>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{analytics.overview.totalRuns.toLocaleString()}</div>
          <div className="metric-label">Total Runs</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.overview.successRate.toFixed(1)}%</div>
          <div className="metric-label">Success Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.overview.avgExecutionTime.toFixed(2)}s</div>
          <div className="metric-label">Avg Execution Time</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.overview.activeUsers}</div>
          <div className="metric-label">Active Users</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Runs Over Time</h3>
          <div className="chart">
            {analytics.runsByDay.map((day) => (
              <div key={day.date} className="bar-group">
                <div className="bars">
                  <div
                    className="bar success"
                    style={{
                      height: `${(day.success / Math.max(...analytics.runsByDay.map((d) => d.count))) * 100}%`,
                    }}
                    title={`Success: ${day.success}`}
                  />
                  <div
                    className="bar failed"
                    style={{
                      height: `${(day.failed / Math.max(...analytics.runsByDay.map((d) => d.count))) * 100}%`,
                    }}
                    title={`Failed: ${day.failed}`}
                  />
                </div>
                <div className="bar-label">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Performing Agents</h3>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Runs</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topAgents.map((agent) => (
                  <tr key={agent.name}>
                    <td>{agent.name}</td>
                    <td>{agent.runs}</td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${agent.successRate}%` }} />
                        <span>{agent.successRate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Performance Metrics</h3>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Workflow</th>
                  <th>Avg Time</th>
                  <th>Min</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {analytics.performance.map((perf) => (
                  <tr key={perf.name}>
                    <td>{perf.name}</td>
                    <td>{perf.avgTime.toFixed(2)}s</td>
                    <td>{perf.minTime.toFixed(2)}s</td>
                    <td>{perf.maxTime.toFixed(2)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-card">
          <h3>Recent Errors</h3>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Error</th>
                  <th>Count</th>
                  <th>Last Occurred</th>
                </tr>
              </thead>
              <tbody>
                {analytics.errors.map((error, idx) => (
                  <tr key={idx}>
                    <td className="error-message">{error.message}</td>
                    <td>{error.count}</td>
                    <td>{new Date(error.lastOccurred).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .monitoring {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header select {
          padding: 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: linear-gradient(135deg, rgba(0, 255, 159, 0.1), rgba(0, 212, 255, 0.1));
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metric-value {
          font-size: 32px;
          font-weight: bold;
          color: #00ff9f;
          margin-bottom: 8px;
        }

        .metric-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 200px;
          margin-top: 20px;
        }

        .bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .bars {
          display: flex;
          gap: 2px;
          align-items: flex-end;
          flex: 1;
          width: 100%;
        }

        .bar {
          flex: 1;
          min-height: 2px;
          border-radius: 4px 4px 0 0;
        }

        .bar.success {
          background: linear-gradient(to top, #00ff9f, #00d4ff);
        }

        .bar.failed {
          background: linear-gradient(to top, #ff0080, #ff4444);
        }

        .bar-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 8px;
          text-align: center;
        }

        .table {
          margin-top: 20px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
        }

        .progress-bar {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          height: 20px;
          overflow: hidden;
        }

        .progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: linear-gradient(90deg, #00ff9f, #00d4ff);
          border-radius: 10px;
        }

        .progress-bar span {
          position: relative;
          display: block;
          text-align: center;
          line-height: 20px;
          font-size: 12px;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
        }

        .error-message {
          color: #ff4444;
          font-family: monospace;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};
