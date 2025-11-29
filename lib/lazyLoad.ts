import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Route-based code splitting with preloading capability
interface LazyComponentWithPreload<T extends ComponentType<any>> extends LazyExoticComponent<T> {
  preload: () => Promise<{ default: T }>;
}

// Create lazy component with preload capability
function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyComponentWithPreload<T> {
  const Component = lazy(factory) as LazyComponentWithPreload<T>;
  Component.preload = factory;
  return Component;
}

// Create lazy component with retry logic for network failures
function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): LazyComponentWithPreload<T> {
  const retryFactory = async (): Promise<{ default: T }> => {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await factory();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Lazy load attempt ${attempt + 1} failed:`, error);
        
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  };
  
  return lazyWithPreload(retryFactory);
}

// ============ LAZY LOADED COMPONENTS ============

// Main Views (with retry for critical components)
export const AgentsView = lazyWithRetry(() => 
  import(/* webpackChunkName: "agents-view" */ '../components/AgentsView')
);

export const TasksView = lazyWithRetry(() => 
  import(/* webpackChunkName: "tasks-view" */ '../components/TasksView')
);

export const CrewView = lazyWithRetry(() => 
  import(/* webpackChunkName: "crew-view" */ '../components/CrewView')
);

export const HistoryView = lazyWithPreload(() => 
  import(/* webpackChunkName: "history-view" */ '../components/HistoryView')
);

export const ExportView = lazyWithPreload(() => 
  import(/* webpackChunkName: "export-view" */ '../components/ExportView')
);

export const Dashboard = lazyWithRetry(() => 
  import(/* webpackChunkName: "dashboard" */ '../components/Dashboard')
);

export const TemplatesLibrary = lazyWithPreload(() => 
  import(/* webpackChunkName: "templates" */ '../components/TemplatesLibrary')
);

export const Collaboration = lazyWithPreload(() => 
  import(/* webpackChunkName: "collaboration" */ '../components/Collaboration')
);

export const AuditLog = lazyWithPreload(() => 
  import(/* webpackChunkName: "audit" */ '../components/AuditLog')
);

export const NotificationsCenter = lazyWithPreload(() => 
  import(/* webpackChunkName: "notifications" */ '../components/NotificationsCenter')
);

// Enterprise Settings
export const EnterpriseSettings = lazyWithPreload(() => 
  import(/* webpackChunkName: "settings" */ '../components/EnterpriseSettings').then(mod => ({ default: mod.EnterpriseSettings }))
);

// Accessibility components (optional, loaded on demand)
export const TwoFactorAuth = lazyWithPreload(() =>
  import(/* webpackChunkName: "2fa" */ '../components/TwoFactorAuth')
);

// Performance Monitor (dev only)
export const PerformanceMonitor = lazyWithPreload(() =>
  import(/* webpackChunkName: "perf-monitor" */ '../components/monitoring/PerformanceMonitor').then(mod => ({ default: mod.PerformanceMonitor }))
);

// ============ ROUTE PRELOADING ============

// Route to component mapping for preloading
const routeComponents: Record<string, LazyComponentWithPreload<any>> = {
  '/': Dashboard,
  '/agents': AgentsView,
  '/tasks': TasksView,
  '/templates': TemplatesLibrary,
  '/run': CrewView,
  '/history': HistoryView,
  '/collaboration': Collaboration,
  '/audit': AuditLog,
  '/notifications': NotificationsCenter,
  '/export': ExportView,
  '/settings': EnterpriseSettings,
};

// Preload a specific route
export function preloadRoute(path: string): void {
  const component = routeComponents[path];
  if (component) {
    component.preload();
  }
}

// Preload adjacent routes (for navigation prediction)
export function preloadAdjacentRoutes(currentPath: string): void {
  const routes = Object.keys(routeComponents);
  const currentIndex = routes.indexOf(currentPath);
  
  if (currentIndex === -1) return;
  
  // Preload previous and next routes
  const adjacentIndices = [currentIndex - 1, currentIndex + 1];
  
  adjacentIndices.forEach(index => {
    if (index >= 0 && index < routes.length) {
      preloadRoute(routes[index]);
    }
  });
}

// Preload all routes (for idle time)
export function preloadAllRoutes(): void {
  Object.values(routeComponents).forEach(component => {
    component.preload();
  });
}

// ============ IDLE PRELOADING ============

let idleCallback: number | null = null;

export function startIdlePreloading(): void {
  if (typeof window === 'undefined') return;
  
  // Cancel any existing idle callback
  if (idleCallback !== null) {
    cancelIdleCallback(idleCallback);
  }
  
  // Schedule preloading during idle time
  idleCallback = requestIdleCallback(
    (deadline) => {
      const routes = Object.values(routeComponents);
      let index = 0;
      
      const preloadNext = () => {
        // Check if we still have time and routes to preload
        while (deadline.timeRemaining() > 0 && index < routes.length) {
          routes[index].preload();
          index++;
        }
        
        // If more routes remain, schedule another idle callback
        if (index < routes.length) {
          idleCallback = requestIdleCallback(
            (newDeadline) => {
              deadline = newDeadline;
              preloadNext();
            },
            { timeout: 5000 }
          );
        }
      };
      
      preloadNext();
    },
    { timeout: 3000 }
  );
}

export function stopIdlePreloading(): void {
  if (idleCallback !== null) {
    cancelIdleCallback(idleCallback);
    idleCallback = null;
  }
}

// ============ INTERSECTION OBSERVER PRELOADING ============

export function createLinkPreloader(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          
          if (href && routeComponents[href]) {
            preloadRoute(href);
          }
        }
      });
    },
    {
      rootMargin: '100px', // Start preloading when link is 100px from viewport
    }
  );
}

// ============ HOVER PRELOADING ============

export function handleLinkHover(path: string): () => void {
  // Debounce to avoid excessive preloading
  const timer = setTimeout(() => {
    preloadRoute(path);
  }, 50);
  
  return () => clearTimeout(timer);
}

// ============ POLYFILL FOR requestIdleCallback ============

if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  (window as any).requestIdleCallback = function(callback: IdleRequestCallback): number {
    const start = Date.now();
    return window.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1) as unknown as number;
  };
  
  (window as any).cancelIdleCallback = function(id: number): void {
    window.clearTimeout(id);
  };
}
