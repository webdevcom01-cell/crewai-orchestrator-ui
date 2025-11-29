// ============================================
// USE COLLABORATION HOOK
// State management i logika za Collaboration stranicu
// ============================================

import { useState, useMemo, useCallback } from 'react';
import type {
  TeamMember,
  Comment,
  ShareLink,
  Activity,
  TeamFilters,
  TeamAnalytics,
  MemberRole,
  BulkAction,
} from '../types/collaboration';

// Mock data generator
const generateMockMembers = (): TeamMember[] => [
  {
    id: '1',
    name: 'Marko Petrović',
    email: 'marko@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marko',
    role: 'owner',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
    bio: 'Full-stack developer sa 10+ godina iskustva',
    department: 'Engineering',
    timezone: 'Europe/Belgrade',
    skills: ['React', 'Node.js', 'Python', 'AI/ML'],
    tasksCompleted: 156,
    agentsCreated: 12,
    commentsCount: 89,
    notificationPreferences: { email: true, push: true, inApp: true, digest: 'daily' },
  },
  {
    id: '2',
    name: 'Ana Jovanović',
    email: 'ana@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-02-20'),
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
    bio: 'AI researcher i ML engineer',
    department: 'Research',
    timezone: 'Europe/Belgrade',
    skills: ['Python', 'TensorFlow', 'CrewAI', 'LangChain'],
    tasksCompleted: 98,
    agentsCreated: 24,
    commentsCount: 156,
    notificationPreferences: { email: true, push: false, inApp: true, digest: 'instant' },
  },
  {
    id: '3',
    name: 'Stefan Nikolić',
    email: 'stefan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stefan',
    role: 'editor',
    status: 'active',
    joinedAt: new Date('2024-03-10'),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    bio: 'Frontend developer fokusiran na UX',
    department: 'Design',
    timezone: 'Europe/Belgrade',
    skills: ['React', 'TypeScript', 'Tailwind', 'Figma'],
    tasksCompleted: 67,
    agentsCreated: 5,
    commentsCount: 234,
    notificationPreferences: { email: false, push: true, inApp: true, digest: 'weekly' },
  },
  {
    id: '4',
    name: 'Milica Đorđević',
    email: 'milica@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milica',
    role: 'viewer',
    status: 'offline',
    joinedAt: new Date('2024-04-05'),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    bio: 'Project manager i product owner',
    department: 'Product',
    timezone: 'Europe/Belgrade',
    skills: ['Agile', 'Scrum', 'JIRA', 'Product Strategy'],
    tasksCompleted: 23,
    agentsCreated: 0,
    commentsCount: 78,
    notificationPreferences: { email: true, push: true, inApp: true, digest: 'daily' },
  },
  {
    id: '5',
    name: 'Nikola Ilić',
    email: 'nikola@example.com',
    role: 'editor',
    status: 'pending',
    joinedAt: new Date('2024-11-25'),
    invitedBy: 'Marko Petrović',
    notificationPreferences: { email: true, push: false, inApp: false, digest: 'none' },
  },
  {
    id: '6',
    name: 'Jovana Marković',
    email: 'jovana@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jovana',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-06-12'),
    lastActive: new Date(Date.now() - 1000 * 60 * 15),
    bio: 'DevOps engineer i cloud architect',
    department: 'Infrastructure',
    timezone: 'Europe/Belgrade',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    tasksCompleted: 112,
    agentsCreated: 8,
    commentsCount: 145,
    notificationPreferences: { email: true, push: true, inApp: true, digest: 'instant' },
  },
];

