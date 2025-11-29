import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category?: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  commands?: CommandItem[];
  placeholder?: string;
}

const defaultCommands: CommandItem[] = [
  {
    id: 'nav-dashboard',
    title: 'Go to Dashboard',
    icon: <span>🏠</span>,
    shortcut: 'G D',
    category: 'Navigation',
    action: () => {},
    keywords: ['home', 'main'],
  },
  {
    id: 'nav-agents',
    title: 'Go to Agents',
    icon: <span>🤖</span>,
    shortcut: 'G A',
    category: 'Navigation',
    action: () => {},
    keywords: ['bots', 'ai'],
  },
  {
    id: 'nav-tasks',
    title: 'Go to Tasks',
    icon: <span>📋</span>,
    shortcut: 'G T',
    category: 'Navigation',
    action: () => {},
    keywords: ['todo', 'work'],
  },
  {
    id: 'nav-crews',
    title: 'Go to Crews',
    icon: <span>👥</span>,
    shortcut: 'G C',
    category: 'Navigation',
    action: () => {},
    keywords: ['teams', 'groups'],
  },
  {
    id: 'nav-runs',
    title: 'Go to Runs',
    icon: <span>▶️</span>,
    shortcut: 'G R',
    category: 'Navigation',
    action: () => {},
    keywords: ['execute', 'history'],
  },
  {
    id: 'nav-settings',
    title: 'Go to Settings',
    icon: <span>⚙️</span>,
    shortcut: 'G S',
    category: 'Navigation',
    action: () => {},
    keywords: ['preferences', 'config'],
  },
  {
    id: 'action-new-agent',
    title: 'Create New Agent',
    icon: <span>➕</span>,
    shortcut: 'N A',
    category: 'Actions',
    action: () => {},
    keywords: ['add', 'create'],
  },
  {
    id: 'action-new-task',
    title: 'Create New Task',
    icon: <span>➕</span>,
    shortcut: 'N T',
    category: 'Actions',
    action: () => {},
    keywords: ['add', 'create'],
  },
  {
    id: 'action-new-crew',
    title: 'Create New Crew',
    icon: <span>➕</span>,
    shortcut: 'N C',
    category: 'Actions',
    action: () => {},
    keywords: ['add', 'create'],
  },
  {
    id: 'action-start-run',
    title: 'Start New Run',
    icon: <span>🚀</span>,
    shortcut: 'Shift+R',
    category: 'Actions',
    action: () => {},
    keywords: ['execute', 'launch'],
  },
];

export function CommandPalette({ commands = [], placeholder = 'Type a command or search...' }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Merge default commands with navigation
  const allCommands: CommandItem[] = [
    ...defaultCommands.map(cmd => ({
      ...cmd,
      action: () => {
        if (cmd.id.startsWith('nav-')) {
          const path = cmd.id.replace('nav-', '/').replace('dashboard', '');
          navigate(path || '/');
        }
        cmd.action();
        setIsOpen(false);
      }
    })),
    ...commands.map(cmd => ({
      ...cmd,
      action: () => {
        cmd.action();
        setIsOpen(false);
      }
    })),
  ];

  // Filter commands based on search
  const filteredCommands = allCommands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(searchLower)) ||
      cmd.category?.toLowerCase().includes(searchLower)
    );
  });

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const category = cmd.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Open command palette
  useKeyboardShortcut('ctrl+k', () => setIsOpen(true));
  useKeyboardShortcut('cmd+k', () => setIsOpen(true));

  // Close on escape
  useKeyboardShortcut('escape', () => setIsOpen(false), { enabled: isOpen });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let itemIndex = 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed inset-x-4 top-[20%] mx-auto max-w-xl z-[101]
                      bg-[var(--bg-surface)] border border-[var(--border-default)]
                      rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)]">
          <Search className="w-5 h-5 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)]
                       outline-none text-base"
          />
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">esc</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {category}
              </div>
              {items.map((cmd) => {
                const currentIndex = itemIndex++;
                const isSelected = currentIndex === selectedIndex;
                
                return (
                  <button
                    key={cmd.id}
                    data-index={currentIndex}
                    onClick={() => cmd.action()}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5
                               transition-colors text-left
                               ${isSelected 
                                 ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' 
                                 : 'text-[var(--text-secondary)] hover:bg-white/5'
                               }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center text-lg">
                      {cmd.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${isSelected ? 'text-[var(--text-primary)]' : ''}`}>
                        {cmd.title}
                      </div>
                      {cmd.description && (
                        <div className="text-xs text-[var(--text-muted)] truncate">
                          {cmd.description}
                        </div>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <div className="flex items-center gap-1">
                        {cmd.shortcut.split('+').map((k, i) => (
                          <kbd 
                            key={i}
                            className="px-1.5 py-0.5 text-xs bg-white/10 rounded font-mono"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    )}
                    {isSelected && (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-[var(--text-muted)]">
              <p>No commands found for "{search}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-default)]
                       text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/10 rounded">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/10 rounded">↵</kbd>
              select
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K to open</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommandPalette;
