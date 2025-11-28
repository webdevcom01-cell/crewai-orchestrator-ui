/**
 * Sidebar Component
 * 
 * Navigation sidebar with route links and status indicators.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { colors, spacing, borderRadius, componentSpacing, transitions } from '../tokens';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: React.ReactNode;
}

export interface SidebarProps {
  /** Navigation items */
  items: SidebarItem[];
  /** Logo/branding element */
  logo?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  logo,
  footer,
  className = '',
}) => {
  return (
    <aside
      className={className}
      style={{
        width: componentSpacing.sidebar.width,
        backgroundColor: 'rgba(8, 15, 26, 0.9)',
        backdropFilter: 'blur(16px)',
        borderRight: `1px solid rgba(34, 197, 220, 0.15)`,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 20,
      }}
      aria-label="Main navigation"
    >
      {/* Logo/Header */}
      {logo && (
        <div
          style={{
            padding: spacing[6],
            borderBottom: `1px solid rgba(34, 197, 220, 0.1)`,
          }}
        >
          {logo}
        </div>
      )}

      {/* Navigation Items */}
      <nav
        style={{
          flex: 1,
          padding: componentSpacing.sidebar.padding,
          overflowY: 'auto',
        }}
        role="navigation"
        aria-label="Primary"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: componentSpacing.sidebar.itemGap }}>
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              aria-label={item.label}
              style={{ textDecoration: 'none' }}
              className={({ isActive }) =>
                `w-full flex items-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,197,220,0.15)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:border-cyan-500/20 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: `${componentSpacing.sidebar.itemPadding.y} ${componentSpacing.sidebar.itemPadding.x}`,
                    gap: spacing[3],
                    transition: transitions.all,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <span style={{ display: 'flex', flexShrink: 0 }} aria-hidden="true">
                      {item.icon}
                    </span>
                    <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                      {item.label}
                    </span>
                  </div>
                  {item.badge && <div>{item.badge}</div>}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {footer && (
        <div
          style={{
            padding: componentSpacing.sidebar.padding,
            borderTop: `1px solid rgba(34, 197, 220, 0.15)`,
          }}
        >
          {footer}
        </div>
      )}
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