const generateMockActivities = (): Activity[] => [
  {
    id: '1',
    type: 'created',
    userId: '2',
    userName: 'Ana Jovanović',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    targetId: 'agent-1',
    targetName: 'Research Agent',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'edited',
    userId: '3',
    userName: 'Stefan Nikolić',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stefan',
    targetId: 'task-5',
    targetName: 'Data Analysis Task',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    type: 'invited',
    userId: '1',
    userName: 'Marko Petrović',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marko',
    targetId: '5',
    targetName: 'Nikola Ilić',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    type: 'commented',
    userId: '6',
    userName: 'Jovana Marković',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jovana',
    targetId: 'flow-3',
    targetName: 'Content Pipeline',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: '5',
    type: 'role_changed',
    userId: '1',
    userName: 'Marko Petrović',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marko',
    targetId: '6',
    targetName: 'Jovana Marković',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    metadata: { oldRole: 'editor', newRole: 'admin' },
  },
];

const generateMockComments = (): Comment[] => [
  {
    id: '1',
    authorId: '2',
    authorName: 'Ana Jovanović',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    content: 'Odličan napredak na projektu! AI agenti rade savršeno.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    reactions: [
      { emoji: '👍', count: 3, users: ['1', '3', '6'] },
      { emoji: '🎉', count: 2, users: ['1', '4'] },
    ],
  },
  {
    id: '2',
    authorId: '3',
    authorName: 'Stefan Nikolić',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stefan',
    content: 'Da li možemo dodati još jedan task za testiranje novih modela?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    reactions: [{ emoji: '✅', count: 1, users: ['1'] }],
  },
  {
    id: '3',
    authorId: '1',
    authorName: 'Marko Petrović',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marko',
    content: '@Stefan naravno, dodaću to sutra. Imam ideju za optimizaciju flow-a.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    parentId: '2',
    mentions: ['3'],
  },
];

const generateMockShareLinks = (): ShareLink[] => [
  {
    id: '1',
    url: 'https://app.crewai.io/share/abc123xyz',
    permission: 'view',
    createdBy: 'Marko Petrović',
    createdAt: new Date('2024-11-20'),
    usageCount: 15,
    maxUses: 50,
  },
  {
    id: '2',
    url: 'https://app.crewai.io/share/def456uvw',
    permission: 'edit',
    expiresAt: new Date('2024-12-31'),
    createdBy: 'Ana Jovanović',
    createdAt: new Date('2024-11-25'),
    usageCount: 3,
    password: true,
  },
];

// Default filters
const defaultFilters: TeamFilters = {
  search: '',
  roles: [],
  statuses: [],
  sortBy: 'name',
  sortOrder: 'asc',
};

