/**
 * Sentry Configuration
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';

// Configuration
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
const ENVIRONMENT = import.meta.env.MODE || 'development';
const RELEASE = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Sensitive data patterns to filter
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /authorization/i,
  /cookie/i,
  /session/i,
  /credit[_-]?card/i,
  /cvv/i,
  /ssn/i,
];

/**
 * Filter sensitive data from events
 */
const beforeSend = (event: Sentry.ErrorEvent): Sentry.ErrorEvent | null => {
  // Don't send events in development unless explicitly enabled
  if (ENVIRONMENT === 'development' && !import.meta.env.VITE_SENTRY_DEV) {
    console.log('[Sentry] Event captured (dev mode - not sent):', event);
    return null;
  }

  // Filter sensitive data from breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (breadcrumb.data) {
        const filteredData: Record<string, unknown> = {};
        
        Object.entries(breadcrumb.data).forEach(([key, value]) => {
          const isSensitive = SENSITIVE_PATTERNS.some((pattern) => 
            pattern.test(key)
          );
          
          filteredData[key] = isSensitive ? '[FILTERED]' : value;
        });
        
        breadcrumb.data = filteredData;
      }
      return breadcrumb;
    });
  }

  // Filter sensitive data from request
  if (event.request?.headers) {
    const filteredHeaders: Record<string, string> = {};
    
    Object.entries(event.request.headers).forEach(([key, value]) => {
      const isSensitive = SENSITIVE_PATTERNS.some((pattern) => 
        pattern.test(key)
      );
      
      filteredHeaders[key] = isSensitive ? '[FILTERED]' : value;
    });
    
    event.request.headers = filteredHeaders;
  }

  return event;
};

/**
 * Initialize Sentry
 */
export const initSentry = (): void => {
  if (!SENTRY_DSN) {
    console.log('[Sentry] No DSN provided, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: `crewai-orchestrator@${RELEASE}`,
    
    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Data filtering
    beforeSend,
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.teleportads.com/',
      'jigsaw is not defined',
      
      // Facebook SDK
      'fb_xd_fragment',
      
      // Common network errors
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      'NetworkError',
      
      // Cancelled requests
      'AbortError',
      'cancelled',
    ],
    
    // Don't send errors from these URLs
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      
      // Firefox extensions
      /^moz-extension:\/\//i,
      
      // Safari extensions
      /^safari-extension:\/\//i,
      /^safari-web-extension:\/\//i,
    ],
  });

  console.log(`[Sentry] Initialized for ${ENVIRONMENT} environment`);
};

/**
 * Set user context
 */
export const setUser = (user: {
  id: string;
  email?: string;
  role?: string;
} | null): void => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
): void => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Capture exception with context
 */
export const captureException = (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: Sentry.SeverityLevel;
  }
): string => {
  return Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level,
  });
};

/**
 * Capture message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): string => {
  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Start a performance transaction
 */
export const startTransaction = (
  name: string,
  op: string
): Sentry.Span | undefined => {
  return Sentry.startInactiveSpan({
    name,
    op,
  });
};

/**
 * Set tag on current scope
 */
export const setTag = (key: string, value: string): void => {
  Sentry.setTag(key, value);
};

/**
 * Set extra context on current scope
 */
export const setExtra = (key: string, value: unknown): void => {
  Sentry.setExtra(key, value);
};

/**
 * Create error boundary wrapper
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Profiler for performance tracking
 */
export const Profiler = Sentry.withProfiler;

export default {
  initSentry,
  setUser,
  addBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  setTag,
  setExtra,
  ErrorBoundary,
  Profiler,
};
