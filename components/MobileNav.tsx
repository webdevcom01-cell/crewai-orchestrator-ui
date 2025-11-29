import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Users, ListTodo, Workflow, Play, History, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface MobileNavProps {
  onLogout?: () => void;
}

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: '/', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
  { path: '/agents', icon: <Users className="w-5 h-5" />, label: 'Agents' },
  { path: '/tasks', icon: <ListTodo className="w-5 h-5" />, label: 'Tasks' },
  { path: '/crews', icon: <Workflow className="w-5 h-5" />, label: 'Crews' },
  { path: '/runs', icon: <Play className="w-5 h-5" />, label: 'Runs' },
  { path: '/history', icon: <History className="w-5 h-5" />, label: 'History' },
  { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
];

export function MobileNav({ onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar - Only visible on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--bg-surface)]/95 
                      backdrop-blur-xl border-b border-[var(--border-default)]">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 
                          flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-[var(--text-primary)]">CrewAI</span>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`absolute inset-0 w-6 h-6 text-[var(--text-primary)] transition-all duration-300
                             ${isOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                />
                <X 
                  className={`absolute inset-0 w-6 h-6 text-[var(--text-primary)] transition-all duration-300
                             ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40
                   transition-opacity duration-300
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Menu */}
      <nav 
        className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50
                   bg-[var(--bg-surface)] border-l border-[var(--border-default)]
                   transform transition-transform duration-300 ease-out
                   ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Navigation
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 
                           transition-all duration-200 group
                           ${isActive 
                             ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-r-2 border-[var(--accent-cyan)]' 
                             : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                           }`}
              >
                <span className={`transition-transform group-hover:scale-110 ${isActive ? 'text-[var(--accent-cyan)]' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`ml-auto w-4 h-4 opacity-0 -translate-x-2 
                                         group-hover:opacity-100 group-hover:translate-x-0 
                                         transition-all ${isActive ? 'opacity-100 translate-x-0' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[var(--border-default)] p-4 space-y-3">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-sm text-[var(--text-secondary)]">Theme</span>
            <ThemeToggle variant="switch" />
          </div>

          {/* Logout */}
          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                        text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}

export default MobileNav;
