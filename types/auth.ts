export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type Permission =
  | 'workspace:read'
  | 'workspace:write'
  | 'workspace:delete'
  | 'agent:create'
  | 'agent:edit'
  | 'agent:delete'
  | 'agent:run'
  | 'task:create'
  | 'task:edit'
  | 'task:delete'
  | 'crew:create'
  | 'crew:edit'
  | 'crew:delete'
  | 'crew:run'
  | 'team:invite'
  | 'team:remove'
  | 'billing:manage'
  | 'settings:manage';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  workspaceId: string;
  permissions: Permission[];
  createdAt: string;
  lastActive: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  odred?: string;
  userId?: string;
  workspaceId: string;
  user: User;
  role: UserRole;
  invitedBy?: string;
  joinedAt: string;
}

export interface WorkspaceSettings {
  sso?: {
    enabled: boolean;
    provider: 'google' | 'github' | 'saml';
    domain?: string;
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    customDomain?: string;
  };
  integrations?: {
    slack?: { enabled: boolean; webhookUrl?: string };
    discord?: { enabled: boolean; webhookUrl?: string };
    git?: { enabled: boolean; provider?: 'github' | 'gitlab'; repo?: string };
  };
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'workspace:read',
    'workspace:write',
    'workspace:delete',
    'agent:create',
    'agent:edit',
    'agent:delete',
    'agent:run',
    'task:create',
    'task:edit',
    'task:delete',
    'crew:create',
    'crew:edit',
    'crew:delete',
    'crew:run',
    'team:invite',
    'team:remove',
    'billing:manage',
    'settings:manage',
  ],
  admin: [
    'workspace:read',
    'workspace:write',
    'agent:create',
    'agent:edit',
    'agent:delete',
    'agent:run',
    'task:create',
    'task:edit',
    'task:delete',
    'crew:create',
    'crew:edit',
    'crew:delete',
    'crew:run',
    'team:invite',
    'settings:manage',
  ],
  member: [
    'workspace:read',
    'agent:create',
    'agent:edit',
    'agent:run',
    'task:create',
    'task:edit',
    'crew:create',
    'crew:edit',
    'crew:run',
  ],
  viewer: ['workspace:read', 'agent:run', 'crew:run'],
};
