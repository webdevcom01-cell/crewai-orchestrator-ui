/**
 * EmptyState Component
 * 
 * Display for empty lists, no data, or zero states.
 */

import React from 'react';
import { colors, spacing } from '../tokens';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing[12]} ${spacing[8]}`,
        textAlign: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: spacing[4],
            color: colors.slate[600],
            opacity: 0.3,
          }}
        >
          {icon}
        </div>
      )}
      
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: colors.slate[400],
          marginBottom: spacing[2],
        }}
      >
        {title}
      </h3>
      
      {description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: colors.slate[600],
            marginBottom: action ? spacing[6] : 0,
            maxWidth: '32rem',
          }}
        >
          {description}
        </p>
      )}
      
      {action && <div>{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;
