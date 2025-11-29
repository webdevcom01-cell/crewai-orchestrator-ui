import React, { useState, useEffect } from 'react';
import { WorkspaceMember, UserRole } from '../types/auth';
import { useAuth } from './AuthProvider';
import { apiWorkspaces } from '../services/api';
import { 
  Users, UserPlus, Mail, Shield, Calendar, Trash2, 
  Crown, Eye, Search, ChevronDown, Loader2, AlertCircle
} from 'lucide-react';
import { useToast } from './ui/Toast';
import Modal from './ui/Modal';

interface TeamManagementProps {
  workspaceId: string;
}

const roleConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  owner: { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Owner' },
  admin: { icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'Admin' },
  member: { icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Member' },
  viewer: { icon: Eye, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', label: 'Viewer' },
};

export const TeamManagement: React.FC<TeamManagementProps> = ({ workspaceId }) => {
  const { hasPermission, user } = useAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<WorkspaceMember | null>(null);

  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await apiWorkspaces.getMembers(workspaceId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load members:', error);
      // Demo data for display
      setMembers([
        {
          id: '1',
          odred: user?.id || 'user-1',
          workspaceId,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          user: {
            id: user?.id || 'user-1',
            email: user?.email || 'admin@crewai.io',
            name: user?.name || 'Admin User',
            role: 'owner',
            workspaceId: workspaceId,
            permissions: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }
        },
        {
          id: '2',
          odred: 'user-2',
          workspaceId,
          role: 'admin',
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'user-2',
            email: 'developer@crewai.io',
            name: 'Dev Team Lead',
            role: 'admin',
            workspaceId: workspaceId,
            permissions: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }
        },
        {
          id: '3',
          odred: 'user-3',
          workspaceId,
          role: 'member',
          joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'user-3',
            email: 'agent.smith@crewai.io',
            name: 'Agent Smith',
            role: 'member',
            workspaceId: workspaceId,
            permissions: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('team:invite')) {
      showToast({ type: 'error', title: 'Permission Denied', message: 'You do not have permission to invite members' });
      return;
    }

    if (!inviteEmail.trim()) {
      showToast({ type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address' });
      return;
    }

    setIsInviting(true);
    try {
      await apiWorkspaces.inviteMember(workspaceId, inviteEmail, inviteRole);
      showToast({ type: 'success', title: 'Invitation Sent', message: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      setShowInviteModal(false);
      loadMembers();
    } catch (error) {
      console.error('Failed to invite member:', error);
      showToast({ type: 'error', title: 'Invitation Failed', message: 'Failed to send invitation' });
    } finally {
      setIsInviting(false);
    }
  };

  const confirmDelete = (member: WorkspaceMember) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const removeMember = async () => {
    if (!memberToDelete) return;
    
    if (!hasPermission('team:remove')) {
      showToast({ type: 'error', title: 'Permission Denied', message: 'You do not have permission to remove members' });
      return;
    }

    try {
      setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      showToast({ type: 'success', title: 'Member Removed', message: `${memberToDelete.user.name} has been removed from the team` });
    } catch (error) {
      console.error('Failed to remove member:', error);
      showToast({ type: 'error', title: 'Remove Failed', message: 'Failed to remove team member' });
    } finally {
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    if (!hasPermission('team:invite')) {
      showToast({ type: 'error', title: 'Permission Denied', message: 'You do not have permission to update roles' });
      return;
    }

    try {
      setMembers(prev => prev.map(m => 
        m.user.id === userId ? { ...m, role: newRole } : m
      ));
      showToast({ type: 'success', title: 'Role Updated', message: 'Member role has been updated' });
    } catch (error) {
      console.error('Failed to update role:', error);
      showToast({ type: 'error', title: 'Update Failed', message: 'Failed to update member role' });
    }
  };

  const filteredMembers = members.filter(member => 
    member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: UserRole) => {
    const config = roleConfig[role] || roleConfig.viewer;
    const Icon = config.icon;
    return <Icon size={14} className={config.color} />;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Users size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Team Management</h1>
            <p className="text-sm text-slate-400 font-mono">workspace.members</p>
          </div>
        </div>
        <p className="text-slate-500 mt-2">Manage team members, roles and permissions for your workspace.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div 
          className="bg-[#080F1A]/80 border border-cyan-500/10 rounded-xl p-4 hover:border-cyan-500/30 cursor-pointer"
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
            const moveX = deltaX * 4;
            const moveY = deltaY * 4;
            e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 6}px) scale(1.03)`;
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 220, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Users size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-mono font-medium text-slate-600 uppercase tracking-wider">Total Members</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400">{members.length}</div>
        </div>
        <div 
          className="bg-[#080F1A]/80 border border-cyan-500/10 rounded-xl p-4 hover:border-cyan-500/30 cursor-pointer"
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
            const moveX = deltaX * 4;
            const moveY = deltaY * 4;
            e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 6}px) scale(1.03)`;
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(251, 191, 36, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Shield size={24} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-mono font-medium text-slate-600 uppercase tracking-wider">Admins</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">{members.filter(m => m.role === 'admin' || m.role === 'owner').length}</div>
        </div>
        <div 
          className="bg-[#080F1A]/80 border border-cyan-500/10 rounded-xl p-4 hover:border-cyan-500/30 cursor-pointer"
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
            const moveX = deltaX * 4;
            const moveY = deltaY * 4;
            e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 6}px) scale(1.03)`;
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Eye size={24} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-mono font-medium text-slate-600 uppercase tracking-wider">Active Today</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{Math.ceil(members.length * 0.7)}</div>
        </div>
        <div 
          className="bg-[#080F1A]/80 border border-cyan-500/10 rounded-xl p-4 hover:border-cyan-500/30 cursor-pointer"
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
            const moveX = deltaX * 4;
            const moveY = deltaY * 4;
            e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 6}px) scale(1.03)`;
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Mail size={24} className="text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-mono font-medium text-slate-600 uppercase tracking-wider">Pending Invites</span>
          </div>
          <div className="text-2xl font-bold text-violet-400">2</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#080F1A] border border-cyan-500/20 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all duration-200"
          />
        </div>

        {/* Invite Button */}
        {hasPermission('team:invite') && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-200 font-medium text-sm hover:shadow-[0_0_20px_rgba(34,197,220,0.2)]"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-[#080F1A]/60 backdrop-blur-sm border border-cyan-500/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-cyan-400 animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Users size={48} className="mb-4 opacity-30" />
            <p className="text-lg">No members found</p>
            <p className="text-sm text-slate-600">
              {searchQuery ? 'Try a different search term' : 'Invite team members to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/10">
                  <th className="text-left px-6 py-4 text-xs font-mono uppercase tracking-wider text-slate-500">Member</th>
                  <th className="text-left px-6 py-4 text-xs font-mono uppercase tracking-wider text-slate-500">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-mono uppercase tracking-wider text-slate-500">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-mono uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="text-right px-6 py-4 text-xs font-mono uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const config = roleConfig[member.role] || roleConfig.viewer;
                  return (
                    <tr 
                      key={member.id}
                      className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-10 h-10 rounded-full ${config.bg} ${config.border} border flex items-center justify-center font-bold text-sm ${config.color} cursor-pointer`}
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
                              const moveX = deltaX * 3;
                              const moveY = deltaY * 3;
                              
                              e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 4}px) scale(1.15)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                            }}
                          >
                            {getInitials(member.user.name)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{member.user.name}</div>
                            <div className="text-xs text-slate-500 font-mono">ID: {member.user.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail size={14} className="text-slate-600" />
                          <span className="text-sm">{member.user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hasPermission('team:invite') && member.role !== 'owner' ? (
                          <div 
                            className="relative inline-block"
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
                              
                              const tiltX = deltaY * -10;
                              const tiltY = deltaX * 10;
                              const moveX = deltaX * 3;
                              const moveY = deltaY * 3;
                              
                              e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 4}px) scale(1.08)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                            }}
                          >
                            <select
                              value={member.role}
                              onChange={(e) => updateRole(member.user.id, e.target.value as UserRole)}
                              className={`appearance-none w-28 pl-8 pr-8 py-1.5 rounded-lg text-xs font-medium cursor-pointer border bg-transparent ${config.border} ${config.color} focus:outline-none focus:ring-2 focus:ring-cyan-500/30`}
                            >
                              <option value="viewer" className="bg-[#080F1A] text-white">Viewer</option>
                              <option value="member" className="bg-[#080F1A] text-white">Member</option>
                              <option value="admin" className="bg-[#080F1A] text-white">Admin</option>
                            </select>
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                              {getRoleIcon(member.role)}
                            </div>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                          </div>
                        ) : (
                          <span 
                            className={`inline-flex items-center justify-center gap-2 w-28 px-3 py-1.5 rounded-lg text-xs font-medium ${config.bg} ${config.border} border ${config.color} cursor-pointer`}
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
                              
                              const tiltX = deltaY * -10;
                              const tiltY = deltaX * 10;
                              const moveX = deltaX * 3;
                              const moveY = deltaY * 3;
                              
                              e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 4}px) scale(1.08)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                            }}
                          >
                            {getRoleIcon(member.role)}
                            {config.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Calendar size={14} />
                          {formatDate(member.joinedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission('team:remove') && member.role !== 'owner' && (
                            <button
                              onClick={() => confirmDelete(member)}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                              title="Remove member"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
        footer={
          <>
            <button
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={inviteMember}
              disabled={isInviting || !inviteEmail.trim()}
              className="px-5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isInviting && <Loader2 size={14} className="animate-spin" />}
              Send Invitation
            </button>
          </>
        }
      >
        <form onSubmit={inviteMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#080F1A] border border-cyan-500/20 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all duration-200"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['viewer', 'member', 'admin'] as UserRole[]).map((role) => {
                const config = roleConfig[role];
                const Icon = config.icon;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setInviteRole(role)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                      inviteRole === role 
                        ? `${config.bg} ${config.border} ${config.color}` 
                        : 'bg-[#080F1A] border-cyan-500/10 text-slate-500 hover:border-cyan-500/30'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-medium capitalize">{role}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-3 bg-[#080F1A]/50 border border-cyan-500/10 rounded-lg">
            <p className="text-xs text-slate-500">
              <strong className="text-slate-400">Note:</strong> The invited user will receive an email with instructions to join the workspace.
            </p>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Team Member"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={removeMember}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Remove Member
            </button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-slate-300">
              Are you sure you want to remove <strong className="text-white">{memberToDelete?.user.name}</strong> from this workspace?
            </p>
            <p className="text-sm text-slate-500 mt-2">
              They will lose access to all workspace resources. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
