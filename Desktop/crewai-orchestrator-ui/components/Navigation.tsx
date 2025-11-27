import React from 'react';
import { Users, CheckSquare, PlayCircle, Settings, Box, FileCode } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'run', label: 'Run Simulation', icon: PlayCircle },
    { id: 'export', label: 'Export Code', icon: FileCode },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <Box className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-bold text-white tracking-tight">CrewAI UI</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === item.id 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <Settings size={14} />
          <span>v1.0.0 (Orchestrator)</span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;