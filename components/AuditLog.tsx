import React, { useState, useMemo, useCallback } from 'react';
import { 
  FileText, Search, Filter, Calendar, Download, RefreshCw,
  User, Bot, CheckSquare, Play, Settings, Trash2, Edit3,
  Plus, Eye, ArrowUpRight, Clock, ChevronDown, ChevronRight,
  AlertTriangle, Info, CheckCircle, XCircle, Shield
} from 'lucide-react';

// =============================================================================
// Audit Log - Praćenje svih akcija u sistemu
// =============================================================================

type ActionType = 'create' | 'update' | 'delete' | 'view' | 'run' | 'export' | 'login' | 'settings';
type EntityType = 'agent' | 'task' | 'flow' | 'user' | 'workspace' | 'system';
type Severity = 'info' | 'warning' | 'error' | 'success';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: ActionType;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  description: string;
  severity: Severity;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Mock audit log data
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2024-11-29T14:30:00',
    userId: 'user-1',
    userName: 'Marko Petrović',
    userEmail: 'marko@company.com',
    action: 'create',
    entityType: 'agent',
    entityId: 'research_agent',
    entityName: 'ResearchAgent',
    description: 'Created new agent "ResearchAgent" with role "Senior Researcher"',
    severity: 'success',
    metadata: { role: 'Senior Researcher', model: 'gemini-2.5-flash' },
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-2',
    timestamp: '2024-11-29T14:25:00',
    userId: 'user-2',
    userName: 'Ana Jovanović',
    userEmail: 'ana@company.com',
    action: 'update',
    entityType: 'task',
    entityId: 'research_task',
    entityName: 'Research Phase',
    description: 'Updated task description and expected output',
    severity: 'info',
    metadata: { fieldsChanged: ['description', 'expectedOutput'] },
    ipAddress: '192.168.1.101',
  },
  {
    id: 'log-3',
    timestamp: '2024-11-29T14:20:00',
    userId: 'user-1',
    userName: 'Marko Petrović',
    userEmail: 'marko@company.com',
    action: 'run',
    entityType: 'flow',
    entityId: 'main_flow',
    entityName: 'Research → Dev Flow',
    description: 'Started simulation run #42',
    severity: 'info',
    metadata: { runId: '42', inputs: { feature: 'User Authentication' } },
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-4',
    timestamp: '2024-11-29T14:15:00',
    userId: 'user-3',
    userName: 'Stefan Nikolić',
    userEmail: 'stefan@company.com',
    action: 'delete',
    entityType: 'agent',
    entityId: 'old_agent',
    entityName: 'OldAgent',
    description: 'Deleted agent "OldAgent"',
    severity: 'warning',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'log-5',
    timestamp: '2024-11-29T14:10:00',
    userId: 'user-1',
    userName: 'Marko Petrović',
    userEmail: 'marko@company.com',
    action: 'export',
    entityType: 'workspace',
    description: 'Exported crew configuration as Python code',
    severity: 'success',
    metadata: { format: 'python', agents: 4, tasks: 4 },
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-6',
    timestamp: '2024-11-29T14:00:00',
    userId: 'user-2',
    userName: 'Ana Jovanović',
    userEmail: 'ana@company.com',
    action: 'settings',
    entityType: 'workspace',
    description: 'Changed workspace settings - enabled verbose logging',
    severity: 'info',
    metadata: { setting: 'verboseLogging', value: true },
    ipAddress: '192.168.1.101',
  },
  {
    id: 'log-7',
    timestamp: '2024-11-29T13:55:00',
    userId: 'user-4',
    userName: 'Milica Đorđević',
    userEmail: 'milica@company.com',
    action: 'login',
    entityType: 'user',
    description: 'User logged in successfully',
    severity: 'success',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: 'log-8',
    timestamp: '2024-11-29T13:50:00',
    userId: 'system',
    userName: 'System',
    userEmail: 'system@crewai.app',
    action: 'run',
    entityType: 'system',
    description: 'Simulation run #41 completed with errors',
    severity: 'error',
    metadata: { runId: '41', error: 'Agent timeout after 30s' },
  },
  {
    id: 'log-9',
    timestamp: '2024-11-29T13:45:00',
    userId: 'user-1',
    userName: 'Marko Petrović',
    userEmail: 'marko@company.com',
    action: 'create',
    entityType: 'task',
    entityId: 'new_task',
    entityName: 'Validation Phase',
    description: 'Created new task "Validation Phase"',
    severity: 'success',
    metadata: { isEntrypoint: false, agentId: 'qa_agent' },
    ipAddress: '192.168.1.100',
  },
  {
    id: 'log-10',
    timestamp: '2024-11-29T13:40:00',
    userId: 'user-3',
    userName: 'Stefan Nikolić',
    userEmail: 'stefan@company.com',
    action: 'view',
    entityType: 'flow',
    entityId: 'main_flow',
    entityName: 'Research → Dev Flow',
    description: 'Viewed flow configuration',
    severity: 'info',
    ipAddress: '192.168.1.102',
  },
];

