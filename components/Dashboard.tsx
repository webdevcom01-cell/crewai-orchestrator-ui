import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, CheckSquare, PlayCircle, History, FileCode, Settings,
  TrendingUp, Clock, Zap, Activity, ArrowRight, Bot, GitBranch,
  BarChart3, Target, Layers, Sparkles
} from 'lucide-react';
import { useOrchestrator } from '../hooks';

// =============================================================================
// Dashboard - Početna stranica sa pregledom svega
// =============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color: 'cyan' | 'emerald' | 'purple' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, color }) => {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };

  const iconBgClasses = {
    cyan: 'bg-cyan-500/20',
    emerald: 'bg-emerald-500/20',
    purple: 'bg-purple-500/20',
    amber: 'bg-amber-500/20',
  };

  return (
    <div 
      className={`p-5 rounded-xl border ${colorClasses[color]} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-default`}
      style={{ 
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform'
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);
        
        const tiltX = deltaY * -5;
        const tiltY = deltaX * 5;
        const moveY = deltaY * 8;
        
        e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${moveY - 4}px) scale(1.02)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp size={12} className={!trendUp ? 'rotate-180' : ''} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon: Icon, path, color }) => (
  <NavLink
    to={path}
    className="group p-4 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 hover:border-cyan-500/30 transition-all duration-300 flex items-center gap-4"
  >
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">{title}</h4>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <ArrowRight size={16} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
  </NavLink>
);

interface ActivityItemProps {
  action: string;
  target: string;
  time: string;
  icon: React.ElementType;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ action, target, time, icon: Icon }) => (
  <div className="flex items-center gap-3 py-3 border-b border-cyan-500/10 last:border-0">
    <div className="p-2 rounded-lg bg-cyan-500/10">
      <Icon size={14} className="text-cyan-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-300">
        <span className="text-cyan-400">{action}</span> {target}
      </p>
      <p className="text-xs text-slate-600 mt-0.5">{time}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { state } = useOrchestrator();
  const { agents, tasks, flows } = state;

  // Calculate stats
  const stats = useMemo(() => {
    const activeAgents = agents.length;
    const totalTasks = tasks.length;
    const entrypointTasks = tasks.filter(t => t.isEntrypoint).length;
    const totalFlows = flows.length;
    
    return { activeAgents, totalTasks, entrypointTasks, totalFlows };
  }, [agents, tasks, flows]);

  // Mock recent activities (in real app, this would come from API)
  const recentActivities = [
    { action: 'Created', target: 'new agent "ResearchBot"', time: '2 minutes ago', icon: Bot },
    { action: 'Updated', target: 'task "Data Analysis"', time: '15 minutes ago', icon: CheckSquare },
    { action: 'Ran', target: 'simulation #42', time: '1 hour ago', icon: PlayCircle },
    { action: 'Exported', target: 'crew configuration', time: '3 hours ago', icon: FileCode },
    { action: 'Added', target: 'context dependency', time: '5 hours ago', icon: GitBranch },
  ];

  const quickActions = [
    { title: 'Create Agent', description: 'Add a new AI agent', icon: Users, path: '/', color: 'bg-cyan-500/20 text-cyan-400' },
    { title: 'Add Task', description: 'Define a new task step', icon: CheckSquare, path: '/tasks', color: 'bg-emerald-500/20 text-emerald-400' },
    { title: 'Run Simulation', description: 'Test your crew', icon: PlayCircle, path: '/run', color: 'bg-purple-500/20 text-purple-400' },
    { title: 'Export Code', description: 'Generate Python code', icon: FileCode, path: '/export', color: 'bg-amber-500/20 text-amber-400' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="text-cyan-400" />
              Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Welcome back! Here's an overview of your CrewAI workspace.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500/60 bg-cyan-500/5 px-3 py-2 rounded-lg border border-cyan-500/10">
            <Activity size={14} />
            <span>Last sync: just now</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Active Agents" 
            value={stats.activeAgents} 
            icon={Bot}
            trend="+2 this week"
            trendUp={true}
            color="cyan"
          />
          <StatCard 
            title="Total Tasks" 
            value={stats.totalTasks} 
            icon={CheckSquare}
            trend="+5 this week"
            trendUp={true}
            color="emerald"
          />
          <StatCard 
            title="Entry Points" 
            value={stats.entrypointTasks} 
            icon={Target}
            color="purple"
          />
          <StatCard 
            title="Workflows" 
            value={stats.totalFlows} 
            icon={Layers}
            color="amber"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap size={18} className="text-cyan-400" />
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <QuickAction key={action.title} {...action} />
              ))}
            </div>

            {/* Pipeline Overview */}
            <div className="mt-6 p-5 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <BarChart3 size={16} className="text-cyan-400" />
                  Pipeline Overview
                </h3>
                <NavLink to="/tasks" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </NavLink>
              </div>
              
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.slice(0, 4).map((task, index) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-mono font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{task.name || task.description?.slice(0, 40)}</p>
                        <p className="text-xs text-slate-500 font-mono">{task.id}</p>
                      </div>
                      {index < tasks.length - 1 && (
                        <ArrowRight size={14} className="text-cyan-500/30" />
                      )}
                    </div>
                  ))}
                  {tasks.length > 4 && (
                    <p className="text-xs text-slate-500 text-center pt-2">
                      +{tasks.length - 4} more tasks
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckSquare size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tasks yet</p>
                  <NavLink to="/tasks" className="text-xs text-cyan-400 hover:underline">
                    Create your first task
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock size={18} className="text-cyan-400" />
                Recent Activity
              </h2>
            </div>
            <div className="p-4 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>

            {/* Agents Overview */}
            <div className="p-4 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Bot size={16} className="text-cyan-400" />
                  Your Agents
                </h3>
                <NavLink to="/" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  Manage <ArrowRight size={12} />
                </NavLink>
              </div>
              
              {agents.length > 0 ? (
                <div className="space-y-2">
                  {agents.slice(0, 4).map((agent) => (
                    <div key={agent.id} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Users size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <Users size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No agents yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-cyan-500/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">{agents.length}</p>
            <p className="text-xs text-slate-500">Agents Configured</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{tasks.length}</p>
            <p className="text-xs text-slate-500">Tasks Defined</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{flows.length}</p>
            <p className="text-xs text-slate-500">Active Flows</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">∞</p>
            <p className="text-xs text-slate-500">Possibilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
