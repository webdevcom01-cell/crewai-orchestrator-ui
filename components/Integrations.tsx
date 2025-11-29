import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Link2, Plus, Trash2, X, Send, MessageSquare, Gamepad2, Webhook, Check } from 'lucide-react';

interface Integration {
  id: string;
  type: 'slack' | 'discord' | 'webhook';
  name: string;
  enabled: boolean;
  config: {
    url?: string;
    channel?: string;
    events?: string[];
  };
}

interface IntegrationsProps {
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

export const Integrations: React.FC<IntegrationsProps> = ({ workspaceId }) => {
  const { hasPermission } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    type: 'slack' as Integration['type'],
    name: '',
    url: '',
    channel: '',
    events: [] as string[],
  });

  const availableEvents = [
    'run_started',
    'run_completed',
    'run_failed',
    'agent_started',
    'agent_completed',
    'task_started',
    'task_completed',
    'error_occurred',
  ];

  useEffect(() => {
    loadIntegrations();
  }, [workspaceId]);

  const loadIntegrations = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/integrations`);
      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const addIntegration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to add integrations');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/integrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntegration),
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewIntegration({
          type: 'slack',
          name: '',
          url: '',
          channel: '',
          events: [],
        });
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to add integration:', error);
    }
  };

  const toggleIntegration = async (id: string, enabled: boolean) => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to modify integrations');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/integrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to delete integrations');
      return;
    }

    if (!confirm('Are you sure you want to delete this integration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/integrations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const testIntegration = async (id: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/integrations/${id}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Test notification sent successfully!');
      } else {
        alert('Failed to send test notification');
      }
    } catch (error) {
      console.error('Failed to test integration:', error);
      alert('Failed to test integration');
    }
  };

  const getIcon = (type: Integration['type']) => {
    switch (type) {
      case 'slack': return <MessageSquare size={20} className="text-purple-400" />;
      case 'discord': return <Gamepad2 size={20} className="text-indigo-400" />;
      case 'webhook': return <Webhook size={20} className="text-cyan-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Link2 size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Integrations</h1>
            <p className="text-sm text-slate-400 font-mono">workspace.integrations.config</p>
          </div>
        </div>
        
        {hasPermission('settings:manage') && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all hover:scale-105"
          >
            <Plus size={18} />
            Add Integration
          </button>
        )}
      </div>

      {/* Add Integration Modal */}
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
              <h2 className="text-xl font-bold text-white">Add Integration</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={addIntegration} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['slack', 'discord', 'webhook'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewIntegration({ ...newIntegration, type })}
                      className={`p-3 rounded-lg border text-center capitalize transition-all ${
                        newIntegration.type === type
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-[#080F1A] border-cyan-500/10 text-slate-400 hover:border-cyan-500/30'
                      }`}
                    >
                      {type === 'slack' && <MessageSquare size={20} className="mx-auto mb-1" />}
                      {type === 'discord' && <Gamepad2 size={20} className="mx-auto mb-1" />}
                      {type === 'webhook' && <Webhook size={20} className="mx-auto mb-1" />}
                      <span className="text-sm">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  placeholder="e.g., Team Notifications"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={newIntegration.url}
                  onChange={(e) => setNewIntegration({ ...newIntegration, url: e.target.value })}
                  placeholder="https://hooks.slack.com/..."
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              {newIntegration.type !== 'webhook' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Channel</label>
                  <input
                    type="text"
                    value={newIntegration.channel}
                    onChange={(e) => setNewIntegration({ ...newIntegration, channel: e.target.value })}
                    placeholder="e.g., #general"
                    className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Events to Notify</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableEvents.map((event) => (
                    <label 
                      key={event} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        newIntegration.events.includes(event)
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-[#080F1A] border-cyan-500/10 hover:border-cyan-500/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        newIntegration.events.includes(event)
                          ? 'bg-cyan-500'
                          : 'bg-slate-700 border border-slate-600'
                      }`}>
                        {newIntegration.events.includes(event) && <Check size={14} className="text-black" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={newIntegration.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewIntegration({
                              ...newIntegration,
                              events: [...newIntegration.events, event],
                            });
                          } else {
                            setNewIntegration({
                              ...newIntegration,
                              events: newIntegration.events.filter((ev) => ev !== event),
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm text-slate-300 capitalize">{event.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                  Add Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integrations Grid */}
      {integrations.length === 0 ? (
        <div className="text-center py-16">
          <Link2 size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No integrations configured yet</p>
          <p className="text-sm text-slate-500">Add integrations to receive notifications about workflow events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div 
              key={integration.id}
              className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                integration.enabled 
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
                    {getIcon(integration.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{integration.name}</h3>
                    <p className="text-sm text-slate-400 capitalize">{integration.type}</p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integration.enabled}
                    onChange={(e) => toggleIntegration(integration.id, e.target.checked)}
                    disabled={!hasPermission('settings:manage')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 mb-4 text-sm">
                {integration.config.url && (
                  <div>
                    <span className="text-slate-500 block mb-1">URL:</span>
                    <code className="block px-3 py-2 rounded-lg bg-slate-800/50 text-cyan-400 text-xs break-all">
                      {integration.config.url}
                    </code>
                  </div>
                )}
                {integration.config.channel && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Channel:</span>
                    <code className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">{integration.config.channel}</code>
                  </div>
                )}
                {integration.config.events && integration.config.events.length > 0 && (
                  <div>
                    <span className="text-slate-500 block mb-2">Events:</span>
                    <div className="flex flex-wrap gap-2">
                      {integration.config.events.map((event) => (
                        <span 
                          key={event} 
                          className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs capitalize"
                        >
                          {event.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {hasPermission('settings:manage') && (
                <div className="flex gap-3 pt-4 border-t border-cyan-500/10">
                  <button 
                    onClick={() => testIntegration(integration.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors"
                  >
                    <Send size={14} />
                    Test
                  </button>
                  <button 
                    onClick={() => deleteIntegration(integration.id)}
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
