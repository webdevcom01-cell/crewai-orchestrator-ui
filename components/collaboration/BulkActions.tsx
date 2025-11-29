// ============================================
// BULK ACTIONS COMPONENT
// Multi-select operacije za članove
// ============================================

import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  X,
  Shield,
  UserMinus,
  Mail,
  RefreshCw,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import type { MemberRole, BulkAction } from '../../types/collaboration';
import { ROLE_COLORS } from '../../types/collaboration';

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onExecuteAction: (action: BulkAction) => void;
  selectedMemberIds: string[];
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onExecuteAction,
  selectedMemberIds,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const roles: { value: MemberRole; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ];

  const handleChangeRole = (role: MemberRole) => {
    onExecuteAction({
      type: 'changeRole',
      memberIds: selectedMemberIds,
      payload: { role },
    });
    setShowRoleMenu(false);
  };

  const handleRemove = () => {
    onExecuteAction({
      type: 'remove',
      memberIds: selectedMemberIds,
    });
    setShowConfirmRemove(false);
  };

  const handleResendInvites = () => {
    onExecuteAction({
      type: 'resendInvite',
      memberIds: selectedMemberIds,
    });
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-600/20 via-purple-600/10 to-cyan-600/20 border border-cyan-500/30 rounded-xl animate-in slide-in-from-top-2 duration-300">
        {/* Selection info */}
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          <button
            onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {selectedCount === totalCount ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>

          {/* Count */}
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">
              {selectedCount} selected
            </span>
            <button
              onClick={onClearSelection}
              className="p-1 hover:bg-slate-700/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Change Role */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 rounded-lg text-slate-300 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Change Role</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showRoleMenu && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleChangeRole(role.value)}
                      className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                    >
                      <Shield className={`w-4 h-4 ${ROLE_COLORS[role.value].text}`} />
                      <span>{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resend Invites */}
          <button
            onClick={handleResendInvites}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 rounded-lg text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Resend Invites</span>
          </button>

          {/* Send Message */}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 rounded-lg text-slate-300 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Message</span>
          </button>

          {/* Remove */}
          <button
            onClick={() => setShowConfirmRemove(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-colors"
          >
            <UserMinus className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Confirm Remove Modal */}
      {showConfirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowConfirmRemove(false)}
          />
          
          <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Remove Members?
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-center mb-6">
                Are you sure you want to remove{' '}
                <span className="text-white font-medium">{selectedCount}</span>{' '}
                {selectedCount === 1 ? 'member' : 'members'} from this project?
                This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmRemove(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <UserMinus className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;