// Hook
export function useCollaboration() {
  // State
  const [members, setMembers] = useState<TeamMember[]>(generateMockMembers);
  const [activities] = useState<Activity[]>(generateMockActivities);
  const [comments, setComments] = useState<Comment[]>(generateMockComments);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(generateMockShareLinks);
  const [filters, setFilters] = useState<TeamFilters>(defaultFilters);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'team' | 'activity' | 'comments' | 'share' | 'permissions' | 'analytics'>('team');

  // Analytics data
  const analytics: TeamAnalytics = useMemo(() => {
    const activeMembers = members.filter(m => m.status === 'active');
    const pendingMembers = members.filter(m => m.status === 'pending');
    
    return {
      totalMembers: members.length,
      activeToday: activeMembers.filter(m => 
        m.lastActive && (Date.now() - m.lastActive.getTime()) < 1000 * 60 * 60 * 24
      ).length,
      pendingInvites: pendingMembers.length,
      avgResponseTime: 2.5,
      tasksCompletedThisWeek: 47,
      topContributors: members
        .filter(m => m.tasksCompleted)
        .sort((a, b) => (b.tasksCompleted || 0) - (a.tasksCompleted || 0))
        .slice(0, 5)
        .map(m => ({
          userId: m.id,
          name: m.name,
          avatar: m.avatar,
          score: m.tasksCompleted || 0,
        })),
      activityByDay: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10,
      })).reverse(),
      roleDistribution: [
        { role: 'owner' as const, count: members.filter(m => m.role === 'owner').length },
        { role: 'admin' as const, count: members.filter(m => m.role === 'admin').length },
        { role: 'editor' as const, count: members.filter(m => m.role === 'editor').length },
        { role: 'viewer' as const, count: members.filter(m => m.role === 'viewer').length },
      ],
    };
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        m.department?.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.roles.length > 0) {
      result = result.filter(m => filters.roles.includes(m.role));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter(m => filters.statuses.includes(m.status));
    }

    // Date range filter
    if (filters.dateRange) {
      result = result.filter(m => {
        const joinedAt = new Date(m.joinedAt);
        return joinedAt >= filters.dateRange!.from && joinedAt <= filters.dateRange!.to;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'role':
          const roleOrder = { owner: 0, admin: 1, editor: 2, viewer: 3 };
          comparison = roleOrder[a.role] - roleOrder[b.role];
          break;
        case 'status':
          const statusOrder = { active: 0, pending: 1, offline: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'joinedAt':
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
        case 'lastActive':
          const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          comparison = aTime - bTime;
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [members, filters]);

  // Actions
  const updateFilters = useCallback((newFilters: Partial<TeamFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const toggleMemberSelection = useCallback((memberId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  }, []);

  const selectAllMembers = useCallback(() => {
    setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
  }, [filteredMembers]);

  const clearSelection = useCallback(() => {
    setSelectedMembers(new Set());
  }, []);

  const changeMemberRole = useCallback((memberId: string, newRole: MemberRole) => {
    setMembers(prev =>
      prev.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  }, []);

  const removeMember = useCallback((memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      newSet.delete(memberId);
      return newSet;
    });
  }, []);

  const inviteMember = useCallback((email: string, role: MemberRole) => {
    const newMember: TeamMember = {
      id: `new-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      status: 'pending',
      joinedAt: new Date(),
      invitedBy: 'Current User',
    };
    setMembers(prev => [...prev, newMember]);
  }, []);

  const resendInvite = useCallback((memberId: string) => {
    // Simulate resending invite
    console.log('Resending invite to member:', memberId);
  }, []);

  const executeBulkAction = useCallback((action: BulkAction) => {
    switch (action.type) {
      case 'changeRole':
        setMembers(prev =>
          prev.map(m =>
            action.memberIds.includes(m.id)
              ? { ...m, role: action.payload.role }
              : m
          )
        );
        break;
      case 'remove':
        setMembers(prev => prev.filter(m => !action.memberIds.includes(m.id)));
        break;
      case 'resendInvite':
        action.memberIds.forEach(id => resendInvite(id));
        break;
    }
    clearSelection();
  }, [resendInvite, clearSelection]);

  const addComment = useCallback((content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: '1',
      authorName: 'Current User',
      content,
      createdAt: new Date(),
    };
    setComments(prev => [newComment, ...prev]);
  }, []);

  const createShareLink = useCallback((permission: ShareLink['permission'], expiresAt?: Date, maxUses?: number) => {
    const newLink: ShareLink = {
      id: `link-${Date.now()}`,
      url: `https://app.crewai.io/share/${Math.random().toString(36).substring(7)}`,
      permission,
      expiresAt,
      maxUses,
      createdBy: 'Current User',
      createdAt: new Date(),
      usageCount: 0,
    };
    setShareLinks(prev => [...prev, newLink]);
  }, []);

  const deleteShareLink = useCallback((linkId: string) => {
    setShareLinks(prev => prev.filter(l => l.id !== linkId));
  }, []);

  return {
    // Data
    members,
    filteredMembers,
    activities,
    comments,
    shareLinks,
    analytics,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Selection
    selectedMembers,
    toggleMemberSelection,
    selectAllMembers,
    clearSelection,
    
    // Navigation
    activeTab,
    setActiveTab,
    
    // Member actions
    changeMemberRole,
    removeMember,
    inviteMember,
    resendInvite,
    executeBulkAction,
    
    // Comments
    addComment,
    
    // Share links
    createShareLink,
    deleteShareLink,
  };
}

export type UseCollaborationReturn = ReturnType<typeof useCollaboration>;
