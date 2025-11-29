import { useEffect, useCallback, useRef } from 'react';

type KeyCombo = string; // e.g., 'ctrl+k', 'cmd+shift+p', 'escape'
type KeyHandler = (e: KeyboardEvent) => void;

interface Shortcut {
  key: KeyCombo;
  handler: KeyHandler;
  description?: string;
  enabled?: boolean;
}

// Parse key combo string into parts
function parseKeyCombo(combo: KeyCombo): {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
} {
  const parts = combo.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  
  return {
    key,
    ctrl: parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('cmd') || parts.includes('meta'),
  };
}

// Check if event matches key combo
function matchesCombo(e: KeyboardEvent, combo: KeyCombo): boolean {
  const parsed = parseKeyCombo(combo);
  const eventKey = e.key.toLowerCase();
  
  // Handle special keys
  const keyMatches = eventKey === parsed.key || 
                    (parsed.key === 'escape' && eventKey === 'escape') ||
                    (parsed.key === 'enter' && eventKey === 'enter') ||
                    (parsed.key === 'space' && eventKey === ' ');

  return (
    keyMatches &&
    e.ctrlKey === parsed.ctrl &&
    e.shiftKey === parsed.shift &&
    e.altKey === parsed.alt &&
    e.metaKey === parsed.meta
  );
}

// Hook for single keyboard shortcut
export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  handler: KeyHandler,
  options: { enabled?: boolean; preventDefault?: boolean } = {}
) {
  const { enabled = true, preventDefault = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;

      // Allow certain shortcuts even in inputs
      const allowInInput = ['escape', 'ctrl+enter', 'cmd+enter'].some(
        combo => matchesCombo(e, combo)
      );

      if (isInput && !allowInInput) return;

      if (matchesCombo(e, keyCombo)) {
        if (preventDefault) {
          e.preventDefault();
          e.stopPropagation();
        }
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyCombo, handler, enabled, preventDefault]);
}

// Hook for multiple shortcuts
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;
        
        // Allow certain shortcuts in inputs
        const allowInInput = ['escape', 'ctrl+enter', 'cmd+enter'].some(
          combo => matchesCombo(e, combo)
        );

        if (isInput && !allowInInput) continue;

        if (matchesCombo(e, shortcut.key)) {
          e.preventDefault();
          e.stopPropagation();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Global keyboard shortcut context manager
interface ShortcutEntry {
  id: string;
  key: KeyCombo;
  handler: KeyHandler;
  description: string;
  category?: string;
}

class ShortcutManager {
  private shortcuts: Map<string, ShortcutEntry> = new Map();
  private listeners: Set<() => void> = new Set();

  register(entry: ShortcutEntry) {
    this.shortcuts.set(entry.id, entry);
    this.notifyListeners();
    return () => this.unregister(entry.id);
  }

  unregister(id: string) {
    this.shortcuts.delete(id);
    this.notifyListeners();
  }

  getAll(): ShortcutEntry[] {
    return Array.from(this.shortcuts.values());
  }

  getByCategory(): Record<string, ShortcutEntry[]> {
    const result: Record<string, ShortcutEntry[]> = {};
    for (const entry of this.shortcuts.values()) {
      const category = entry.category || 'General';
      if (!result[category]) result[category] = [];
      result[category].push(entry);
    }
    return result;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }
}

export const shortcutManager = new ShortcutManager();

// Hook to register shortcut with manager
export function useRegisteredShortcut(
  id: string,
  keyCombo: KeyCombo,
  handler: KeyHandler,
  description: string,
  options: { category?: string; enabled?: boolean } = {}
) {
  const { category = 'General', enabled = true } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const unregister = shortcutManager.register({
      id,
      key: keyCombo,
      handler: (e) => handlerRef.current(e),
      description,
      category,
    });

    return unregister;
  }, [id, keyCombo, description, category, enabled]);

  useKeyboardShortcut(keyCombo, handler, { enabled });
}

export default useKeyboardShortcut;
