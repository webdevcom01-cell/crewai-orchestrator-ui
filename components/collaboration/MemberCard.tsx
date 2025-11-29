// ============================================
// MEMBER CARD COMPONENT
// 3D hover efekti, profile modal, akcije
// ============================================

import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Clock,
  Shield,
  MoreVertical,
  MessageSquare,
  UserMinus,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Briefcase,
  Globe,
  Phone,
  Award,
  BarChart3,
  X,
} from 'lucide-react';
import type { TeamMember, MemberRole } from '../../types/collaboration';
import { ROLE_COLORS, STATUS_COLORS } from '../../types/collaboration';

interface MemberCardProps {
  member: TeamMember;
  isSelected: boolean;
  onToggleSelect: () => void;
  onChangeRole: (role: MemberRole) => void;
  onRemove: () => void;
  onResendInvite: () => void;
  onMessage?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isSelected,
  onToggleSelect,
  onChangeRole,
  onRemove,
  onResendInvite,
  onMessage,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const roleColors = ROLE_COLORS[member.role];
  const statusColors = STATUS_COLORS[member.status];

  const formatLastActive = (date?: Date) => {
    if (!date) return 'Nikad';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Sada';
    if (minutes < 60) return `Pre ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Pre ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Pre ${days} dana`;
  };

  const roles: MemberRole[] = ['owner', 'admin', 'editor', 'viewer'];

  return (
    <>
      {/* Main Card */}
      <div
        ref={cardRef}
        className="relative group"
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePosition({ x: 0, y: 0 });
        }}
        onMouseMove={handleMouseMove}
      >
        <div
          className={`
            relative bg-gradient-to-br from-slate-800/80 to-slate-900/80
            border rounded-xl p-4 transition-all duration-300
            ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-700/50'}
            ${isHovered ? 'shadow-2xl shadow-cyan-500/10' : ''}
          `}
          style={{
            transform: isHovered
              ? `rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) translateZ(10px)`
              : 'rotateY(0) rotateX(0) translateZ(0)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Glow effect */}
          {isHovered && (
            <div
              className="absolute inset-0 rounded-xl opacity-50 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(6, 182, 212, 0.15), transparent 50%)`,
              }}
            />
          )}

          {/* Selection checkbox */}
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                ${isSelected
                  ? 'bg-cyan-500 border-cyan-500'
                  : 'border-slate-600 hover:border-cyan-500/50'
                }
              `}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Menu button */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                {onMessage && (
                  <button
                    onClick={() => {
                      onMessage();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                )}
                {member.status === 'pending' && (
                  <button
                    onClick={() => {
                      onResendInvite();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-amber-400 hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend Invite
                  </button>
                )}
                <button
                  onClick={() => {
                    onRemove();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <UserMinus className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Avatar & Info */}
          <div 
            className="flex items-start gap-4 pt-6 cursor-pointer"
            onClick={() => setShowProfile(true)}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0" style={{ transform: 'translateZ(20px)' }}>
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-14 h-14 rounded-full ring-2 ring-slate-700"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center ring-2 ring-slate-700">
                  <span className="text-xl font-bold text-white">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
              {/* Status indicator */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-800 ${statusColors.dot}`}
              >
                {member.status === 'active' && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-75" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0" style={{ transform: 'translateZ(15px)' }}>
              <h3 className="font-semibold text-white truncate">{member.name}</h3>
              <p className="text-sm text-slate-400 truncate flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {member.email}
              </p>
              {member.department && (
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {member.department}
                </p>
              )}
            </div>
          </div>

          {/* Role & Status */}
          <div className="flex items-center gap-2 mt-4" style={{ transform: 'translateZ(10px)' }}>
            {/* Role badge with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border
                  ${roleColors.bg} ${roleColors.text} ${roleColors.border}
                  hover:brightness-110 transition-all
                `}
              >
                <Shield className="w-3 h-3" />
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showRoleMenu && (
                <div className="absolute top-full left-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onChangeRole(role);
                        setShowRoleMenu(false);
                      }}
                      className={`
                        w-full px-3 py-2 text-left text-sm flex items-center gap-2
                        ${member.role === role ? 'bg-slate-700/50 text-cyan-400' : 'text-slate-300 hover:bg-slate-700/50'}
                      `}
                    >
                      <Shield className={`w-3 h-3 ${ROLE_COLORS[role].text}`} />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                      {member.role === role && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status badge */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
              {member.status === 'active' ? 'Active' : member.status === 'pending' ? 'Pending' : 'Offline'}
            </span>
          </div>

          {/* Last active */}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {member.status === 'pending' ? (
              <span>Invited by {member.invitedBy}</span>
            ) : (
              <span>Last active: {formatLastActive(member.lastActive)}</span>
            )}
          </div>

          {/* Stats (if available) */}
          {member.tasksCompleted !== undefined && (
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-center">
                <p className="text-sm font-semibold text-cyan-400">{member.tasksCompleted}</p>
                <p className="text-xs text-slate-500">Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-purple-400">{member.agentsCreated || 0}</p>
                <p className="text-xs text-slate-500">Agents</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-amber-400">{member.commentsCount || 0}</p>
                <p className="text-xs text-slate-500">Comments</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <MemberProfileModal
          member={member}
          onClose={() => setShowProfile(false)}
          onChangeRole={onChangeRole}
          onRemove={onRemove}
          onMessage={onMessage}
        />
      )}
    </>
  );
};

// ============================================
// MEMBER PROFILE MODAL
// ============================================

interface MemberProfileModalProps {
  member: TeamMember;
  onClose: () => void;
  onChangeRole: (role: MemberRole) => void;
  onRemove: () => void;
  onMessage?: () => void;
}

const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  member,
  onClose,
  onChangeRole,
  onRemove,
  onMessage,
}) => {
  const roleColors = ROLE_COLORS[member.role];
  const statusColors = STATUS_COLORS[member.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with avatar */}
        <div className="relative h-32 bg-gradient-to-r from-cyan-600/30 via-purple-600/30 to-pink-600/30">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar overlapping header */}
        <div className="relative px-6 -mt-12">
          <div className="relative inline-block">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 rounded-full ring-4 ring-slate-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center ring-4 ring-slate-800">
                <span className="text-3xl font-bold text-white">
                  {member.name.charAt(0)}
                </span>
              </div>
            )}
            <div
              className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-slate-800 ${statusColors.dot}`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Name & Role */}
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-white">{member.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}>
                <Shield className="w-3 h-3 inline mr-1" />
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Bio */}
          {member.bio && (
            <p className="mt-4 text-slate-400 text-sm">{member.bio}</p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">{member.email}</span>
            </div>
            {member.department && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span className="text-slate-400">{member.department}</span>
              </div>
            )}
            {member.timezone && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400">{member.timezone}</span>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">{member.phone}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {member.skills && member.skills.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {member.tasksCompleted !== undefined && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Statistics
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{member.tasksCompleted}</p>
                  <p className="text-xs text-slate-500 mt-1">Tasks Done</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">{member.agentsCreated || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Agents</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">{member.commentsCount || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Comments</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
            {onMessage && (
              <button
                onClick={onMessage}
                className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            )}
            <button
              onClick={onRemove}
              className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <UserMinus className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
