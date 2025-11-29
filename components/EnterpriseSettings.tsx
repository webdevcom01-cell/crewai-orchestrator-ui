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
import { Users, CreditCard, BarChart3, GitBranch, Link2, Clock, Store, Key, Bot, Palette } from 'lucide-react';

interface EnterpriseSettingsProps {
  workspaceId: string;
}

const sectionIcons: Record<string, React.ElementType> = {
  team: Users,
  billing: CreditCard,
  analytics: BarChart3,
  versions: GitBranch,
  integrations: Link2,
  scheduler: Clock,
  marketplace: Store,
  api: Key,
  'ai-models': Bot,
  branding: Palette,
};

export const EnterpriseSettings: React.FC<EnterpriseSettingsProps> = ({ workspaceId }) => {
  const { user, hasPermission } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('team');

  const sections = [
    { id: 'team', label: 'Team', permission: 'workspace:read' },
    { id: 'billing', label: 'Billing', permission: 'billing:manage' },
    { id: 'analytics', label: 'Analytics', permission: 'workspace:read' },
    { id: 'versions', label: 'Version Control', permission: 'workspace:read' },
    { id: 'integrations', label: 'Integrations', permission: 'settings:manage' },
    { id: 'scheduler', label: 'Scheduler', permission: 'settings:manage' },
    { id: 'marketplace', label: 'Marketplace', permission: 'agent:create' },
    { id: 'api', label: 'API Access', permission: 'settings:manage' },
    { id: 'ai-models', label: 'AI Models', permission: 'settings:manage' },
    { id: 'branding', label: 'White Label', permission: 'settings:manage' },
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
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">AI Model Configuration</h2>
            <ModelSwitcher workspaceId={workspaceId} />
          </div>
        );
      case 'branding':
        return <WhiteLabel workspaceId={workspaceId} />;
      default:
        return <div className="p-8 text-slate-400">Select a section</div>;
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 lg:w-72 border-r border-cyan-500/15 flex flex-col">
        {/* User Info */}
        <div className="p-4 border-b border-cyan-500/10">
          <div className="flex items-center gap-3 p-3 bg-[#080F1A]/60 rounded-xl border border-cyan-500/10">
            <div 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-sm text-black cursor-pointer"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) / (rect.width / 2);
                const deltaY = (e.clientY - centerY) / (rect.height / 2);
                const tiltX = deltaY * -12;
                const tiltY = deltaX * 12;
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.15)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) / (rect.width / 2);
                const deltaY = (e.clientY - centerY) / (rect.height / 2);
                const tiltX = deltaY * -8;
                const tiltY = deltaX * 8;
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px) scale(1.05)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
              }}
            >
              <div className="font-medium text-white truncate text-sm">{user?.name || 'User'}</div>
              <div className="text-xs text-cyan-500/60 capitalize">{user?.role || 'member'}</div>
            </div>
            <div 
              className="p-2 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) / (rect.width / 2);
                const deltaY = (e.clientY - centerY) / (rect.height / 2);
                const tiltX = deltaY * -12;
                const tiltY = deltaX * 12;
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.1)`;
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(34, 197, 220, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Users size={18} className="text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {visibleSections.map((section) => {
            const Icon = sectionIcons[section.id] || Users;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderSection()}
      </div>
    </div>
  );
};
