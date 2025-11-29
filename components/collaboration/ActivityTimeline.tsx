// ============================================
// ACTIVITY TIMELINE COMPONENT
// Timeline sa aktivnostima članova
// ============================================

import React from 'react';
import {
  UserPlus,
  FileEdit,
  MessageSquare,
  Trash2,
  Plus,
  Shield,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { Activity, ActivityType } from '../../types/collaboration';

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'joined':
      return <UserPlus className="w-4 h-4" />;
    case 'created':
      return <Plus className="w-4 h-4" />;
    case 'edited':
      return <FileEdit className="w-4 h-4" />;
    case 'deleted':
      return <Trash2 className="w-4 h-4" />;
    case 'commented':
      return <MessageSquare className="w-4 h-4" />;
    case 'invited':
      return <UserPlus className="w-4 h-4" />;
    case 'role_changed':
      return <Shield className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case 'joined':
    case 'invited':
      return {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-400',
        line: 'bg-emerald-500/30',
      };
    case 'created':
      return {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/30',
        icon: 'text-cyan-400',
        line: 'bg-cyan-500/30',
      };
    case 'edited':
      return {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/30',
        icon: 'text-purple-400',
        line: 'bg-purple-500/30',
      };
    case 'deleted':
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        line: 'bg-red-500/30',
      };
    case 'commented':
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        icon: 'text-amber-400',
        line: 'bg-amber-500/30',
      };
    case 'role_changed':
      return {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        icon: 'text-blue-400',
        line: 'bg-blue-500/30',
      };
    default:
      return {
        bg: 'bg-slate-500/20',
        border: 'border-slate-500/30',
        icon: 'text-slate-400',
        line: 'bg-slate-500/30',
      };
  }
};

const getActivityMessage = (activity: Activity) => {
  switch (activity.type) {
    case 'joined':
      return 'joined the team';
    case 'created':
      return (
        <>
          created{' '}
          <span className="text-cyan-400 font-medium">{activity.targetName}</span>
        </>
      );
    case 'edited':
      return (
        <>
          edited{' '}
          <span className="text-purple-400 font-medium">{activity.targetName}</span>
        </>
      );
    case 'deleted':
      return (
        <>
          deleted{' '}
          <span className="text-red-400 font-medium">{activity.targetName}</span>
        </>
      );
    case 'commented':
      return (
        <>
          commented on{' '}
          <span className="text-amber-400 font-medium">{activity.targetName}</span>
        </>
      );
    case 'invited':
      return (
        <>
          invited{' '}
          <span className="text-emerald-400 font-medium">{activity.targetName}</span>
        </>
      );
    case 'role_changed':
      return (
        <>
          changed role of{' '}
          <span className="text-blue-400 font-medium">{activity.targetName}</span>
          {activity.metadata?.oldRole && activity.metadata?.newRole && (
            <>
              {' '}from <span className="text-slate-400">{activity.metadata.oldRole}</span> to{' '}
              <span className="text-cyan-400">{activity.metadata.newRole}</span>
            </>
          )}
        </>
      );
    default:
      return 'performed an action';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  maxItems = 10,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Recent Activity
        </h3>
        <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
          View All
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-slate-700 via-slate-600 to-transparent" />

        {/* Activity items */}
        <div className="space-y-4">
          {displayActivities.map((activity, index) => {
            const colors = getActivityColor(activity.type);
            
            return (
              <div
                key={activity.id}
                className="relative flex items-start gap-4 group"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className={`
                    relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                    border ${colors.border} ${colors.bg}
                    transition-all duration-300 group-hover:scale-110
                  `}
                >
                  <div className={colors.icon}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {/* User info */}
                      <div className="flex items-center gap-2 mb-1">
                        {activity.userAvatar ? (
                          <img
                            src={activity.userAvatar}
                            alt={activity.userName}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {activity.userName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-white">
                          {activity.userName}
                        </span>
                      </div>

                      {/* Action message */}
                      <p className="text-sm text-slate-400">
                        {getActivityMessage(activity)}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more indicator */}
        {activities.length > maxItems && (
          <div className="relative mt-4 pt-4 border-t border-slate-700/50">
            <div className="text-center">
              <button className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                Show {activities.length - maxItems} more activities
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {displayActivities.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No recent activity</p>
            <p className="text-sm text-slate-500 mt-1">
              Activities will appear here as team members interact
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
