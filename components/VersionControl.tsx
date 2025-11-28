import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

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
    return <div className="loading">Loading version history...</div>;
  }

  return (
    <div className="version-control">
      <h2>Version Control</h2>

      {hasPermission('settings:manage') && (
        <div className="git-config">
          <h3>Git Integration</h3>
          <div className="config-form">
            <select
              value={gitConfig.provider}
              onChange={(e) => setGitConfig({ ...gitConfig, provider: e.target.value as 'github' | 'gitlab' })}
            >
              <option value="github">GitHub</option>
              <option value="gitlab">GitLab</option>
            </select>
            <input
              type="text"
              placeholder="Repository (owner/repo)"
              value={gitConfig.repo}
              onChange={(e) => setGitConfig({ ...gitConfig, repo: e.target.value })}
            />
            <input
              type="text"
              placeholder="Branch"
              value={gitConfig.branch}
              onChange={(e) => setGitConfig({ ...gitConfig, branch: e.target.value })}
            />
            <button onClick={saveGitConfig}>Save Config</button>
            <button onClick={syncWithGit} className="btn-sync">Sync Now</button>
          </div>
        </div>
      )}

      {hasPermission('workspace:write') && (
        <form onSubmit={createVersion} className="commit-form">
          <h3>Create New Version</h3>
          <input
            type="text"
            placeholder="Commit message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            required
          />
          <button type="submit">Create Version</button>
        </form>
      )}

      <div className="version-history">
        <h3>Version History</h3>
        <div className="timeline">
          {versions.map((version) => (
            <div key={version.id} className={`version-item ${version.isCurrent ? 'current' : ''}`}>
              <div className="version-header">
                <span className="version-number">{version.version}</span>
                {version.isCurrent && <span className="current-badge">Current</span>}
                <span className="version-time">{new Date(version.timestamp).toLocaleString()}</span>
              </div>
              <div className="version-message">{version.message}</div>
              <div className="version-author">by {version.author}</div>
              <div className="version-changes">
                {version.changes.agents && <span>Agents: {version.changes.agents}</span>}
                {version.changes.tasks && <span>Tasks: {version.changes.tasks}</span>}
                {version.changes.crews && <span>Crews: {version.changes.crews}</span>}
              </div>
              {!version.isCurrent && hasPermission('workspace:write') && (
                <button onClick={() => restoreVersion(version.id)} className="btn-restore">
                  Restore This Version
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .version-control {
          padding: 20px;
        }

        .git-config,
        .commit-form {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .config-form {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .config-form input,
        .config-form select,
        .commit-form input {
          padding: 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          flex: 1;
        }

        .config-form button,
        .commit-form button {
          background: #00ff9f;
          color: #000;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-sync {
          background: #00d4ff !important;
        }

        .timeline {
          position: relative;
          padding-left: 40px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255, 255, 255, 0.2);
        }

        .version-item {
          position: relative;
          margin-bottom: 30px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border-left: 3px solid rgba(255, 255, 255, 0.3);
        }

        .version-item.current {
          border-left-color: #00ff9f;
          background: rgba(0, 255, 159, 0.1);
        }

        .version-item::before {
          content: '';
          position: absolute;
          left: -30px;
          top: 20px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
        }

        .version-item.current::before {
          background: #00ff9f;
          box-shadow: 0 0 10px #00ff9f;
        }

        .version-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .version-number {
          font-weight: bold;
          color: #00ff9f;
        }

        .current-badge {
          background: #00ff9f;
          color: #000;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: bold;
        }

        .version-time {
          margin-left: auto;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .version-message {
          margin-bottom: 5px;
        }

        .version-author {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-bottom: 10px;
        }

        .version-changes {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 10px;
        }

        .btn-restore {
          background: #ff0080;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
