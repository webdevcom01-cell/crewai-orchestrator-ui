import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryProvider } from './lib/queryClient';
import './lib/i18n'; // Initialize i18n

// ============ MONITORING INITIALIZATION ============
// Initialize Sentry for error tracking (before app renders)
import { initSentry } from './lib/sentry';
initSentry();

// Initialize Web Vitals for performance monitoring
import { initWebVitals, observeLongTasks } from './lib/webVitals';
initWebVitals();

// Start observing long tasks (>50ms blocking)
const cleanupLongTaskObserver = observeLongTasks();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  cleanupLongTaskObserver();
});

// ============ APP RENDER ============
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);