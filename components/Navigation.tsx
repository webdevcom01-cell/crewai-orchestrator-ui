import React, { useState } from 'react';
import { Users, CheckSquare, PlayCircle, Settings, Box, FileCode, History, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { id: 'agents', label: 'Agents', icon: Users, path: '/' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 'run', label: 'Run Simulation', icon: PlayCircle, path: '/run' },
  { id: 'history', label: 'History', icon: History, path: '/history' },
  { id: 'export', label: 'Export Code', icon: FileCode, path: '/export' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const Navigation: React.FC = React.memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#080F1A]/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-[#080F1A] transition-all"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed lg:static top-0 left-0 h-screen z-40
          w-64 bg-[#080F1A]/90 backdrop-blur-xl border-r border-cyan-500/15 
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <Box className="w-8 h-8 text-cyan-400" aria-hidden="true" />
          <span className="text-xl font-bold text-white tracking-tight">CrewAI UI</span>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2" role="navigation" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={closeMobileMenu}
              aria-label={item.label}
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-250 ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,197,220,0.15)]' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:border-cyan-500/20 border border-transparent'
              }`}
            >
              <item.icon size={20} aria-hidden="true" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/15">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <Box size={14} aria-hidden="true" />
            <span>v2.0.0 (Enterprise)</span>
          </div>
        </div>
      </aside>
    </>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;