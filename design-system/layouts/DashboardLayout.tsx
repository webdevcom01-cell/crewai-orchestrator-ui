/**
 * DashboardLayout Component
 * 
 * Main layout wrapper with sidebar, header, and content area.
 */

import React from 'react';
import { colors } from '../tokens';

export interface DashboardLayoutProps {
  /** Sidebar component */
  sidebar: React.ReactNode;
  /** Page header (optional) */
  header?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Background effects/decorations */
  background?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebar,
  header,
  children,
  background,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: colors.background.primary,
        color: colors.slate[200],
      }}
    >
      {/* Background Effects */}
      {background}

      {/* Sidebar */}
      {sidebar}

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Page Header */}
        {header}

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
