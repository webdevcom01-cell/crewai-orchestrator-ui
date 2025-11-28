import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { TeamManagement } from './TeamManagement';
import { VersionControl } from './VersionControl';
import { Monitoring } from './Monitoring';
import { Integrations } from './Integrations';
import { Marketplace } from './Marketplace';
import { ModelSwitcher } from './ModelSwitcher';
import { Scheduler } from './Scheduler';
import { APIAccess } from './APIAccess';
import { WhiteLabel } from './WhiteLabel';
import { Billing } from './Billing';

interface EnterpriseSettingsProps {
  workspaceId: string;
}

export const EnterpriseSettings: React.FC<EnterpriseSettingsProps> = ({ workspaceId }) => {
  const { user, hasPermission } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('team');

  const sections = [
    { id: 'team', label: 'Team', icon: '👥', permission: 'workspace:read' },
    { id: 'billing', label: 'Billing', icon: '💳', permission: 'billing:manage' },
    { id: 'analytics', label: 'Analytics', icon: '📊', permission: 'workspace:read' },
    { id: 'versions', label: 'Version Control', icon: '🔄', permission: 'workspace:read' },
    { id: 'integrations', label: 'Integrations', icon: '🔗', permission: 'settings:manage' },
    { id: 'scheduler', label: 'Scheduler', icon: '⏰', permission: 'settings:manage' },
    { id: 'marketplace', label: 'Marketplace', icon: '🏪', permission: 'agent:create' },
    { id: 'api', label: 'API Access', icon: '🔑', permission: 'settings:manage' },
    { id: 'ai-models', label: 'AI Models', icon: '🤖', permission: 'settings:manage' },
    { id: 'branding', label: 'White Label', icon: '🎨', permission: 'settings:manage' },
  ];

  const visibleSections = sections.filter((section) => hasPermission(section.permission as any));

  const renderSection = () => {
    switch (activeSection) {
      case 'team':
        return <TeamManagement workspaceId={workspaceId} />;
      case 'billing':
        return <Billing workspaceId={workspaceId} />;
      case 'analytics':
        return <Monitoring workspaceId={workspaceId} />;
      case 'versions':
        return <VersionControl workspaceId={workspaceId} />;
      case 'integrations':
        return <Integrations workspaceId={workspaceId} />;
      case 'scheduler':
        return <Scheduler workspaceId={workspaceId} />;
      case 'marketplace':
        return <Marketplace workspaceId={workspaceId} />;
      case 'api':
        return <APIAccess workspaceId={workspaceId} />;
      case 'ai-models':
        return (
          <div style={{ padding: '20px' }}>
            <h2>AI Model Configuration</h2>
            <ModelSwitcher workspaceId={workspaceId} />
          </div>
        );
      case 'branding':
        return <WhiteLabel workspaceId={workspaceId} />;
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="enterprise-settings">
      <div className="settings-layout">
        <div className="settings-sidebar">
          <div className="user-info">
            <div className="user-avatar">{user?.name.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>

          <nav className="settings-nav">
            {visibleSections.map((section) => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-content">{renderSection()}</div>
      </div>

      <style jsx>{`
        .enterprise-settings {
          min-height: 100vh;
          background: #0a0a0a;
        }

        .settings-layout {
          display: flex;
          height: 100vh;
        }

        .settings-sidebar {
          width: 280px;
          background: rgba(255, 255, 255, 0.02);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px;
          overflow-y: auto;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 25px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ff9f, #00d4ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
          color: #000;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 2px;
        }

        .user-role {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: capitalize;
        }

        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 15px;
          text-align: left;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: rgba(0, 255, 159, 0.15);
          color: #00ff9f;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 20px;
        }

        .settings-content {
          flex: 1;
          overflow-y: auto;
          background: #0a0a0a;
        }

        @media (max-width: 768px) {
          .settings-layout {
            flex-direction: column;
          }

          .settings-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .settings-nav {
            flex-direction: row;
            overflow-x: auto;
          }

          .nav-item {
            flex-direction: column;
            min-width: 80px;
            text-align: center;
          }

          .nav-label {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};
