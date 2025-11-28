import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

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
    { label: 'Every day at midnight', value: '0 0 * * *' },
    { label: 'Every Monday at 9am', value: '0 9 * * 1' },
    { label: 'Every 1st of month', value: '0 0 1 * *' },
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
      const config: any = {};
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
      case 'cron':
        return '⏰';
      case 'interval':
        return '🔄';
      case 'webhook':
        return '🔗';
    }
  };

  return (
    <div className="scheduler">
      <div className="header">
        <h2>Workflow Scheduler</h2>
        {hasPermission('settings:manage') && (
          <button onClick={() => setShowAddForm(true)} className="btn-add">
            + Add Schedule
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Schedule</h3>
            <form onSubmit={addSchedule}>
              <label>
                Schedule Name
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="Daily Report Generation"
                  required
                />
              </label>

              <label>
                Workflow
                <select
                  value={newSchedule.workflowId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, workflowId: e.target.value })}
                  required
                >
                  <option value="">Select workflow...</option>
                  {workflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Trigger Type
                <select
                  value={newSchedule.type}
                  onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value as Schedule['type'] })}
                >
                  <option value="cron">Cron Schedule</option>
                  <option value="interval">Fixed Interval</option>
                  <option value="webhook">Webhook Trigger</option>
                </select>
              </label>

              {newSchedule.type === 'cron' && (
                <>
                  <label>
                    Cron Expression
                    <input
                      type="text"
                      value={newSchedule.cron}
                      onChange={(e) => setNewSchedule({ ...newSchedule, cron: e.target.value })}
                      placeholder="0 0 * * *"
                      required
                    />
                  </label>
                  <div className="cron-presets">
                    <span>Presets:</span>
                    {cronPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setNewSchedule({ ...newSchedule, cron: preset.value })}
                        className="preset-btn"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {newSchedule.type === 'interval' && (
                <label>
                  Interval (seconds)
                  <input
                    type="number"
                    value={newSchedule.interval}
                    onChange={(e) => setNewSchedule({ ...newSchedule, interval: parseInt(e.target.value) })}
                    min="60"
                    required
                  />
                  <div className="interval-hint">
                    {newSchedule.interval < 3600
                      ? `Every ${Math.floor(newSchedule.interval / 60)} minutes`
                      : `Every ${Math.floor(newSchedule.interval / 3600)} hours`}
                  </div>
                </label>
              )}

              {newSchedule.type === 'webhook' && (
                <>
                  <label>
                    Webhook Secret (optional)
                    <input
                      type="text"
                      value={newSchedule.webhookSecret}
                      onChange={(e) => setNewSchedule({ ...newSchedule, webhookSecret: e.target.value })}
                      placeholder="Leave empty for auto-generated"
                    />
                  </label>
                  <div className="webhook-info">
                    Webhook URL will be generated after creation
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="schedules-list">
        {schedules.length === 0 ? (
          <div className="empty-state">
            <p>No schedules configured</p>
            <p className="hint">Create schedules to automate your workflows</p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule.id} className={`schedule-card ${!schedule.enabled ? 'disabled' : ''}`}>
              <div className="schedule-header">
                <div className="schedule-icon">{getTypeIcon(schedule.type)}</div>
                <div className="schedule-info">
                  <h3>{schedule.name}</h3>
                  <span className="workflow-name">{schedule.workflowName}</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) => toggleSchedule(schedule.id, e.target.checked)}
                    disabled={!hasPermission('settings:manage')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="schedule-details">
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{schedule.type}</span>
                </div>
                {schedule.config.cron && (
                  <div className="detail-row">
                    <span className="label">Cron:</span>
                    <code>{schedule.config.cron}</code>
                  </div>
                )}
                {schedule.config.interval && (
                  <div className="detail-row">
                    <span className="label">Interval:</span>
                    <span className="value">Every {schedule.config.interval / 60} minutes</span>
                  </div>
                )}
                {schedule.config.webhookUrl && (
                  <div className="detail-row">
                    <span className="label">Webhook:</span>
                    <code className="webhook-url">{schedule.config.webhookUrl}</code>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Runs:</span>
                  <span className="value">{schedule.runCount}</span>
                </div>
                {schedule.lastRun && (
                  <div className="detail-row">
                    <span className="label">Last Run:</span>
                    <span className="value">{new Date(schedule.lastRun).toLocaleString()}</span>
                  </div>
                )}
                {schedule.nextRun && (
                  <div className="detail-row">
                    <span className="label">Next Run:</span>
                    <span className="value next-run">{new Date(schedule.nextRun).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {hasPermission('settings:manage') && (
                <div className="schedule-actions">
                  <button onClick={() => runNow(schedule.id)} className="btn-run">
                    Run Now
                  </button>
                  <button onClick={() => deleteSchedule(schedule.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .scheduler {
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

        .cron-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
          font-size: 12px;
        }

        .preset-btn {
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          padding: 4px 8px;
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }

        .interval-hint,
        .webhook-info {
          margin-top: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
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

        .schedules-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .schedule-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
        }

        .schedule-card.disabled {
          opacity: 0.5;
        }

        .schedule-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .schedule-icon {
          font-size: 32px;
        }

        .schedule-info {
          flex: 1;
        }

        .schedule-info h3 {
          margin: 0 0 5px 0;
        }

        .workflow-name {
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

        .schedule-details {
          margin-bottom: 15px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .detail-row .label {
          color: rgba(255, 255, 255, 0.6);
        }

        .detail-row code {
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .webhook-url {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .next-run {
          color: #00ff9f;
          font-weight: bold;
        }

        .schedule-actions {
          display: flex;
          gap: 10px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-run {
          background: #00d4ff;
          color: #000;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-delete {
          background: #ff4444;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
