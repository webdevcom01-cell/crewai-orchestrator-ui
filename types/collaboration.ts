// ============================================
// COLLABORATION TYPES & INTERFACES
// ============================================

export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type MemberStatus = 'active' | 'pending' | 'offline';
export type ActivityType = 'joined' | 'created' | 'edited' | 'deleted' | 'commented' | 'invited' | 'role_changed';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActive?: Date;
  invitedBy?: string;
  // Extended profile
  bio?: string;
  department?: string;
  timezone?: string;
  phone?: string;
  skills?: string[];
  // Stats
  tasksCompleted?: number;
  agentsCreated?: number;
  commentsCount?: number;
  // Notifications
  notificationPreferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  digest: 'instant' | 'daily' | 'weekly' | 'none';
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string;
  reactions?: CommentReaction[];
  mentions?: string[];
}

export interface CommentReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ShareLink {
  id: string;
  url: string;
  permission: 'view' | 'edit' | 'admin';
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  maxUses?: number;
  password?: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId?: string;
  targetName?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'agents' | 'tasks' | 'flows' | 'team' | 'settings';
}

export interface RolePermissions {
  role: MemberRole;
  permissions: {
    [key: string]: boolean;
  };
}

export interface TeamAnalytics {
  totalMembers: number;
  activeToday: number;
  pendingInvites: number;
  avgResponseTime: number;
  tasksCompletedThisWeek: number;
  topContributors: {
    userId: string;
    name: string;
    avatar?: string;
    score: number;
  }[];
  activityByDay: {
    date: string;
    count: number;
  }[];
  roleDistribution: {
    role: MemberRole;
    count: number;
  }[];
}

// Filter types
export interface TeamFilters {
  search: string;
  roles: MemberRole[];
  statuses: MemberStatus[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy: 'name' | 'role' | 'status' | 'joinedAt' | 'lastActive';
  sortOrder: 'asc' | 'desc';
}

// Bulk action types
export interface BulkAction {
  type: 'changeRole' | 'remove' | 'resendInvite' | 'sendMessage';
  memberIds: string[];
  payload?: any;
}

// Default permissions matrix
export const DEFAULT_PERMISSIONS: Permission[] = [
  { id: 'agents_view', name: 'View Agents', description: 'Can view all agents', category: 'agents' },
  { id: 'agents_create', name: 'Create Agents', description: 'Can create new agents', category: 'agents' },
  { id: 'agents_edit', name: 'Edit Agents', description: 'Can edit existing agents', category: 'agents' },
  { id: 'agents_delete', name: 'Delete Agents', description: 'Can delete agents', category: 'agents' },
  { id: 'tasks_view', name: 'View Tasks', description: 'Can view all tasks', category: 'tasks' },
  { id: 'tasks_create', name: 'Create Tasks', description: 'Can create new tasks', category: 'tasks' },
  { id: 'tasks_edit', name: 'Edit Tasks', description: 'Can edit existing tasks', category: 'tasks' },
  { id: 'tasks_delete', name: 'Delete Tasks', description: 'Can delete tasks', category: 'tasks' },
  { id: 'flows_view', name: 'View Flows', description: 'Can view all flows', category: 'flows' },
  { id: 'flows_create', name: 'Create Flows', description: 'Can create new flows', category: 'flows' },
  { id: 'flows_edit', name: 'Edit Flows', description: 'Can edit existing flows', category: 'flows' },
  { id: 'flows_execute', name: 'Execute Flows', description: 'Can run flows', category: 'flows' },
  { id: 'team_view', name: 'View Team', description: 'Can view team members', category: 'team' },
  { id: 'team_invite', name: 'Invite Members', description: 'Can invite new members', category: 'team' },
  { id: 'team_manage', name: 'Manage Team', description: 'Can change roles and remove members', category: 'team' },
  { id: 'settings_view', name: 'View Settings', description: 'Can view project settings', category: 'settings' },
  { id: 'settings_edit', name: 'Edit Settings', description: 'Can modify project settings', category: 'settings' },
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'owner',
    permissions: Object.fromEntries(DEFAULT_PERMISSIONS.map(p => [p.id, true])),
  },
  {
    role: 'admin',
    permissions: {
      agents_view: true, agents_create: true, agents_edit: true, agents_delete: true,
      tasks_view: true, tasks_create: true, tasks_edit: true, tasks_delete: true,
      flows_view: true, flows_create: true, flows_edit: true, flows_execute: true,
      team_view: true, team_invite: true, team_manage: true,
      settings_view: true, settings_edit: false,
    },
  },
  {
    role: 'editor',
    permissions: {
      agents_view: true, agents_create: true, agents_edit: true, agents_delete: false,
      tasks_view: true, tasks_create: true, tasks_edit: true, tasks_delete: false,
      flows_view: true, flows_create: true, flows_edit: true, flows_execute: true,
      team_view: true, team_invite: false, team_manage: false,
      settings_view: true, settings_edit: false,
    },
  },
  {
    role: 'viewer',
    permissions: {
      agents_view: true, agents_create: false, agents_edit: false, agents_delete: false,
      tasks_view: true, tasks_create: false, tasks_edit: false, tasks_delete: false,
      flows_view: true, flows_create: false, flows_edit: false, flows_execute: false,
      team_view: true, team_invite: false, team_manage: false,
      settings_view: false, settings_edit: false,
    },
  },
];

// Role colors
export const ROLE_COLORS: Record<MemberRole, { bg: string; text: string; border: string }> = {
  owner: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  admin: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  editor: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  viewer: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

// Status colors
export const STATUS_COLORS: Record<MemberStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  offline: { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
};
