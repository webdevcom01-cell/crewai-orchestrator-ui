import React, { ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

type AlertType = 'warning' | 'info' | 'success' | 'error';

interface AlertBoxProps {
  type?: AlertType;
  label?: string;
  code?: string;
  title: string;
  description: string | ReactNode;
  linkText?: string;
  linkHref?: string;
  className?: string;
}

const AlertBox: React.FC<AlertBoxProps> = ({
  type = 'warning',
  label,
  code,
  title,
  description,
  linkText,
  linkHref,
  className = '',
}) => {
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      color: '#22C5DC',
      labelColor: '#FBBF24',
    },
    info: {
      icon: Info,
      color: '#22C5DC',
      labelColor: '#22C5DC',
    },
    success: {
      icon: CheckCircle,
      color: '#22C55E',
      labelColor: '#22C55E',
    },
    error: {
      icon: XCircle,
      color: '#EF4444',
      labelColor: '#EF4444',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`alert-box ${className}`}
      style={{
        display: 'flex',
        gap: '16px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(8, 15, 26, 0.9) 0%, rgba(12, 22, 33, 0.8) 100%)',
        border: '1px solid rgba(34, 197, 220, 0.15)',
        borderLeft: `3px solid ${config.color}`,
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        transition: 'all 250ms ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(34, 197, 220, 0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 197, 220, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(34, 197, 220, 0.15)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`,
          borderRadius: '10px',
          color: config.color,
          flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </div>

      <div style={{ flex: 1 }}>
        {(label || code) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {label && (
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: config.labelColor,
                }}
              >
                {label}
              </span>
            )}
            {code && (
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  color: '#6B7280',
                }}
              >
                {code}
              </span>
            )}
          </div>
        )}

        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '6px',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: '14px',
            color: '#9CA3AF',
            lineHeight: 1.5,
          }}
        >
          {description}
          {linkText && linkHref && (
            <>
              {' '}
              <a
                href={linkHref}
                style={{
                  color: '#22C5DC',
                  textDecoration: 'none',
                  transition: 'color 150ms ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#22C55E';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#22C5DC';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                {linkText}
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AlertBox;
