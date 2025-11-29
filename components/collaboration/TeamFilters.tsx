// ============================================
// TEAM FILTERS COMPONENT
// Napredni filteri sa dropdowns
// ============================================

import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  SortAsc,
  SortDesc,
  Calendar,
  Shield,
  Activity,
} from 'lucide-react';
import type { TeamFilters as TeamFiltersType, MemberRole, MemberStatus } from '../../types/collaboration';
import { ROLE_COLORS, STATUS_COLORS } from '../../types/collaboration';

interface TeamFiltersProps {
  filters: TeamFiltersType;
  onUpdateFilters: (filters: Partial<TeamFiltersType>) => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export const TeamFilters: React.FC<TeamFiltersProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
  totalCount,
  filteredCount,
}) => {
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const roles: { value: MemberRole; label: string }[] = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' },
  ];

  const statuses: { value: MemberStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'offline', label: 'Offline' },
  ];

  const sortOptions: { value: TeamFiltersType['sortBy']; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'role', label: 'Role' },
    { value: 'status', label: 'Status' },
    { value: 'joinedAt', label: 'Join Date' },
    { value: 'lastActive', label: 'Last Active' },
  ];

  const toggleRole = (role: MemberRole) => {
    const newRoles = filters.roles.includes(role)
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    onUpdateFilters({ roles: newRoles });
  };

  const toggleStatus = (status: MemberStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onUpdateFilters({ statuses: newStatuses });
  };

  const hasActiveFilters = filters.search || filters.roles.length > 0 || filters.statuses.length > 0;

  return (
    <div className="space-y-4">
      {/* Search & Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="Search members by name, email, department..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleFilter(!showRoleFilter);
              setShowStatusFilter(false);
              setShowSortMenu(false);
            }}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all
              ${filters.roles.length > 0
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }
            `}
          >
            <Shield className="w-4 h-4" />
            <span>Role</span>
            {filters.roles.length > 0 && (
              <span className="px-1.5 py-0.5 bg-cyan-500/20 rounded-full text-xs">
                {filters.roles.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>

          {showRoleFilter && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => toggleRole(role.value)}
                    className={`
                      w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors
                      ${filters.roles.includes(role.value)
                        ? 'bg-slate-700/50 text-white'
                        : 'text-slate-400 hover:bg-slate-700/30'
                      }
                    `}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      filters.roles.includes(role.value)
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-slate-600'
                    }`}>
                      {filters.roles.includes(role.value) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <Shield className={`w-3.5 h-3.5 ${ROLE_COLORS[role.value].text}`} />
                    <span>{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStatusFilter(!showStatusFilter);
              setShowRoleFilter(false);
              setShowSortMenu(false);
            }}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all
              ${filters.statuses.length > 0
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }
            `}
          >
            <Activity className="w-4 h-4" />
            <span>Status</span>
            {filters.statuses.length > 0 && (
              <span className="px-1.5 py-0.5 bg-cyan-500/20 rounded-full text-xs">
                {filters.statuses.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>

          {showStatusFilter && (
            <div className="absolute top-full left-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-2">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => toggleStatus(status.value)}
                    className={`
                      w-full px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors
                      ${filters.statuses.includes(status.value)
                        ? 'bg-slate-700/50 text-white'
                        : 'text-slate-400 hover:bg-slate-700/30'
                      }
                    `}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      filters.statuses.includes(status.value)
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-slate-600'
                    }`}>
                      {filters.statuses.includes(status.value) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status.value].dot}`} />
                    <span>{status.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowRoleFilter(false);
              setShowStatusFilter(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:border-slate-600 transition-all"
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
            <span className="capitalize">{filters.sortBy}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showSortMenu && (
            <div className="absolute top-full right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (filters.sortBy === option.value) {
                        onUpdateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
                      } else {
                        onUpdateFilters({ sortBy: option.value, sortOrder: 'asc' });
                      }
                      setShowSortMenu(false);
                    }}
                    className={`
                      w-full px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors
                      ${filters.sortBy === option.value
                        ? 'bg-slate-700/50 text-cyan-400'
                        : 'text-slate-400 hover:bg-slate-700/30'
                      }
                    `}
                  >
                    <span>{option.label}</span>
                    {filters.sortBy === option.value && (
                      filters.sortOrder === 'asc' ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Active Filters & Results count */}
      <div className="flex items-center justify-between">
        {/* Active filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.roles.map((role) => (
            <span
              key={role}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                ${ROLE_COLORS[role].bg} ${ROLE_COLORS[role].text} ${ROLE_COLORS[role].border} border
              `}
            >
              <Shield className="w-3 h-3" />
              {role.charAt(0).toUpperCase() + role.slice(1)}
              <button
                onClick={() => toggleRole(role)}
                className="ml-1 hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.statuses.map((status) => (
            <span
              key={status}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text}
              `}
            >
              <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status].dot}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <button
                onClick={() => toggleStatus(status)}
                className="ml-1 hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-500">
          {filteredCount === totalCount ? (
            <span>{totalCount} members</span>
          ) : (
            <span>
              Showing <span className="text-cyan-400 font-medium">{filteredCount}</span> of {totalCount} members
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamFilters;
