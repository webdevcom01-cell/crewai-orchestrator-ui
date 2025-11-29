import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Clock, Plus, Play, Trash2, X, Timer, Webhook, Calendar, RefreshCw, CheckCircle } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  type: 'cron' | 'interval' | 'webhook';
  enabled: boolean;
  config: {
    cron?: string;
    interval?: number;
    webhookUrl?: string;
    webhookSecret?: string;
  };
  workflowId: string;
  workflowName: string;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

interface SchedulerProps {
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

export const Scheduler: React.FC<SchedulerProps> = ({ workspaceId }) => {
  const { hasPermission } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string }>>([]);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    type: 'cron' as Schedule['type'],
    workflowId: '',
    cron: '0 0 * * *',
    interval: 3600,
    webhookSecret: '',
  });

  const cronPresets = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Monday 9am', value: '0 9 * * 1' },
    { label: '1st of month', value: '0 0 1 * *' },
  ];

  useEffect(() => {
    loadSchedules();
    loadWorkflows();
  }, [workspaceId]);

  const loadSchedules = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/schedules`);
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/workflows`);
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const addSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to create schedules');
      return;
    }

    try {
      const config: Record<string, unknown> = {};
      if (newSchedule.type === 'cron') {
        config.cron = newSchedule.cron;
      } else if (newSchedule.type === 'interval') {
        config.interval = newSchedule.interval;
      } else if (newSchedule.type === 'webhook') {
        config.webhookSecret = newSchedule.webhookSecret;
      }

      const response = await fetch(`/api/workspaces/${workspaceId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSchedule.name,
          type: newSchedule.type,
          workflowId: newSchedule.workflowId,
          config,
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewSchedule({
          name: '',
          type: 'cron',
          workflowId: '',
          cron: '0 0 * * *',
          interval: 3600,
          webhookSecret: '',
        });
        loadSchedules();
      }
    } catch (error) {
      console.error('Failed to add schedule:', error);
    }
  };

  const toggleSchedule = async (id: string, enabled: boolean) => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to modify schedules');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        loadSchedules();
      }
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to delete schedules');
      return;
    }

    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/schedules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadSchedules();
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const runNow = async (id: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/schedules/${id}/run`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Schedule triggered successfully!');
        loadSchedules();
      }
    } catch (error) {
      console.error('Failed to trigger schedule:', error);
    }
  };

  const getTypeIcon = (type: Schedule['type']) => {
    switch (type) {
      case 'cron': return <Calendar size={18} className="text-cyan-400" />;
      case 'interval': return <Timer size={18} className="text-emerald-400" />;
      case 'webhook': return <Webhook size={18} className="text-purple-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Clock size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Workflow Scheduler</h1>
            <p className="text-sm text-slate-400 font-mono">automation.schedules.config</p>
          </div>
        </div>
        
        {hasPermission('settings:manage') && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all hover:scale-105"
          >
            <Plus size={18} />
            Add Schedule
          </button>
        )}
      </div>

      {/* Add Schedule Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddForm(false)}
        >
          <div 
            className="bg-[#0c1621] border border-cyan-500/20 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/10">
              <h2 className="text-xl font-bold text-white">Create New Schedule</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={addSchedule} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Schedule Name</label>
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="Daily Report Generation"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Workflow</label>
                <select
                  value={newSchedule.workflowId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, workflowId: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="">Select workflow...</option>
                  {workflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Trigger Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['cron', 'interval', 'webhook'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewSchedule({ ...newSchedule, type })}
                      className={`p-3 rounded-lg border text-center capitalize transition-all ${
                        newSchedule.type === type
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-[#080F1A] border-cyan-500/10 text-slate-400 hover:border-cyan-500/30'
                      }`}
                    >
                      {type === 'cron' && <Calendar size={20} className="mx-auto mb-1" />}
                      {type === 'interval' && <Timer size={20} className="mx-auto mb-1" />}
                      {type === 'webhook' && <Webhook size={20} className="mx-auto mb-1" />}
                      <span className="text-sm">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {newSchedule.type === 'cron' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cron Expression</label>
                  <input
                    type="text"
                    value={newSchedule.cron}
                    onChange={(e) => setNewSchedule({ ...newSchedule, cron: e.target.value })}
                    placeholder="0 0 * * *"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {cronPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setNewSchedule({ ...newSchedule, cron: preset.value })}
                        className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newSchedule.type === 'interval' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Interval (seconds)</label>
                  <input
                    type="number"
                    value={newSchedule.interval}
                    onChange={(e) => setNewSchedule({ ...newSchedule, interval: parseInt(e.target.value) })}
                    min="60"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    {newSchedule.interval < 3600
                      ? `Every ${Math.floor(newSchedule.interval / 60)} minutes`
                      : `Every ${Math.floor(newSchedule.interval / 3600)} hours`}
                  </p>
                </div>
              )}

              {newSchedule.type === 'webhook' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Webhook Secret (optional)</label>
                  <input
                    type="text"
                    value={newSchedule.webhookSecret}
                    onChange={(e) => setNewSchedule({ ...newSchedule, webhookSecret: e.target.value })}
                    placeholder="Leave empty for auto-generated"
                    className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  <p className="mt-2 text-sm text-slate-500">Webhook URL will be generated after creation</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 rounded-lg bg-slate-700/50 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedules Grid */}
      {schedules.length === 0 ? (
        <div className="text-center py-16">
          <RefreshCw size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No schedules configured</p>
          <p className="text-sm text-slate-500">Create schedules to automate your workflows</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {schedules.map((schedule) => (
            <div 
              key={schedule.id}
              className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                schedule.enabled 
                  ? 'bg-[#080F1A]/60 border-cyan-500/20' 
                  : 'bg-[#080F1A]/30 border-slate-700/50 opacity-60'
              }`}
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onMouseMove={(e) => apply3DHover(e)}
              onMouseLeave={reset3DHover}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    {getTypeIcon(schedule.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{schedule.name}</h3>
                    <p className="text-sm text-slate-400">{schedule.workflowName}</p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) => toggleSchedule(schedule.id, e.target.checked)}
                    disabled={!hasPermission('settings:manage')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type:</span>
                  <span className="text-slate-300 capitalize">{schedule.type}</span>
                </div>
                {schedule.config.cron && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cron:</span>
                    <code className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-xs">{schedule.config.cron}</code>
                  </div>
                )}
                {schedule.config.interval && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interval:</span>
                    <span className="text-slate-300">Every {schedule.config.interval / 60} min</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Runs:</span>
                  <span className="text-slate-300">{schedule.runCount}</span>
                </div>
                {schedule.lastRun && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Run:</span>
                    <span className="text-slate-300">{new Date(schedule.lastRun).toLocaleString()}</span>
                  </div>
                )}
                {schedule.nextRun && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Run:</span>
                    <span className="text-emerald-400 font-medium">{new Date(schedule.nextRun).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {hasPermission('settings:manage') && (
                <div className="flex gap-3 pt-4 border-t border-cyan-500/10">
                  <button 
                    onClick={() => runNow(schedule.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors"
                  >
                    <Play size={14} />
                    Run Now
                  </button>
                  <button 
                    onClick={() => deleteSchedule(schedule.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