const ACTION_CONFIG: Record<ActionType, { icon: React.ElementType; label: string; color: string }> = {
  create: { icon: Plus, label: 'Create', color: 'text-emerald-400 bg-emerald-500/20' },
  update: { icon: Edit3, label: 'Update', color: 'text-cyan-400 bg-cyan-500/20' },
  delete: { icon: Trash2, label: 'Delete', color: 'text-red-400 bg-red-500/20' },
  view: { icon: Eye, label: 'View', color: 'text-slate-400 bg-slate-500/20' },
  run: { icon: Play, label: 'Run', color: 'text-purple-400 bg-purple-500/20' },
  export: { icon: ArrowUpRight, label: 'Export', color: 'text-amber-400 bg-amber-500/20' },
  login: { icon: User, label: 'Login', color: 'text-blue-400 bg-blue-500/20' },
  settings: { icon: Settings, label: 'Settings', color: 'text-orange-400 bg-orange-500/20' },
};

const ENTITY_CONFIG: Record<EntityType, { icon: React.ElementType; label: string }> = {
  agent: { icon: Bot, label: 'Agent' },
  task: { icon: CheckSquare, label: 'Task' },
  flow: { icon: Play, label: 'Flow' },
  user: { icon: User, label: 'User' },
  workspace: { icon: Shield, label: 'Workspace' },
  system: { icon: Settings, label: 'System' },
};

