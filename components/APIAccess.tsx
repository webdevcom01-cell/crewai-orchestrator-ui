import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Key, Plus, Trash2, X, Copy, BookOpen, Check, Code, Shield } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  type: 'rest' | 'graphql';
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
}

interface APIDocsProps {
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

export const APIAccess: React.FC<APIDocsProps> = ({ workspaceId }) => {
  const { hasPermission } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    type: 'rest' as 'rest' | 'graphql',
    permissions: [] as string[],
    expiresInDays: 90,
  });
  const [activeTab, setActiveTab] = useState<'keys' | 'docs'>('keys');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availablePermissions = [
    'agents:read',
    'agents:write',
    'tasks:read',
    'tasks:write',
    'crews:read',
    'crews:write',
    'runs:execute',
    'runs:read',
    'webhooks:manage',
  ];

  useEffect(() => {
    loadAPIKeys();
  }, [workspaceId]);

  const loadAPIKeys = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/api-keys`);
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const createAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to create API keys');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey),
      });

      if (response.ok) {
        const createdKey = await response.json();
        alert(`API Key Created!\n\nKey: ${createdKey.key}\n\nMake sure to copy it now. You won't be able to see it again!`);
        setShowCreateForm(false);
        setNewKey({
          name: '',
          type: 'rest',
          permissions: [],
          expiresInDays: 90,
        });
        loadAPIKeys();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const revokeAPIKey = async (id: string) => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to revoke API keys');
      return;
    }

    if (!confirm('Are you sure you want to revoke this API key?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadAPIKeys();
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Key size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">API Access</h1>
            <p className="text-sm text-slate-400 font-mono">workspace.api.management</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-lg bg-[#080F1A]/60 border border-cyan-500/15">
          <button 
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'keys' 
                ? 'bg-cyan-500 text-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            API Keys
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'docs' 
                ? 'bg-cyan-500 text-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Documentation
          </button>
        </div>
      </div>

      {activeTab === 'keys' && (
        <>
          {/* Subheader */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-slate-400">Create and manage API keys for programmatic access</p>
            {hasPermission('settings:manage') && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all hover:scale-105"
              >
                <Plus size={18} />
                Create API Key
              </button>
            )}
          </div>

          {/* Create Modal */}
          {showCreateForm && (
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateForm(false)}
            >
              <div 
                className="bg-[#0c1621] border border-cyan-500/20 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-cyan-500/10">
                  <h2 className="text-xl font-bold text-white">Create API Key</h2>
                  <button 
                    onClick={() => setShowCreateForm(false)}
                    className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
                
                <form onSubmit={createAPIKey} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Key Name</label>
                    <input
                      type="text"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      placeholder="Production API Key"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">API Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['rest', 'graphql'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewKey({ ...newKey, type })}
                          className={`p-3 rounded-lg border text-center uppercase transition-all ${
                            newKey.type === type
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                              : 'bg-[#080F1A] border-cyan-500/10 text-slate-400 hover:border-cyan-500/30'
                          }`}
                        >
                          {type === 'rest' ? <Code size={20} className="mx-auto mb-1" /> : <Code size={20} className="mx-auto mb-1" />}
                          <span className="text-sm">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availablePermissions.map((perm) => (
                        <label 
                          key={perm} 
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                            newKey.permissions.includes(perm)
                              ? 'bg-cyan-500/10 border-cyan-500/30'
                              : 'bg-[#080F1A] border-cyan-500/10 hover:border-cyan-500/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={newKey.permissions.includes(perm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewKey({ ...newKey, permissions: [...newKey.permissions, perm] });
                              } else {
                                setNewKey({ ...newKey, permissions: newKey.permissions.filter((p) => p !== perm) });
                              }
                            }}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${
                            newKey.permissions.includes(perm) ? 'bg-cyan-500' : 'bg-slate-700 border border-slate-600'
                          }`}>
                            {newKey.permissions.includes(perm) && <Check size={12} className="text-black" />}
                          </div>
                          <span className="text-slate-300">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Expires In</label>
                    <select
                      value={newKey.expiresInDays}
                      onChange={(e) => setNewKey({ ...newKey, expiresInDays: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    >
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                      <option value="-1">Never</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 py-3 rounded-lg bg-slate-700/50 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all"
                    >
                      Create Key
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Keys List */}
          {apiKeys.length === 0 ? (
            <div className="text-center py-16">
              <Key size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 mb-2">No API keys created yet</p>
              <p className="text-sm text-slate-500">Create your first API key to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {apiKeys.map((key) => (
                <div 
                  key={key.id}
                  className={`p-5 rounded-xl border backdrop-blur-sm ${
                    key.isActive 
                      ? 'bg-[#080F1A]/60 border-cyan-500/20' 
                      : 'bg-[#080F1A]/30 border-slate-700/50 opacity-60'
                  }`}
                  style={{ 
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                  onMouseMove={(e) => apply3DHover(e, 2)}
                  onMouseLeave={reset3DHover}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white">{key.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        key.type === 'rest' 
                          ? 'bg-cyan-500/20 text-cyan-400' 
                          : 'bg-pink-500/20 text-pink-400'
                      }`}>
                        {key.type}
                      </span>
                    </div>
                    
                    {hasPermission('settings:manage') && key.isActive && (
                      <button 
                        onClick={() => revokeAPIKey(key.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                        Revoke
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-20">Key:</span>
                      <code className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 text-cyan-400 text-xs font-mono">
                        {key.key.substring(0, 20)}...****
                      </code>
                      <button 
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        {copiedId === key.id ? (
                          <Check size={16} className="text-emerald-400" />
                        ) : (
                          <Copy size={16} className="text-slate-400" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex gap-6 text-slate-400">
                      <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.expiresAt && <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>}
                      {key.lastUsed && <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {key.permissions.map((perm) => (
                        <span 
                          key={perm} 
                          className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'docs' && (
        <div className="max-w-4xl space-y-8">
          <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={18} className="text-cyan-400" />
              Authentication
            </h3>
            <p className="text-slate-400 mb-4">Include your API key in the Authorization header:</p>
            <pre className="p-4 rounded-lg bg-slate-900/50 border border-cyan-500/10 overflow-x-auto">
              <code className="text-cyan-400 font-mono text-sm">Authorization: Bearer YOUR_API_KEY</code>
            </pre>
          </div>

          <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-400" />
              REST API
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded bg-emerald-500 text-black text-xs font-bold">POST</span>
                  <code className="text-white font-mono">/api/v1/workflows/{'{workflowId}'}/run</code>
                </div>
                <pre className="p-4 rounded-lg bg-slate-900/50 border border-cyan-500/10 overflow-x-auto text-sm">
                  <code className="text-cyan-400 font-mono">{`curl -X POST https://api.crewai.com/api/v1/workflows/123/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"inputs": {"topic": "AI trends 2024"}}'`}</code>
                </pre>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded bg-cyan-500 text-black text-xs font-bold">GET</span>
                  <code className="text-white font-mono">/api/v1/agents</code>
                </div>
                <pre className="p-4 rounded-lg bg-slate-900/50 border border-cyan-500/10 overflow-x-auto text-sm">
                  <code className="text-cyan-400 font-mono">{`curl -X GET https://api.crewai.com/api/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Code size={18} className="text-pink-400" />
              GraphQL API
            </h3>
            <p className="text-slate-400 mb-4">Endpoint: <code className="text-cyan-400">https://api.crewai.com/graphql</code></p>
            <pre className="p-4 rounded-lg bg-slate-900/50 border border-cyan-500/10 overflow-x-auto text-sm">
              <code className="text-cyan-400 font-mono">{`query {
  agents { id name role status }
  workflows { id name agents { name } }
}`}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
