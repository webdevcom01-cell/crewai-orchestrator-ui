import React, { useReducer, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { DotGridBackground } from './components/cyberpunk';
import { PageSkeleton } from './components/ui/Skeleton';
import { AgentConfig, TaskConfig, FlowConfig } from './types';
import { ACTION_TYPES, orchestratorReducer, initialOrchestratorState, OrchestratorContext } from './reducer';
import { apiAgents, apiTasks, apiFlows } from './services/api';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './components/AuthProvider';
import { EnterpriseSettings } from './components/EnterpriseSettings';
import { PWAComponents } from './components/PWAComponents';
import { startIdlePreloading } from './lib/lazyLoad';

// Monitoring - Sentry Error Boundary and Performance
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { setUser, addBreadcrumb, captureException } from './lib/sentry';
import { markStart, markEnd } from './lib/webVitals';

// Lazy load route components for code splitting
const AgentsView = lazy(() => import('./components/AgentsView'));
const TasksView = lazy(() => import('./components/TasksView'));
const CrewView = lazy(() => import('./components/CrewView'));
const HistoryView = lazy(() => import('./components/HistoryView'));
const ExportView = lazy(() => import('./components/ExportView'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const TemplatesLibrary = lazy(() => import('./components/TemplatesLibrary'));
const Collaboration = lazy(() => import('./components/Collaboration'));
const AuditLog = lazy(() => import('./components/AuditLog'));
const NotificationsCenter = lazy(() => import('./components/NotificationsCenter'));

// Performance Monitor - only in development
const PerformanceMonitor = lazy(() => 
  import('./components/monitoring/PerformanceMonitor').then(mod => ({ default: mod.PerformanceMonitor }))
);

const App: React.FC = () => {
  const [state, dispatch] = useReducer(orchestratorReducer, initialOrchestratorState);
  const hasLoadedData = useRef(false);
  const hasFallbackLoaded = useRef(false);

  // Start idle preloading of routes
  useEffect(() => {
    startIdlePreloading();
    
    // Add navigation breadcrumb for monitoring
    addBreadcrumb('App mounted', 'lifecycle', { timestamp: Date.now() });
  }, []);

  // Load initial data from API with performance tracking
  useEffect(() => {
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    const loadData = async () => {
      markStart('initial-data-load');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const [agents, tasks, flows] = await Promise.all([
          apiAgents.getAll(),
          apiTasks.getAll(),
          apiFlows.getAll()
        ]);
        
        // Batch action - single dispatch instead of N+M+K dispatches
        dispatch({ 
          type: 'INIT_DATA', 
          payload: { agents, tasks, flows } 
        });
        
        addBreadcrumb('Initial data loaded', 'data', { 
          agentCount: agents.length, 
          taskCount: tasks.length, 
          flowCount: flows.length 
        });
      } catch (error) {
        console.error("Failed to load initial data:", error);
        
        // Capture error to Sentry
        captureException(error instanceof Error ? error : new Error(String(error)), {
          tags: { component: 'App', action: 'loadInitialData' },
          extra: { timestamp: Date.now() }
        });
        
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Failed to load data' 
        });
      } finally {
        markEnd('initial-data-load');
      }
    };
    loadData();
  }, []);

  // Fallback data if state is empty (for demo purposes if API is not running)
  useEffect(() => {
    // Only run fallback once and only if no data was loaded
    if (hasFallbackLoaded.current) return;
    if (state.agents.length === 0 && state.tasks.length === 0) {
      hasFallbackLoaded.current = true;
       const demoAgents: AgentConfig[] = [
        {
          id: 'research_agent',
          name: 'ResearchAgent',
          role: 'Senior Researcher',
          goal: 'Prikupi relevantne informacije i specifikacije za zadati feature.',
          backstory: 'Iskusan tehnički researcher, fokusiran na tačne i sažete specifikacije.',
          allowDelegation: false,
          verbose: true,
          tools: ['SerperApiTool', 'ScrapeWebsiteTool'],
          model: 'gemini-2.5-flash',
        },
        {
          id: 'dev_agent',
          name: 'DevAgent',
          role: 'Senior Python Developer',
          goal: 'Napiši čitljiv, testabilan i production-ready Python kod na osnovu specifikacije.',
          backstory: 'Iskusan Python inženjer za backend i agent sisteme.',
          allowDelegation: false,
          verbose: true,
          tools: ['FileWriteTool'],
          model: 'gemini-2.5-flash',
        },
        {
          id: 'qa_agent',
          name: 'QAAgent',
          role: 'QA Engineer',
          goal: 'Pripremi i optimizuj testove za novi kod, fokus na edge case-ove.',
          backstory: 'QA specijalista za automatizovane testove i regresiju.',
          allowDelegation: false,
          verbose: true,
          tools: ['FileWriteTool'],
          model: 'gemini-2.5-flash',
        },
        {
          id: 'report_agent',
          name: 'ReportAgent',
          role: 'Technical Writer',
          goal: 'Napravi jasan tehnički report šta je urađeno, kako pokrenuti i šta dalje.',
          backstory: 'Piše kratku, jasnu i tehnički tačnu dokumentaciju.',
          allowDelegation: false,
          verbose: true,
          tools: [],
          model: 'gemini-2.5-flash',
        }
      ];
      const demoTasks: TaskConfig[] = [
        {
          id: 'research_task',
          name: 'Research Phase',
          description: 'Istraži i definiši zahteve za feature: {feature}.\nVrati JSON sa poljima: summary, api_design, edge_cases.',
          expectedOutput: 'Strogo JSON format:\n{ "summary": str, "api_design": str, "edge_cases": [str, ...] }',
          agentId: 'research_agent',
          contextTaskIds: [],
          isEntrypoint: true,
        },
        {
          id: 'dev_task',
          name: 'Development Phase',
          description: 'Na osnovu research JSON-a implementiraj Python modul.\nKoristi tipove i pokrij edge case-ove.\nSamo ako je kod finalan, upiši ga u fajl `src/feature.py` preko FileWriteTool-a.',
          expectedOutput: 'Sažet opis šta je implementirano + path do fajla.',
          agentId: 'dev_agent',
          contextTaskIds: ['research_task'],
          isEntrypoint: false,
        },
        {
          id: 'qa_task',
          name: 'QA Phase',
          description: 'Napravi testove za `src/feature.py`.\nKreiraj `tests/test_feature.py` sa unit testovima za sve edge case-ove iz research JSON-a.',
          expectedOutput: 'Lista test scenarija + path do test fajla.',
          agentId: 'qa_agent',
          contextTaskIds: ['research_task', 'dev_task'],
          isEntrypoint: false,
        },
        {
          id: 'report_task',
          name: 'Reporting Phase',
          description: 'Na osnovu prethodnih koraka napravi technical report:\n- Šta feature radi\n- Kako pokrenuti kod i testove\n- Poznate limitacije.\nVrati markdown report.',
          expectedOutput: 'Markdown string sa jasnim sekcijama.',
          agentId: 'report_agent',
          contextTaskIds: ['research_task', 'dev_task', 'qa_task'],
          isEntrypoint: false,
        }
      ];
      const demoFlow: FlowConfig = {
        id: 'research_dev_flow',
        name: 'Research → Dev → QA → Report',
        description: 'End-to-end pipeline za kod.',
        process: 'sequential',
        agentIds: ['research_agent', 'dev_agent', 'qa_agent', 'report_agent'],
        taskIds: ['research_task', 'dev_task', 'qa_task', 'report_task'],
      };

      demoAgents.forEach(a => dispatch({ type: ACTION_TYPES.ADD_AGENT, payload: a }));
      demoTasks.forEach(t => dispatch({ type: ACTION_TYPES.ADD_TASK, payload: t }));
      dispatch({ type: ACTION_TYPES.ADD_FLOW, payload: demoFlow });
    }
  }, [state.agents.length, state.tasks.length]);

  // Sentry fallback UI for critical errors
  const SentryFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/80 border border-red-500/30 rounded-xl p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 mb-6">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={resetError}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <SentryErrorBoundary fallback={SentryFallback}>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <OrchestratorContext.Provider value={{ state, dispatch }}>
              <BrowserRouter>
                {/* PWA Components (Offline indicator, Install prompt, Update prompt) */}
                <PWAComponents />
                
                {/* Performance Monitor - Dev only */}
                {import.meta.env.DEV && (
                  <Suspense fallback={null}>
                    <PerformanceMonitor />
                  </Suspense>
                )}
                
                <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#050608] text-slate-200">
                  {/* Cyberpunk Dot Grid Background */}
                  <DotGridBackground 
                    dotSpacing={35}
                    dotRadius={1.5}
                    interactionRadius={120}
                    dotColor="rgba(255, 255, 255, 0.12)"
                    glowColor="rgba(34, 197, 220, 1)"
                  />
                  
                  <Navigation />
                  <main className="flex-1 overflow-hidden relative">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                       <div className="absolute top-[-15%] right-[-8%] w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-cyan-600/6 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] lg:blur-[120px]"></div>
                       <div className="absolute bottom-[-15%] left-[-12%] w-[400px] sm:w-[500px] md:w-[600px] lg:w-[700px] h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-cyan-600/3 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] lg:blur-[140px]"></div>
                    </div>
                    
                    <div className="relative z-10 h-full">
                       <Suspense fallback={<PageSkeleton />}>
                         <Routes>
                           <Route path="/" element={<Dashboard />} />
                           <Route path="/agents" element={<AgentsView />} />
                           <Route path="/tasks" element={<TasksView />} />
                           <Route path="/templates" element={<TemplatesLibrary />} />
                           <Route path="/run" element={<CrewView />} />
                           <Route path="/history" element={<HistoryView />} />
                           <Route path="/collaboration" element={<Collaboration />} />
                           <Route path="/audit" element={<AuditLog />} />
                           <Route path="/notifications" element={<NotificationsCenter />} />
                           <Route path="/export" element={<ExportView />} />
                           <Route path="/settings" element={<EnterpriseSettings workspaceId="default-workspace" />} />
                         </Routes>
                       </Suspense>
                    </div>
                  </main>
                </div>
              </BrowserRouter>
            </OrchestratorContext.Provider>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SentryErrorBoundary>
  );
};

export default App;