import React from 'react';
import { HelpCircle } from 'lucide-react';

interface KeyboardHintProps {
  keys: string[];
  action: string;
  icon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'static';
  className?: string;
}

const KeyboardHint: React.FC<KeyboardHintProps> = ({
  keys,
  action,
  icon,
  position = 'bottom-right',
  className = '',
}) => {
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { position: 'fixed', bottom: '30px', right: '30px' },
    'bottom-left': { position: 'fixed', bottom: '30px', left: '30px' },
    'top-right': { position: 'fixed', top: '30px', right: '30px' },
    'top-left': { position: 'fixed', top: '30px', left: '30px' },
    'static': { position: 'relative' },
  };

  return (
    <div
      className={`keyboard-hint ${className}`}
      style={{
        ...positionStyles[position],
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        background: 'rgba(8, 15, 26, 0.8)',
        border: '1px solid rgba(34, 197, 220, 0.15)',
        borderRadius: '8px',
        fontFamily: "'Space Mono', monospace",
        fontSize: '11px',
        color: '#6B7280',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
      }}
    >
      {icon || <HelpCircle size={16} style={{ color: '#22C5DC' }} />}
      <span>
        {action}{' '}
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            <kbd
              style={{
                padding: '2px 8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: '#9CA3AF',
              }}
            >
              {key}
            </kbd>
            {index < keys.length - 1 && ' + '}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
};

export default KeyboardHint;