const SEVERITY_CONFIG: Record<Severity, { icon: React.ElementType; color: string }> = {
  info: { icon: Info, color: 'text-blue-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  error: { icon: XCircle, color: 'text-red-400' },
  success: { icon: CheckCircle, color: 'text-emerald-400' },
};

interface LogEntryRowProps {
  entry: AuditLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

const LogEntryRow: React.FC<LogEntryRowProps> = ({ entry, isExpanded, onToggle }) => {
  const actionConfig = ACTION_CONFIG[entry.action];
  const entityConfig = ENTITY_CONFIG[entry.entityType];
  const severityConfig = SEVERITY_CONFIG[entry.severity];
  const ActionIcon = actionConfig.icon;
  const EntityIcon = entityConfig.icon;
  const SeverityIcon = severityConfig.icon;

  const formattedTime = new Date(entry.timestamp).toLocaleString('sr-RS', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="border-b border-cyan-500/10 last:border-0">
      <div 
        onClick={onToggle}
        className="p-4 hover:bg-cyan-500/5 transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-4">
          {/* Severity Indicator */}
          <div className={`mt-1 ${severityConfig.color}`}>
            <SeverityIcon size={16} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {/* Action Badge */}
              <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${actionConfig.color}`}>
                <ActionIcon size={10} />
                {actionConfig.label}
              </span>
              
              {/* Entity Badge */}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 flex items-center gap-1">
                <EntityIcon size={10} />
                {entityConfig.label}
                {entry.entityName && `: ${entry.entityName}`}
              </span>
            </div>

            <p className="text-sm text-slate-300">{entry.description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User size={12} />
                {entry.userName}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formattedTime}
              </span>
              {entry.ipAddress && (
                <span className="font-mono">{entry.ipAddress}</span>
              )}
            </div>
          </div>

          {/* Expand Indicator */}
          <button className="p-1 text-slate-500 hover:text-white transition-colors">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && entry.metadata && (
        <div className="px-4 pb-4 ml-10">
          <div className="p-3 bg-[#0a1628] border border-cyan-500/10 rounded-lg">
            <p className="text-xs text-slate-500 mb-2 font-medium">Metadata</p>
            <pre className="text-xs font-mono text-slate-400 overflow-x-auto">
              {JSON.stringify(entry.metadata, null, 2)}
            </pre>
            {entry.userAgent && (
              <div className="mt-2 pt-2 border-t border-cyan-500/10">
                <p className="text-xs text-slate-500">User Agent: <span className="text-slate-400">{entry.userAgent}</span></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AuditLog: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<ActionType | 'all'>('all');
  const [selectedEntity, setSelectedEntity] = useState<EntityType | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Action filter
      const matchesAction = selectedAction === 'all' || log.action === selectedAction;

      // Entity filter
      const matchesEntity = selectedEntity === 'all' || log.entityType === selectedEntity;

      // Severity filter
      const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

      // Date filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateRange === 'today') matchesDate = daysDiff === 0;
        else if (dateRange === 'week') matchesDate = daysDiff <= 7;
        else if (dateRange === 'month') matchesDate = daysDiff <= 30;
      }

      return matchesSearch && matchesAction && matchesEntity && matchesSeverity && matchesDate;
    });
  }, [logs, searchQuery, selectedAction, selectedEntity, selectedSeverity, dateRange]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Description', 'Severity', 'IP Address'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userName,
        log.action,
        `${log.entityType}${log.entityName ? `: ${log.entityName}` : ''}`,
        log.description,
        log.severity,
        log.ipAddress || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [filteredLogs]);

  // Stats
  const stats = useMemo(() => ({
    total: logs.length,
    today: logs.filter(l => {
      const logDate = new Date(l.timestamp).toDateString();
      return logDate === new Date().toDateString();
    }).length,
    errors: logs.filter(l => l.severity === 'error').length,
    warnings: logs.filter(l => l.severity === 'warning').length,
  }), [logs]);

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <FileText size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Audit Log</h1>
              <p className="text-sm text-slate-400 font-mono">workspace.audit</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 text-slate-400 hover:text-white border border-cyan-500/20 hover:border-cyan-500/30 rounded-lg transition-all hover:bg-cyan-500/10"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all font-medium text-sm hover:shadow-[0_0_20px_rgba(34,197,220,0.2)]"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Entries', value: stats.total, color: 'text-white' },
            { label: 'Today', value: stats.today, color: 'text-cyan-400' },
            { label: 'Errors', value: stats.errors, color: 'text-red-400' },
            { label: 'Warnings', value: stats.warnings, color: 'text-amber-400' },
          ].map((stat, i) => (
            <div 
              key={i}
              className="p-4 rounded-xl bg-[#080F1A]/60 backdrop-blur-sm border border-cyan-500/10 hover:border-cyan-500/30 cursor-default"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
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
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.02)`;
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 220, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as ActionType | 'all')}
              className="bg-[#080F1A] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 text-sm"
            >
              <option value="all">All Actions</option>
              {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Entity Filter */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value as EntityType | 'all')}
            className="bg-[#080F1A] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 text-sm"
          >
            <option value="all">All Entities</option>
            {Object.entries(ENTITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as Severity | 'all')}
            className="bg-[#080F1A] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 text-sm"
          >
            <option value="all">All Severity</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="bg-[#080F1A] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-slate-500">
          Showing {filteredLogs.length} of {logs.length} entries
        </div>

        {/* Logs List */}
        <div className="rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 overflow-hidden">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <LogEntryRow
                key={log.id}
                entry={log}
                isExpanded={expandedIds.has(log.id)}
                onToggle={() => toggleExpand(log.id)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText size={48} className="mx-auto mb-4 opacity-30" />
              <p>No log entries found</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedAction('all');
                  setSelectedEntity('all');
                  setSelectedSeverity('all');
                  setDateRange('all');
                }}
                className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        {filteredLogs.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Showing all {filteredLogs.length} entries</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
