// ============================================
// PERMISSIONS MATRIX COMPONENT
// Vizuelna matrica dozvola po rolama
// ============================================

import React, { useState } from 'react';
import {
  Shield,
  Check,
  X,
  Edit3,
  Save,
  RotateCcw,
  Info,
  Lock,
} from 'lucide-react';
import type { Permission, RolePermissions, MemberRole } from '../../types/collaboration';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ROLE_COLORS } from '../../types/collaboration';

interface PermissionsMatrixProps {
  onSave?: (permissions: RolePermissions[]) => void;
}

export const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({ onSave }) => {
  const [permissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>(DEFAULT_ROLE_PERMISSIONS);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const categories = ['agents', 'tasks', 'flows', 'team', 'settings'] as const;
  const roles: MemberRole[] = ['owner', 'admin', 'editor', 'viewer'];

  const getCategoryPermissions = (category: string) => {
    return permissions.filter(p => p.category === category);
  };

  const getRolePermission = (role: MemberRole, permissionId: string): boolean => {
    const rolePerms = rolePermissions.find(rp => rp.role === role);
    return rolePerms?.permissions[permissionId] ?? false;
  };

  const togglePermission = (role: MemberRole, permissionId: string) => {
    if (!isEditing || role === 'owner') return; // Owner always has all permissions

    setRolePermissions(prev =>
      prev.map(rp =>
        rp.role === role
          ? {
              ...rp,
              permissions: {
                ...rp.permissions,
                [permissionId]: !rp.permissions[permissionId],
              },
            }
          : rp
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(rolePermissions);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleReset = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setHasChanges(false);
  };

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    agents: { label: 'Agents', icon: '🤖' },
    tasks: { label: 'Tasks', icon: '📋' },
    flows: { label: 'Flows', icon: '🔄' },
    team: { label: 'Team', icon: '👥' },
    settings: { label: 'Settings', icon: '⚙️' },
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Role Permissions</h3>
            <p className="text-sm text-slate-400">Manage what each role can do</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                  ${hasChanges
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Permissions
            </button>
          )}
        </div>
      </div>

      {/* Info banner */}
      {isEditing && (
        <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-200/80">
            <p className="font-medium text-amber-400">Edit Mode Active</p>
            <p>Click on any permission to toggle it. Owner permissions cannot be changed.</p>
          </div>
        </div>
      )}

      {/* Permissions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header - Roles */}
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-4 text-slate-400 font-medium w-64">
                Permission
              </th>
              {roles.map(role => {
                const colors = ROLE_COLORS[role];
                return (
                  <th key={role} className="p-4 text-center w-28">
                    <div className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                      ${colors.bg} ${colors.text} ${colors.border} border
                    `}>
                      <Shield className="w-3 h-3" />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body - Categories & Permissions */}
          <tbody>
            {categories.map((category, catIndex) => (
              <React.Fragment key={category}>
                {/* Category Header */}
                <tr className={catIndex > 0 ? 'border-t border-slate-700/30' : ''}>
                  <td
                    colSpan={5}
                    className="px-4 py-3 bg-slate-800/30"
                  >
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <span>{categoryLabels[category].icon}</span>
                      <span>{categoryLabels[category].label}</span>
                    </div>
                  </td>
                </tr>

                {/* Permissions in category */}
                {getCategoryPermissions(category).map(permission => (
                  <tr
                    key={permission.id}
                    className="border-t border-slate-700/20 hover:bg-slate-700/10 transition-colors"
                  >
                    {/* Permission name */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-slate-300">{permission.name}</p>
                        <p className="text-xs text-slate-500">{permission.description}</p>
                      </div>
                    </td>

                    {/* Permission toggles per role */}
                    {roles.map(role => {
                      const hasPermission = getRolePermission(role, permission.id);
                      const isOwner = role === 'owner';
                      const isClickable = isEditing && !isOwner;

                      return (
                        <td key={role} className="p-4 text-center">
                          <button
                            onClick={() => togglePermission(role, permission.id)}
                            disabled={!isClickable}
                            className={`
                              inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all
                              ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                              ${hasPermission
                                ? isOwner
                                  ? 'bg-slate-700/50 text-slate-400'
                                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : isClickable
                                  ? 'bg-slate-700/30 text-slate-600 hover:bg-slate-700/50 hover:text-slate-400'
                                  : 'bg-slate-800/30 text-slate-700'
                              }
                            `}
                          >
                            {hasPermission ? (
                              isOwner ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
            <span>Allowed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-800/30 flex items-center justify-center">
              <X className="w-3 h-3 text-slate-700" />
            </div>
            <span>Denied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-700/50 flex items-center justify-center">
              <Lock className="w-3 h-3 text-slate-400" />
            </div>
            <span>Owner (Locked)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsMatrix;
