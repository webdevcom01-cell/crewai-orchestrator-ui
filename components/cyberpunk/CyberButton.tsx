import React, { ReactNode } from 'react';

interface CyberButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
}

const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  href,
  icon,
  iconPosition = 'right',
  className = '',
  disabled = false,
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    fontFamily: "'Space Mono', monospace",
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 250ms ease-out',
    border: '1px solid transparent',
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: '#FFFFFF',
      color: '#050608',
      borderColor: '#FFFFFF',
    },
    secondary: {
      background: 'transparent',
      color: '#FFFFFF',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    ghost: {
      background: 'transparent',
      color: '#9CA3AF',
      borderColor: 'transparent',
    },
  };

  const styles = { ...baseStyles, ...variantStyles[variant] };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    const target = e.currentTarget;
    
    if (variant === 'primary') {
      target.style.background = 'transparent';
      target.style.color = '#FFFFFF';
      target.style.transform = 'translateY(-2px)';
      target.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.1)';
    } else if (variant === 'secondary') {
      target.style.borderColor = '#22C5DC';
      target.style.color = '#22C5DC';
      target.style.transform = 'translateY(-2px)';
      target.style.boxShadow = '0 0 40px rgba(34, 197, 220, 0.2)';
    } else if (variant === 'ghost') {
      target.style.color = '#FFFFFF';
      target.style.background = 'rgba(255, 255, 255, 0.05)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    const target = e.currentTarget;
    
    Object.assign(target.style, variantStyles[variant]);
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = 'none';
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`cyber-btn cyber-btn-${variant} ${className}`}
        style={styles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={`cyber-btn cyber-btn-${variant} ${className}`}
      style={styles}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </button>
  );
};

export default CyberButton;
