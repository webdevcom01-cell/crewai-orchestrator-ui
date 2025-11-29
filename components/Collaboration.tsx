// ============================================
// COLLABORATION PAGE - MAIN COMPONENT
// Glavni layout sa svim komponentama
// ============================================

import React, { useState } from 'react';
import {
  Users,
  Activity,
  MessageSquare,
  Share2,
  Shield,
  BarChart3,
  UserPlus,
  X,
  Mail,
  ChevronDown,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Clock,
  Trash2,
  Lock,
  Send,
} from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';
import { MemberCard } from './collaboration/MemberCard';
import { TeamFilters } from './collaboration/TeamFilters';
import { BulkActions } from './collaboration/BulkActions';
import { TeamStats } from './collaboration/TeamStats';
import { ActivityTimeline } from './collaboration/ActivityTimeline';
import { PermissionsMatrix } from './collaboration/PermissionsMatrix';
import { TeamAnalytics } from './collaboration/TeamAnalytics';
import type { MemberRole, ShareLink } from '../types/collaboration';
import { ROLE_COLORS } from '../types/collaboration';

type TabId = 'team' | 'activity' | 'comments' | 'share' | 'permissions' | 'analytics';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
  { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  { id: 'comments', label: 'Comments', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'share', label: 'Share', icon: <Share2 className="w-4 h-4" /> },
  { id: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
];

export const Collaboration: React.FC = () => {
  const {
    members,
    filteredMembers,
    activities,
    comments,
    shareLinks,
    analytics,
    filters,
    updateFilters,
    resetFilters,
    selectedMembers,
    toggleMemberSelection,
    selectAllMembers,
    clearSelection,
    activeTab,
    setActiveTab,
    changeMemberRole,
    removeMember,
    inviteMember,
    resendInvite,
    executeBulkAction,
    addComment,
    createShareLink,
    deleteShareLink,
  } = useCollaboration();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('editor');
  const [newComment, setNewComment] = useState('');

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your team, permissions, and collaboration settings
          </p>
        </div>

        {/* Invite Button */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          style={{ perspective: '500px' }}
        >
          <UserPlus className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Stats Cards */}
      <TeamStats analytics={analytics} />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            {/* Filters */}
            <TeamFilters
              filters={filters}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
              totalCount={members.length}
              filteredCount={filteredMembers.length}
            />

            {/* Bulk Actions */}
            <BulkActions
              selectedCount={selectedMembers.size}
              totalCount={filteredMembers.length}
              onSelectAll={selectAllMembers}
              onClearSelection={clearSelection}
              onExecuteAction={executeBulkAction}
              selectedMemberIds={Array.from(selectedMembers)}
            />

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isSelected={selectedMembers.has(member.id)}
                  onToggleSelect={() => toggleMemberSelection(member.id)}
                  onChangeRole={(role) => changeMemberRole(member.id, role)}
                  onRemove={() => removeMember(member.id)}
                  onResendInvite={() => resendInvite(member.id)}
                />
              ))}
            </div>

            {/* Empty state */}
            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No members found</h3>
                <p className="text-slate-400">
                  {filters.search || filters.roles.length || filters.statuses.length
                    ? 'Try adjusting your filters'
                    : 'Invite team members to get started'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <ActivityTimeline activities={activities} maxItems={20} />
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Project Comments
            </h3>

            {/* New Comment Input */}
            <div className="flex gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">Y</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none transition-all"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${newComment.trim()
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    <Send className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
                >
                  {comment.authorAvatar ? (
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {comment.authorName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{comment.authorName}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300">{comment.content}</p>
                    
                    {/* Reactions */}
                    {comment.reactions && comment.reactions.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {comment.reactions.map((reaction, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-slate-600/50 rounded-full text-sm flex items-center gap-1 hover:bg-slate-600 cursor-pointer transition-colors"
                          >
                            {reaction.emoji}
                            <span className="text-slate-400 text-xs">{reaction.count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Tab */}
        {activeTab === 'share' && (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-cyan-400" />
                Share Links
              </h3>
              <button
                onClick={() => createShareLink('view')}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Create Link
              </button>
            </div>

            {/* Share Links List */}
            <div className="space-y-4">
              {shareLinks.map((link) => (
                <ShareLinkItem
                  key={link.id}
                  link={link}
                  onDelete={() => deleteShareLink(link.id)}
                />
              ))}

              {shareLinks.length === 0 && (
                <div className="text-center py-8">
                  <LinkIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No share links created yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <PermissionsMatrix onSave={(perms) => console.log('Saved permissions:', perms)} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <TeamAnalytics analytics={analytics} />
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          email={inviteEmail}
          role={inviteRole}
          onEmailChange={setInviteEmail}
          onRoleChange={setInviteRole}
          onInvite={handleInvite}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

// ============================================
// SHARE LINK ITEM COMPONENT
// ============================================

interface ShareLinkItemProps {
  link: ShareLink;
  onDelete: () => void;
}

const ShareLinkItem: React.FC<ShareLinkItemProps> = ({ link, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const permissionColors = {
    view: 'bg-slate-500/20 text-slate-400',
    edit: 'bg-purple-500/20 text-purple-400',
    admin: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
      {/* Link info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${permissionColors[link.permission]}`}>
            {link.permission}
          </span>
          {link.password && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Lock className="w-3 h-3" />
              Password
            </span>
          )}
          {link.expiresAt && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              Expires {new Date(link.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400 truncate">{link.url}</p>
        <p className="text-xs text-slate-500 mt-1">
          Used {link.usageCount} {link.maxUses ? `/ ${link.maxUses}` : ''} times • 
          Created by {link.createdBy}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className={`
            p-2 rounded-lg transition-all
            ${copied
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-slate-600/50 text-slate-400 hover:text-white'
            }
          `}
        >
          {copied ? <span className="text-xs">Copied!</span> : <Copy className="w-4 h-4" />}
        </button>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-slate-600/50 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={onDelete}
          className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// INVITE MODAL COMPONENT
// ============================================

interface InviteModalProps {
  email: string;
  role: MemberRole;
  onEmailChange: (email: string) => void;
  onRoleChange: (role: MemberRole) => void;
  onInvite: () => void;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  email,
  role,
  onEmailChange,
  onRoleChange,
  onInvite,
  onClose,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roles: MemberRole[] = ['admin', 'editor', 'viewer'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            Invite Team Member
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Role Select */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white hover:border-slate-500 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${ROLE_COLORS[role].text}`} />
                  <span className="capitalize">{role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        setShowRoleMenu(false);
                      }}
                      className={`
                        w-full px-4 py-3 flex items-center gap-2 text-left transition-colors
                        ${role === r
                          ? 'bg-slate-700/50 text-cyan-400'
                          : 'text-slate-300 hover:bg-slate-700/30'
                        }
                      `}
                    >
                      <Shield className={`w-4 h-4 ${ROLE_COLORS[r].text}`} />
                      <div>
                        <p className="font-medium capitalize">{r}</p>
                        <p className="text-xs text-slate-500">
                          {r === 'admin' && 'Full access to most features'}
                          {r === 'editor' && 'Can create and edit content'}
                          {r === 'viewer' && 'Read-only access'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onInvite}
            disabled={!email.trim()}
            className={`
              flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all
              ${email.trim()
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <UserPlus className="w-4 h-4" />
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default Collaboration;
