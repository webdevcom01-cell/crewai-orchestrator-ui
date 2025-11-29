import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  variant?: 'icon' | 'dropdown' | 'switch';
  className?: string;
}

export function ThemeToggle({ showLabel = false, variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full
          transition-colors duration-300 focus:outline-none focus:ring-2 
          focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${resolvedTheme === 'dark' 
            ? 'bg-gray-700' 
            : 'bg-yellow-400'
          }
          ${className}
        `}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span
          className={`
            inline-flex h-6 w-6 items-center justify-center rounded-full
            bg-white shadow-lg transition-transform duration-300
            ${resolvedTheme === 'dark' ? 'translate-x-1' : 'translate-x-7'}
          `}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-gray-800" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-500" />
          )}
        </span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
      { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
      { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
      { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
    ];

    return (
      <div className={`relative group ${className}`}>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 
                     hover:bg-white/10 transition-colors border border-white/10"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-purple-400" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-400" />
          )}
          {showLabel && (
            <span className="text-sm text-gray-300">
              {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          )}
        </button>
        
        <div className="absolute right-0 mt-2 w-36 py-1 rounded-lg bg-gray-800 
                        border border-white/10 shadow-xl opacity-0 invisible
                        group-hover:opacity-100 group-hover:visible transition-all
                        z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm
                hover:bg-white/5 transition-colors
                ${theme === option.value ? 'text-purple-400' : 'text-gray-300'}
              `}
            >
              {option.icon}
              {option.label}
              {theme === option.value && (
                <span className="ml-auto text-purple-400">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default: icon variant
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-300
        hover:bg-white/10 group
        ${className}
      `}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun 
          className={`
            absolute inset-0 h-5 w-5 text-yellow-400
            transition-all duration-300
            ${resolvedTheme === 'dark' 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
        />
        {/* Moon icon */}
        <Moon 
          className={`
            absolute inset-0 h-5 w-5 text-purple-400
            transition-all duration-300
            ${resolvedTheme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
        />
      </div>
      
      {showLabel && (
        <span className="ml-2 text-sm text-gray-300">
          {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 
                       text-xs bg-gray-800 rounded opacity-0 group-hover:opacity-100
                       transition-opacity whitespace-nowrap pointer-events-none">
        {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
  );
}

export default ThemeToggle;
