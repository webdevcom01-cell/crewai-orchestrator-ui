import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { GitBranch, RefreshCw, RotateCcw, Save, Github, GitlabIcon as Gitlab, History, User, Bot, ListTodo, Users } from 'lucide-react';

interface WorkflowVersion {
  id: string;
  version: string;
  message: string;
  author: string;
  timestamp: string;
  changes: {
    agents?: number;
    tasks?: number;
    crews?: number;
  };
  isCurrent: boolean;
}

interface VersionControlProps {
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

export const VersionControl: React.FC<VersionControlProps> = ({ workspaceId }) => {
  const { hasPermission } = useAuth();
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [gitConfig, setGitConfig] = useState({
    provider: 'github' as 'github' | 'gitlab',
    repo: '',
    branch: 'main',
  });

  useEffect(() => {
    loadVersions();
    loadGitConfig();
  }, [workspaceId]);

  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/versions`);
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGitConfig = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/git/config`);
      const data = await response.json();
      if (data) {
        setGitConfig(data);
      }
    } catch (error) {
      console.error('Failed to load git config:', error);
    }
  };

  const createVersion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPermission('workspace:write')) {
      alert('You do not have permission to create versions');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage }),
      });

      if (response.ok) {
        setCommitMessage('');
        loadVersions();
      }
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!hasPermission('workspace:write')) {
      alert('You do not have permission to restore versions');
      return;
    }

    if (!confirm('Are you sure you want to restore this version? Current changes will be saved as a new version.')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/versions/${versionId}/restore`, {
        method: 'POST',
      });

      if (response.ok) {
        loadVersions();
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const syncWithGit = async () => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to sync with Git');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/git/sync`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Successfully synced with Git repository');
        loadVersions();
      }
    } catch (error) {
      console.error('Failed to sync with Git:', error);
      alert('Failed to sync with Git');
    }
  };

  const saveGitConfig = async () => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to configure Git');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/git/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gitConfig),
      });

      if (response.ok) {
        alert('Git configuration saved');
      }
    } catch (error) {
      console.error('Failed to save git config:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <GitBranch size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Version Control</h1>
          <p className="text-sm text-slate-400 font-mono">workspace.versioning.history</p>
        </div>
      </div>

      {/* Git Integration */}
      {hasPermission('settings:manage') && (
        <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            {gitConfig.provider === 'github' ? <Github size={18} /> : <Gitlab size={18} />}
            Git Integration
          </h3>
          <div className="flex flex-wrap gap-3">
            <select
              value={gitConfig.provider}
              onChange={(e) => setGitConfig({ ...gitConfig, provider: e.target.value as 'github' | 'gitlab' })}
              className="px-4 py-2.5 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="github">GitHub</option>
              <option value="gitlab">GitLab</option>
            </select>
            <input
              type="text"
              placeholder="Repository (owner/repo)"
              value={gitConfig.repo}
              onChange={(e) => setGitConfig({ ...gitConfig, repo: e.target.value })}
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <input
              type="text"
              placeholder="Branch"
              value={gitConfig.branch}
              onChange={(e) => setGitConfig({ ...gitConfig, branch: e.target.value })}
              className="w-32 px-4 py-2.5 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button 
              onClick={saveGitConfig}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
            >
              <Save size={16} />
              Save
            </button>
            <button 
              onClick={syncWithGit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all"
            >
              <RefreshCw size={16} />
              Sync
            </button>
          </div>
        </div>
      )}

      {/* Create New Version */}
      {hasPermission('workspace:write') && (
        <form onSubmit={createVersion} className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">Create New Version</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all"
            >
              <Save size={18} />
              Create Version
            </button>
          </div>
        </form>
      )}

      {/* Version History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History size={18} className="text-cyan-400" />
          Version History
        </h3>
        
        <div className="relative pl-8 space-y-4">
          {/* Timeline line */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-cyan-500/20" />
          
          {versions.map((version) => (
            <div 
              key={version.id}
              className={`relative p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                version.isCurrent 
                  ? 'bg-cyan-500/10 border-cyan-500/40' 
                  : 'bg-[#080F1A]/60 border-cyan-500/15'
              }`}
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onMouseMove={(e) => apply3DHover(e, 3)}
              onMouseLeave={reset3DHover}
            >
              {/* Timeline dot */}
              <div className={`absolute -left-5 top-6 w-3 h-3 rounded-full ${
                version.isCurrent 
                  ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,197,220,0.6)]' 
                  : 'bg-slate-500'
              }`} />
              
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-cyan-400 font-bold font-mono">{version.version}</span>
                    {version.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-xs font-bold">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-white mb-2">{version.message}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {version.author}
                    </span>
                    <span>{new Date(version.timestamp).toLocaleString()}</span>
                  </div>
                  
                  {/* Changes */}
                  <div className="flex gap-4 mt-3 text-xs">
                    {version.changes.agents !== undefined && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Bot size={12} className="text-cyan-400" />
                        {version.changes.agents} agents
                      </span>
                    )}
                    {version.changes.tasks !== undefined && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <ListTodo size={12} className="text-emerald-400" />
                        {version.changes.tasks} tasks
                      </span>
                    )}
                    {version.changes.crews !== undefined && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Users size={12} className="text-purple-400" />
                        {version.changes.crews} crews
                      </span>
                    )}
                  </div>
                </div>
                
                {!version.isCurrent && hasPermission('workspace:write') && (
                  <button 
                    onClick={() => restoreVersion(version.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium hover:bg-pink-500/20 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
