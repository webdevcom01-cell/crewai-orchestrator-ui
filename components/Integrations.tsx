import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

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
      case 'slack':
        return '💬';
      case 'discord':
        return '🎮';
      case 'webhook':
        return '🔗';
    }
  };

  return (
    <div className="integrations">
      <div className="header">
        <h2>Integrations</h2>
        {hasPermission('settings:manage') && (
          <button onClick={() => setShowAddForm(true)} className="btn-add">
            + Add Integration
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Integration</h3>
            <form onSubmit={addIntegration}>
              <label>
                Type
                <select
                  value={newIntegration.type}
                  onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value as Integration['type'] })}
                >
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                  <option value="webhook">Custom Webhook</option>
                </select>
              </label>

              <label>
                Name
                <input
                  type="text"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  placeholder="e.g., Team Notifications"
                  required
                />
              </label>

              <label>
                Webhook URL
                <input
                  type="url"
                  value={newIntegration.url}
                  onChange={(e) => setNewIntegration({ ...newIntegration, url: e.target.value })}
                  placeholder="https://hooks.slack.com/..."
                  required
                />
              </label>

              {newIntegration.type !== 'webhook' && (
                <label>
                  Channel
                  <input
                    type="text"
                    value={newIntegration.channel}
                    onChange={(e) => setNewIntegration({ ...newIntegration, channel: e.target.value })}
                    placeholder="e.g., #general"
                  />
                </label>
              )}

              <label>
                Events to Notify
                <div className="events-checkbox-group">
                  {availableEvents.map((event) => (
                    <label key={event} className="checkbox-label">
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
                              events: newIntegration.events.filter((e) => e !== event),
                            });
                          }
                        }}
                      />
                      {event.replace(/_/g, ' ')}
                    </label>
                  ))}
                </div>
              </label>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="integrations-list">
        {integrations.length === 0 ? (
          <div className="empty-state">
            <p>No integrations configured yet</p>
            <p className="hint">Add integrations to receive notifications about workflow events</p>
          </div>
        ) : (
          integrations.map((integration) => (
            <div key={integration.id} className={`integration-card ${!integration.enabled ? 'disabled' : ''}`}>
              <div className="integration-header">
                <div className="integration-icon">{getIcon(integration.type)}</div>
                <div className="integration-info">
                  <h3>{integration.name}</h3>
                  <span className="integration-type">{integration.type}</span>
                </div>
                <div className="integration-actions">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={integration.enabled}
                      onChange={(e) => toggleIntegration(integration.id, e.target.checked)}
                      disabled={!hasPermission('settings:manage')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="integration-details">
                {integration.config.url && (
                  <div className="detail">
                    <span className="detail-label">URL:</span>
                    <code>{integration.config.url}</code>
                  </div>
                )}
                {integration.config.channel && (
                  <div className="detail">
                    <span className="detail-label">Channel:</span>
                    <code>{integration.config.channel}</code>
                  </div>
                )}
                {integration.config.events && integration.config.events.length > 0 && (
                  <div className="detail">
                    <span className="detail-label">Events:</span>
                    <div className="events-tags">
                      {integration.config.events.map((event) => (
                        <span key={event} className="event-tag">
                          {event.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {hasPermission('settings:manage') && (
                <div className="integration-footer">
                  <button onClick={() => testIntegration(integration.id)} className="btn-test">
                    Test
                  </button>
                  <button onClick={() => deleteIntegration(integration.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .integrations {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .btn-add {
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

        .modal h3 {
          margin-top: 0;
          margin-bottom: 20px;
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

        .events-checkbox-group {
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
          text-transform: capitalize;
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

        .integrations-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .hint {
          font-size: 14px;
          margin-top: 10px;
        }

        .integration-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
        }

        .integration-card.disabled {
          opacity: 0.5;
        }

        .integration-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .integration-icon {
          font-size: 32px;
        }

        .integration-info {
          flex: 1;
        }

        .integration-info h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
        }

        .integration-type {
          text-transform: capitalize;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.2);
          transition: 0.3s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: '';
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background-color: #00ff9f;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .integration-details {
          margin-bottom: 15px;
        }

        .detail {
          margin-bottom: 10px;
        }

        .detail-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-right: 8px;
        }

        .detail code {
          background: rgba(0, 0, 0, 0.3);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          word-break: break-all;
        }

        .events-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 5px;
        }

        .event-tag {
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          text-transform: capitalize;
        }

        .integration-footer {
          display: flex;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-test {
          background: #00d4ff;
          color: #000;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
        }

        .btn-delete {
          background: #ff4444;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
