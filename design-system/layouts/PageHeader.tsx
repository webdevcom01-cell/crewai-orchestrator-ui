/**
 * PageHeader Component
 * 
 * Consistent header for all pages with title, description, and actions.
 */

import React from 'react';
import { colors, spacing } from '../tokens';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description/subtitle */
  description?: string;
  /** Icon before title */
  icon?: React.ReactNode;
  /** Action buttons on the right */
  actions?: React.ReactNode;
  /** Breadcrumbs or back button */
  breadcrumb?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  breadcrumb,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        borderBottom: `1px solid rgba(34, 197, 220, 0.15)`,
        padding: spacing[6],
        backgroundColor: 'rgba(8, 15, 26, 0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {breadcrumb && (
        <div style={{ marginBottom: spacing[3] }}>
          {breadcrumb}
        </div>
      )}
      
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[4],
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] }}>
            {icon && (
              <div style={{ display: 'flex', color: colors.cyan[400] }}>
                {icon}
              </div>
            )}
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: colors.white,
                letterSpacing: '-0.025em',
                margin: 0,
              }}
            >
              {title}
            </h1>
          </div>
          
          {description && (
            <p
              style={{
                fontSize: '0.875rem',
                color: colors.slate[400],
                margin: 0,
              }}
            >
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div style={{ display: 'flex', gap: spacing[2], flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.displayName = 'PageHeader';

export default PageHeader;
