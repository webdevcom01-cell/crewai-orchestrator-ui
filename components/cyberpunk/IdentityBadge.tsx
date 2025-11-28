import React from 'react';

interface IdentityBadgeProps {
  label: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const IdentityBadge: React.FC<IdentityBadgeProps> = ({
  label,
  status = 'online',
  className = '',
}) => {
  const statusColors = {
    online: '#22C55E',
    offline: '#6B7280',
    busy: '#EF4444',
    away: '#FBBF24',
  };

  const color = statusColors[status];

  return (
    <div
      className={`identity-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        background: 'rgba(8, 15, 26, 0.6)',
        border: '1px solid rgba(34, 197, 220, 0.15)',
        borderRadius: '50px',
        fontFamily: "'Space Mono', monospace",
        fontSize: '11px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: '#9CA3AF',
        backdropFilter: 'blur(10px)',
      }}
    >
      <span
        className="status-dot"
        style={{
          width: '8px',
          height: '8px',
          background: color,
          borderRadius: '50%',
          boxShadow: `0 0 10px ${color}`,
          animation: status === 'online' ? 'pulse 2s infinite' : 'none',
        }}
      />
      <span>{label}</span>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export default IdentityBadge;
