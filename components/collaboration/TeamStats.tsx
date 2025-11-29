// ============================================
// TEAM STATS COMPONENT
// Statistike sa 3D hover efektima
// ============================================

import React, { useState, useRef } from 'react';
import { Users, UserCheck, Clock, TrendingUp, Activity } from 'lucide-react';
import type { TeamAnalytics } from '../../types/collaboration';

interface TeamStatsProps {
  analytics: TeamAnalytics;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: string;
  color: 'cyan' | 'purple' | 'amber' | 'emerald';
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subValue,
  color,
  progress,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const colorClasses = {
    cyan: {
      icon: 'text-cyan-400',
      bg: 'from-cyan-500/20 to-cyan-500/5',
      glow: 'rgba(6, 182, 212, 0.3)',
      progress: 'bg-cyan-500',
      border: 'border-cyan-500/20',
    },
    purple: {
      icon: 'text-purple-400',
      bg: 'from-purple-500/20 to-purple-500/5',
      glow: 'rgba(168, 85, 247, 0.3)',
      progress: 'bg-purple-500',
      border: 'border-purple-500/20',
    },
    amber: {
      icon: 'text-amber-400',
      bg: 'from-amber-500/20 to-amber-500/5',
      glow: 'rgba(245, 158, 11, 0.3)',
      progress: 'bg-amber-500',
      border: 'border-amber-500/20',
    },
    emerald: {
      icon: 'text-emerald-400',
      bg: 'from-emerald-500/20 to-emerald-500/5',
      glow: 'rgba(16, 185, 129, 0.3)',
      progress: 'bg-emerald-500',
      border: 'border-emerald-500/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      ref={cardRef}
      className="relative"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        className={`
          relative bg-gradient-to-br ${colors.bg}
          border ${colors.border} rounded-2xl p-5
          transition-all duration-300 overflow-hidden
          ${isHovered ? 'shadow-2xl' : ''}
        `}
        style={{
          transform: isHovered
            ? `rotateY(${mousePosition.x * 15}deg) rotateX(${-mousePosition.y * 15}deg) translateZ(20px)`
            : 'rotateY(0) rotateX(0) translateZ(0)',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered ? `0 25px 50px -12px ${colors.glow}` : 'none',
        }}
      >
        {/* Glow effect */}
        {isHovered && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, ${colors.glow}, transparent 50%)`,
            }}
          />
        )}

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                              linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative" style={{ transform: 'translateZ(30px)' }}>
          {/* Icon */}
          <div className={`${colors.icon} mb-3`}>
            {icon}
          </div>

          {/* Value */}
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-bold text-white">{value}</span>
            {subValue && (
              <span className="text-sm text-slate-400 mb-1">{subValue}</span>
            )}
          </div>

          {/* Label */}
          <p className="text-sm text-slate-400">{label}</p>

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.progress} rounded-full transition-all duration-1000 ease-out relative`}
                  style={{ width: `${progress}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating particles */}
        {isHovered && (
          <>
            <div 
              className={`absolute w-1 h-1 ${colors.progress} rounded-full animate-float-1`}
              style={{ top: '20%', left: '10%' }}
            />
            <div 
              className={`absolute w-1.5 h-1.5 ${colors.progress} rounded-full animate-float-2`}
              style={{ top: '60%', right: '15%' }}
            />
            <div 
              className={`absolute w-1 h-1 ${colors.progress} rounded-full animate-float-3`}
              style={{ bottom: '20%', left: '20%' }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export const TeamStats: React.FC<TeamStatsProps> = ({ analytics }) => {
  const activePercentage = Math.round((analytics.activeToday / analytics.totalMembers) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Users className="w-6 h-6" />}
        label="Total Members"
        value={analytics.totalMembers}
        color="cyan"
      />
      
      <StatCard
        icon={<UserCheck className="w-6 h-6" />}
        label="Active Today"
        value={analytics.activeToday}
        subValue={`of ${analytics.totalMembers}`}
        color="emerald"
        progress={activePercentage}
      />
      
      <StatCard
        icon={<Clock className="w-6 h-6" />}
        label="Pending Invites"
        value={analytics.pendingInvites}
        color="amber"
      />
      
      <StatCard
        icon={<TrendingUp className="w-6 h-6" />}
        label="Tasks This Week"
        value={analytics.tasksCompletedThisWeek}
        color="purple"
      />
    </div>
  );
};

// Add custom animations to tailwind
const styles = `
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes float-1 {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
  50% { transform: translateY(-10px) scale(1.5); opacity: 1; }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
  50% { transform: translateY(-15px) scale(1.2); opacity: 1; }
}

@keyframes float-3 {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
  50% { transform: translateY(-8px) scale(1.3); opacity: 1; }
}

.animate-shine {
  animation: shine 2s infinite;
}

.animate-float-1 {
  animation: float-1 2s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 2.5s ease-in-out infinite 0.5s;
}

.animate-float-3 {
  animation: float-3 3s ease-in-out infinite 1s;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default TeamStats;
