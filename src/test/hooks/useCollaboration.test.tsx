/**
 * useCollaboration Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollaboration } from '../../../hooks/useCollaboration';

// Mock data
const mockMembers = [
  {
    id: 'member_1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner' as const,
    status: 'online' as const,
    avatar: 'https://example.com/avatar1.jpg',
    joinedAt: '2024-01-01T00:00:00Z',
    lastActive: new Date().toISOString(),
    permissions: ['read', 'write', 'delete', 'admin'],
  },
  {
    id: 'member_2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'editor' as const,
    status: 'away' as const,
    avatar: 'https://example.com/avatar2.jpg',
    joinedAt: '2024-02-01T00:00:00Z',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    permissions: ['read', 'write'],
  },
  {
    id: 'member_3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'viewer' as const,
    status: 'offline' as const,
    avatar: null,
    joinedAt: '2024-03-01T00:00:00Z',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    permissions: ['read'],
  },
];

describe('useCollaboration Hook', () => {
  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useCollaboration());

      expect(result.current.members).toEqual([]);
      expect(result.current.filteredMembers).toEqual([]);
      expect(result.current.selectedMembers).toEqual([]);
      expect(result.current.searchQuery).toBe('');
    });

    it('should initialize with provided members', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      expect(result.current.members).toHaveLength(3);
      expect(result.current.filteredMembers).toHaveLength(3);
    });
  });

  describe('Filtering', () => {
    it('should filter by search query', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.setSearchQuery('john');
      });

      expect(result.current.filteredMembers).toHaveLength(2);
      expect(result.current.filteredMembers.some(m => m.name.toLowerCase().includes('john'))).toBe(true);
    });

    it('should filter by role', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.setRoleFilter('viewer');
      });

      expect(result.current.filteredMembers).toHaveLength(1);
      expect(result.current.filteredMembers[0].role).toBe('viewer');
    });

    it('should filter by status', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.setStatusFilter('online');
      });

      expect(result.current.filteredMembers).toHaveLength(1);
      expect(result.current.filteredMembers[0].status).toBe('online');
    });

    it('should combine multiple filters', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.setSearchQuery('j');
        result.current.setStatusFilter('online');
      });

      expect(result.current.filteredMembers).toHaveLength(1);
      expect(result.current.filteredMembers[0].name).toBe('John Doe');
    });

    it('should clear filters', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.setSearchQuery('test');
        result.current.setRoleFilter('admin');
        result.current.setStatusFilter('offline');
        result.current.clearFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.roleFilter).toBe('all');
      expect(result.current.statusFilter).toBe('all');
      expect(result.current.filteredMembers).toHaveLength(3);
    });
  });

  describe('Selection', () => {
    it('should select a member', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.toggleMemberSelection('member_1');
      });

      expect(result.current.selectedMembers).toContain('member_1');
    });

    it('should deselect a member', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.toggleMemberSelection('member_1');
        result.current.toggleMemberSelection('member_1');
      });

      expect(result.current.selectedMembers).not.toContain('member_1');
    });

    it('should select all members', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.selectAllMembers();
      });

      expect(result.current.selectedMembers).toHaveLength(3);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.selectAllMembers();
        result.current.clearSelection();
      });

      expect(result.current.selectedMembers).toHaveLength(0);
    });
  });

  describe('CRUD Operations', () => {
    it('should add a new member', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      const newMember = {
        id: 'member_new',
        name: 'New Member',
        email: 'new@example.com',
        role: 'viewer' as const,
        status: 'online' as const,
        avatar: null,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        permissions: ['read'],
      };

      act(() => {
        result.current.addMember(newMember);
      });

      expect(result.current.members).toHaveLength(4);
      expect(result.current.members.find(m => m.id === 'member_new')).toBeDefined();
    });

    it('should update a member', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.updateMember('member_1', { name: 'Updated Name' });
      });

      expect(result.current.members.find(m => m.id === 'member_1')?.name).toBe('Updated Name');
    });

    it('should remove a member', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.removeMember('member_1');
      });

      expect(result.current.members).toHaveLength(2);
      expect(result.current.members.find(m => m.id === 'member_1')).toBeUndefined();
    });

    it('should update member role', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.updateMemberRole('member_3', 'editor');
      });

      expect(result.current.members.find(m => m.id === 'member_3')?.role).toBe('editor');
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk update role for selected members', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.toggleMemberSelection('member_2');
        result.current.toggleMemberSelection('member_3');
        result.current.bulkUpdateRole('admin');
      });

      expect(result.current.members.find(m => m.id === 'member_2')?.role).toBe('admin');
      expect(result.current.members.find(m => m.id === 'member_3')?.role).toBe('admin');
    });

    it('should bulk remove selected members', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.toggleMemberSelection('member_2');
        result.current.toggleMemberSelection('member_3');
        result.current.bulkRemove();
      });

      expect(result.current.members).toHaveLength(1);
      expect(result.current.members[0].id).toBe('member_1');
    });
  });

  describe('Statistics', () => {
    it('should calculate member statistics', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      const stats = result.current.getStats();

      expect(stats.total).toBe(3);
      expect(stats.online).toBe(1);
      expect(stats.away).toBe(1);
      expect(stats.offline).toBe(1);
      expect(stats.byRole.owner).toBe(1);
      expect(stats.byRole.editor).toBe(1);
      expect(stats.byRole.viewer).toBe(1);
    });
  });

  describe('Invite Links', () => {
    it('should generate invite link', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.createInviteLink('editor', 7);
      });

      expect(result.current.inviteLinks).toHaveLength(1);
      expect(result.current.inviteLinks[0].role).toBe('editor');
      expect(result.current.inviteLinks[0].maxUses).toBe(undefined);
    });

    it('should revoke invite link', () => {
      const { result } = renderHook(() => useCollaboration(mockMembers));

      act(() => {
        result.current.createInviteLink('viewer', 1);
      });

      const linkId = result.current.inviteLinks[0].id;

      act(() => {
        result.current.revokeInviteLink(linkId);
      });

      expect(result.current.inviteLinks.find(l => l.id === linkId)?.isActive).toBe(false);
    });
  });
});
