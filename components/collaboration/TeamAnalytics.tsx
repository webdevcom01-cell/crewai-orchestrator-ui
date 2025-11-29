// ============================================
// TEAM ANALYTICS COMPONENT
// Grafici i metrike tima
// ============================================

import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { TeamAnalytics as TeamAnalyticsType } from '../../types/collaboration';
import { ROLE_COLORS } from '../../types/collaboration';

interface TeamAnalyticsProps {
  analytics: TeamAnalyticsType;
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ analytics }) => {
  // Calculate max for activity chart
  const maxActivity = useMemo(() => {
    return Math.max(...analytics.activityByDay.map(d => d.count));
  }, [analytics.activityByDay]);

  // Format day name
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Response Time */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <ArrowDownRight className="w-4 h-4" />
              <span>-12%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {analytics.avgResponseTime}h
          </p>
          <p className="text-sm text-slate-400">Avg Response Time</p>
        </div>

        {/* Tasks Completed This Week */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+23%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {analytics.tasksCompletedThisWeek}
          </p>
          <p className="text-sm text-slate-400">Tasks This Week</p>
        </div>

        {/* Active Rate */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+5%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {Math.round((analytics.activeToday / analytics.totalMembers) * 100)}%
          </p>
          <p className="text-sm text-slate-400">Active Rate Today</p>
        </div>
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Weekly Activity
            </h3>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-40">
            {analytics.activityByDay.map((day, index) => {
              const height = (day.count / maxActivity) * 100;
              const isToday = index === analytics.activityByDay.length - 1;
              
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  {/* Bar */}
                  <div className="w-full relative group">
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.count} activities
                    </div>
                    
                    <div
                      className={`
                        w-full rounded-t-lg transition-all duration-500 ease-out
                        ${isToday
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400'
                          : 'bg-gradient-to-t from-slate-600 to-slate-500 hover:from-cyan-600/50 hover:to-cyan-400/50'
                        }
                      `}
                      style={{
                        height: `${height}%`,
                        minHeight: '8px',
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                  
                  {/* Day label */}
                  <span className={`text-xs ${isToday ? 'text-cyan-400 font-medium' : 'text-slate-500'}`}>
                    {formatDay(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Role Distribution
            </h3>
          </div>

          {/* Donut Chart representation */}
          <div className="flex items-center gap-8">
            {/* Simplified donut */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {(() => {
                  let offset = 0;
                  const total = analytics.roleDistribution.reduce((sum, r) => sum + r.count, 0);
                  
                  return analytics.roleDistribution.map((role, index) => {
                    const percentage = (role.count / total) * 100;
                    const dashArray = `${percentage * 2.51} ${251.2 - percentage * 2.51}`;
                    const dashOffset = -offset * 2.51;
                    offset += percentage;
                    
                    const colors: Record<string, string> = {
                      owner: '#f59e0b',
                      admin: '#a855f7',
                      editor: '#06b6d4',
                      viewer: '#64748b',
                    };
                    
                    return (
                      <circle
                        key={role.role}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={colors[role.role]}
                        strokeWidth="20"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-500"
                      />
                    );
                  });
                })()}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{analytics.totalMembers}</span>
                <span className="text-xs text-slate-400">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {analytics.roleDistribution.map(role => {
                const colors = ROLE_COLORS[role.role];
                const percentage = Math.round((role.count / analytics.totalMembers) * 100);
                
                return (
                  <div key={role.role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                      <span className="text-sm text-slate-300 capitalize">{role.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{role.count}</span>
                      <span className="text-xs text-slate-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Top Contributors */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Top Contributors
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {analytics.topContributors.map((contributor, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const bgColors = [
              'from-amber-500/20 to-amber-600/10 border-amber-500/30',
              'from-slate-400/20 to-slate-500/10 border-slate-400/30',
              'from-orange-600/20 to-orange-700/10 border-orange-600/30',
              'from-slate-700/30 to-slate-800/30 border-slate-600/30',
              'from-slate-700/30 to-slate-800/30 border-slate-600/30',
            ];
            
            return (
              <div
                key={contributor.userId}
                className={`
                  relative bg-gradient-to-br ${bgColors[index]}
                  border rounded-xl p-4 text-center
                  transition-all duration-300 hover:scale-105
                `}
              >
                {/* Medal for top 3 */}
                {index < 3 && (
                  <div className="absolute -top-2 -right-2 text-2xl">
                    {medals[index]}
                  </div>
                )}

                {/* Avatar */}
                <div className="mx-auto mb-3">
                  {contributor.avatar ? (
                    <img
                      src={contributor.avatar}
                      alt={contributor.name}
                      className="w-12 h-12 rounded-full ring-2 ring-slate-700 mx-auto"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-700 mx-auto">
                      <span className="text-lg font-bold text-white">
                        {contributor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="text-sm font-medium text-white truncate mb-1">
                  {contributor.name}
                </p>

                {/* Score */}
                <p className="text-lg font-bold text-cyan-400">
                  {contributor.score}
                </p>
                <p className="text-xs text-slate-500">tasks</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;
