import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="api-access">
      <div className="header">
        <h2>API Access</h2>
        <div className="tabs">
          <button className={activeTab === 'keys' ? 'active' : ''} onClick={() => setActiveTab('keys')}>
            API Keys
          </button>
          <button className={activeTab === 'docs' ? 'active' : ''} onClick={() => setActiveTab('docs')}>
            Documentation
          </button>
        </div>
      </div>

      {activeTab === 'keys' && (
        <>
          <div className="subheader">
            <p>Create and manage API keys for programmatic access</p>
            {hasPermission('settings:manage') && (
              <button onClick={() => setShowCreateForm(true)} className="btn-create">
                + Create API Key
              </button>
            )}
          </div>

          {showCreateForm && (
            <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Create API Key</h3>
                <form onSubmit={createAPIKey}>
                  <label>
                    Key Name
                    <input
                      type="text"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      placeholder="Production API Key"
                      required
                    />
                  </label>

                  <label>
                    API Type
                    <select value={newKey.type} onChange={(e) => setNewKey({ ...newKey, type: e.target.value as any })}>
                      <option value="rest">REST API</option>
                      <option value="graphql">GraphQL API</option>
                    </select>
                  </label>

                  <label>
                    Permissions
                    <div className="permissions-list">
                      {availablePermissions.map((perm) => (
                        <label key={perm} className="checkbox-label">
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
                          />
                          {perm}
                        </label>
                      ))}
                    </div>
                  </label>

                  <label>
                    Expires In
                    <select
                      value={newKey.expiresInDays}
                      onChange={(e) => setNewKey({ ...newKey, expiresInDays: parseInt(e.target.value) })}
                    >
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                      <option value="-1">Never</option>
                    </select>
                  </label>

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                      Create Key
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="keys-list">
            {apiKeys.length === 0 ? (
              <div className="empty-state">
                <p>No API keys created yet</p>
              </div>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className={`key-card ${!key.isActive ? 'inactive' : ''}`}>
                  <div className="key-header">
                    <h3>{key.name}</h3>
                    <span className={`key-type ${key.type}`}>{key.type.toUpperCase()}</span>
                  </div>
                  <div className="key-details">
                    <div className="detail-row">
                      <span className="label">Key:</span>
                      <code onClick={() => copyToClipboard(key.key)}>{key.key.substring(0, 20)}...****</code>
                      <button onClick={() => copyToClipboard(key.key)} className="btn-copy">
                        📋
                      </button>
                    </div>
                    <div className="detail-row">
                      <span className="label">Created:</span>
                      <span>{new Date(key.createdAt).toLocaleDateString()}</span>
                    </div>
                    {key.expiresAt && (
                      <div className="detail-row">
                        <span className="label">Expires:</span>
                        <span>{new Date(key.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {key.lastUsed && (
                      <div className="detail-row">
                        <span className="label">Last Used:</span>
                        <span>{new Date(key.lastUsed).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="permissions-tags">
                      {key.permissions.map((perm) => (
                        <span key={perm} className="perm-tag">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  {hasPermission('settings:manage') && key.isActive && (
                    <button onClick={() => revokeAPIKey(key.id)} className="btn-revoke">
                      Revoke Key
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'docs' && (
        <div className="api-docs">
          <h3>REST API Documentation</h3>
          <div className="endpoint-section">
            <h4>Authentication</h4>
            <p>Include your API key in the Authorization header:</p>
            <pre>
              <code>Authorization: Bearer YOUR_API_KEY</code>
            </pre>
          </div>

          <div className="endpoint-section">
            <h4>Run a Workflow</h4>
            <div className="endpoint-card">
              <div className="method">POST</div>
              <code>/api/v1/workflows/{'{workflowId}'}/run</code>
            </div>
            <pre>
              <code>
{`curl -X POST https://api.crewai.com/api/v1/workflows/123/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": {
      "topic": "AI trends 2024"
    }
  }'`}
              </code>
            </pre>
          </div>

          <div className="endpoint-section">
            <h4>List Agents</h4>
            <div className="endpoint-card">
              <div className="method get">GET</div>
              <code>/api/v1/agents</code>
            </div>
            <pre>
              <code>
{`curl -X GET https://api.crewai.com/api/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </code>
            </pre>
          </div>

          <div className="endpoint-section">
            <h4>Create Agent</h4>
            <div className="endpoint-card">
              <div className="method">POST</div>
              <code>/api/v1/agents</code>
            </div>
            <pre>
              <code>
{`curl -X POST https://api.crewai.com/api/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Research Agent",
    "role": "Senior Researcher",
    "goal": "Find latest information",
    "backstory": "Expert in research"
  }'`}
              </code>
            </pre>
          </div>

          <h3>GraphQL API</h3>
          <div className="endpoint-section">
            <p>GraphQL endpoint:</p>
            <pre>
              <code>https://api.crewai.com/graphql</code>
            </pre>
          </div>

          <div className="endpoint-section">
            <h4>Example Query</h4>
            <pre>
              <code>
{`query {
  agents {
    id
    name
    role
    status
  }
  workflows {
    id
    name
    agents {
      name
    }
  }
}`}
              </code>
            </pre>
          </div>

          <div className="endpoint-section">
            <h4>Example Mutation</h4>
            <pre>
              <code>
{`mutation {
  runWorkflow(
    workflowId: "123"
    inputs: { topic: "AI trends 2024" }
  ) {
    runId
    status
    startedAt
  }
}`}
              </code>
            </pre>
          </div>
        </div>
      )}

      <style jsx>{`
        .api-access {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .tabs {
          display: flex;
          gap: 10px;
        }

        .tabs button {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.7);
          padding: 8px 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .tabs button.active {
          background: #00ff9f;
          color: #000;
          border-color: #00ff9f;
        }

        .subheader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .subheader p {
          color: rgba(255, 255, 255, 0.7);
        }

        .btn-create {
          background: #00ff9f;
          color: #000;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: #1a1a1a;
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal label {
          display: block;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .modal input,
        .modal select {
          display: block;
          width: 100%;
          padding: 10px;
          margin-top: 5px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        .permissions-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: normal;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-cancel {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-submit {
          flex: 1;
          background: #00ff9f;
          color: #000;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .keys-list {
          display: grid;
          gap: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .key-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
        }

        .key-card.inactive {
          opacity: 0.5;
        }

        .key-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .key-header h3 {
          margin: 0;
        }

        .key-type {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }

        .key-type.rest {
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
        }

        .key-type.graphql {
          background: rgba(255, 0, 128, 0.2);
          color: #ff0080;
        }

        .key-details {
          margin-bottom: 15px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .detail-row .label {
          color: rgba(255, 255, 255, 0.6);
          min-width: 80px;
        }

        .detail-row code {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
        }

        .btn-copy {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .permissions-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }

        .perm-tag {
          background: rgba(0, 255, 159, 0.2);
          color: #00ff9f;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
        }

        .btn-revoke {
          background: #ff4444;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .api-docs {
          max-width: 900px;
        }

        .endpoint-section {
          margin-bottom: 30px;
        }

        .endpoint-section h4 {
          margin-bottom: 10px;
        }

        .endpoint-card {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .method {
          background: #00ff9f;
          color: #000;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 13px;
        }

        .method.get {
          background: #00d4ff;
        }

        .api-docs pre {
          background: rgba(0, 0, 0, 0.5);
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
        }

        .api-docs code {
          color: #00ff9f;
          font-size: 13px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};
