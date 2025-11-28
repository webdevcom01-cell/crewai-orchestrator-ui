import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Loader2, Terminal, AlertTriangle, ChevronDown, ChevronUp, ArrowRight, User, GitBranch } from 'lucide-react';
import { apiFlows, apiRuns } from '../services/api';
import { ACTION_TYPES } from '../reducer';
import { useOrchestrator } from '../hooks';
import { useToast } from './ui/Toast';

const CrewView: React.FC = () => {
  const context = useOrchestrator();
  const { state, dispatch } = context;
  const { agents, tasks, flows, selectedFlowId } = state;
  const flow = flows.find(f => f.id === selectedFlowId);
  const { showToast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{agent: string, type: string, content: string}[]>([]);
  const [processType, setProcessType] = useState<'sequential' | 'hierarchical'>('sequential');
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const handleRun = useCallback(async () => {
    if (agents.length === 0 || tasks.length === 0) return;
    if (!flow) {
        showToast({ type: 'error', title: 'Configuration Error', message: 'No flow selected!' });
        return;
    }
    
    setIsRunning(true);
    setLogs([]);
    
    try {
      // Add initial system logs
      setLogs(prev => [...prev, { agent: 'System', type: 'info', content: 'Initializing crew run...' }]);
      
      const run = await apiFlows.startRun(flow.id, {}); // Added empty input object
      setCurrentRunId(run.id);
      
      setLogs(prev => [...prev, { agent: 'System', type: 'info', content: `Run started with ID: ${run.id}` }]);
      
      dispatch({ type: ACTION_TYPES.START_RUN, payload: run });

      // Connect to SSE
      const unsubscribe = apiRuns.streamEvents(
        run.id,
        (data) => {
            // data is already parsed by api.ts
            
            let logType = 'info';
            if (data.type === 'error') logType = 'error';
            if (data.type === 'task_completed') logType = 'success';
            if (data.type === 'thought') logType = 'thought';
            
            const content = data.message || data.output || JSON.stringify(data);
            const agentName = data.agent || 'System';
            
            setLogs(prev => [...prev, { agent: agentName, type: logType, content }]);
            
            if (data.type === 'run_completed' || data.status === 'completed') {
                setIsRunning(false);
                if (unsubscribeRef.current) unsubscribeRef.current();
                dispatch({ type: ACTION_TYPES.UPDATE_RUN_STATUS, payload: { runId: run.id, status: 'completed' } });
            }
            if (data.type === 'run_failed' || data.status === 'failed') {
                setIsRunning(false);
                if (unsubscribeRef.current) unsubscribeRef.current();
                dispatch({ type: ACTION_TYPES.UPDATE_RUN_STATUS, payload: { runId: run.id, status: 'failed' } });
            }
        }
      );
      
      unsubscribeRef.current = unsubscribe;

    } catch (error) {
      console.error("Failed to start run:", error);
      setLogs(prev => [...prev, { agent: 'System', type: 'error', content: 'Failed to start run. Check backend connection.' }]);
      setIsRunning(false);
    }
  }, [agents.length, tasks.length, flow, dispatch, showToast]);

  const getLogColor = (type: string) => {
    switch (type) {
        case 'thought': return 'text-yellow-400';
        case 'action': return 'text-blue-400';
        case 'output': return 'text-emerald-400';
        case 'error': return 'text-red-400';
        case 'success': return 'text-green-500 font-bold';
        default: return 'text-slate-300';
    }
  };

  const toggleTaskExpanded = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const getAgentName = useCallback((agentId: string | null): string => {
    if (!agentId) return 'Unassigned';
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || agent?.role || 'Unknown';
  }, [agents]);

  const getTaskId = useCallback((taskId: string): string => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return taskId;
    if (task.id && !task.id.includes('-')) return task.id;
    const desc = (task.description || 'task').toLowerCase();
    const words = desc.split(' ').slice(0, 2).filter(w => w.length > 2);
    return words.join('_') + '_task';
  }, [tasks]);

  if (agents.length === 0 || tasks.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8">
              <AlertTriangle size={48} className="mb-4 text-amber-500" />
              <h3 className="text-xl font-bold text-white mb-2">Configuration Incomplete</h3>
              <p>You need at least 1 agent and 1 task to start a crew.</p>
          </div>
      )
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left Side - Task Flow Pipeline */}
      <div className="w-full lg:w-1/2 lg:border-r border-cyan-500/15 p-4 md:p-6 overflow-y-auto max-h-[50vh] lg:max-h-none">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Run Simulation</h2>
            <p className="text-xs text-cyan-500/60 font-mono mt-1">Sequential Pipeline</p>
          </div>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 border border-cyan-500/30 ${
              isRunning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-cyan-500/20 text-cyan-400 group'
            }`}
            style={!isRunning ? { 
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform'
            } : undefined}
            onMouseMove={!isRunning ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const deltaX = (e.clientX - centerX) / (rect.width / 2);
              const deltaY = (e.clientY - centerY) / (rect.height / 2);
              
              const tiltX = deltaY * -8;
              const tiltY = deltaX * 8;
              const moveX = deltaX * 12;
              const moveY = deltaY * 12;
              
              e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 8}px) scale(1.08)`;
              e.currentTarget.style.boxShadow = `0 0 40px rgba(34, 197, 220, 0.5), 0 ${moveY + 20}px 30px rgba(0, 0, 0, 0.4)`;
            } : undefined}
            onMouseLeave={!isRunning ? (e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            } : undefined}
          >
            {isRunning ? <Loader2 className="animate-spin pointer-events-none" size={20} /> : <Play size={20} className="pointer-events-none group-hover:text-cyan-300 transition-colors duration-300" />}
            {isRunning ? 'Running...' : 'Start'}
          </button>
        </div>

        {/* Task Flow Visualization */}
        <div className="space-y-0">
          {tasks.map((task, index) => {
            const hasContext = (task.contextTaskIds || []).length > 0;
            const isExpanded = expandedTasks.has(task.id);
            
            return (
              <div key={task.id} className="relative">
                {/* Connection Arrow */}
                {index > 0 && (
                  <div className="flex justify-center py-2">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-500/50 to-cyan-500/20"></div>
                      <ArrowRight size={14} className="text-cyan-500/50 rotate-90" />
                    </div>
                  </div>
                )}

                {/* Task Card */}
                <div 
                  className="relative p-4 rounded-xl border border-cyan-500/15 bg-[#080F1A]/40 hover:border-cyan-500/30 hover:bg-[#080F1A]/60 hover:shadow-[0_0_20px_rgba(34,197,220,0.1)] group backdrop-blur-sm"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    willChange: 'transform'
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const deltaX = (e.clientX - centerX) / (rect.width / 2);
                    const deltaY = (e.clientY - centerY) / (rect.height / 2);
                    
                    const tiltX = deltaY * -8;
                    const tiltY = deltaX * 8;
                    const moveX = deltaX * 12;
                    const moveY = deltaY * 12;
                    
                    e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 8}px) scale(1.08)`;
                    e.currentTarget.style.boxShadow = `0 0 40px rgba(34, 197, 220, 0.5), 0 ${moveY + 20}px 30px rgba(0, 0, 0, 0.4)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Step Number & Expand Controls */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                    <button 
                      onClick={() => toggleTaskExpanded(task.id)}
                      className="p-0.5 rounded text-slate-500 hover:text-cyan-400 transition-colors"
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} task ${index + 1}`}
                    >
                      <ChevronUp size={20} className={isExpanded ? 'text-cyan-400' : ''} />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-mono font-bold group-hover:bg-cyan-500/30 transition-all">
                      {index + 1}
                    </div>
                    <button 
                      onClick={() => toggleTaskExpanded(task.id)}
                      className="p-0.5 rounded text-slate-500 hover:text-cyan-400 transition-colors"
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} task ${index + 1}`}
                    >
                      <ChevronDown size={20} className={isExpanded ? 'text-cyan-400' : ''} />
                    </button>
                  </div>

                  {/* Task Content */}
                  <div className="ml-4">
                    {/* Task ID & Context Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-cyan-500/60">{getTaskId(task.id)}</span>
                      {hasContext && (
                        <div className="flex items-center gap-1 text-[10px] text-yellow-500/80">
                          <GitBranch size={10} />
                          <span>context</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`text-sm text-white font-medium mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {task.description || 'No description'}
                    </p>

                    {/* Agent Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all ${
                        task.agentId 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30' 
                          : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                      }`}>
                        <User size={12} />
                        <span>{getAgentName(task.agentId)}</span>
                      </div>
                      {task.agentId && (
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors">{task.agentId}</span>
                      )}
                    </div>

                    {/* Context Links */}
                    {hasContext && isExpanded && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(task.contextTaskIds || []).map(ctxId => (
                          <span 
                            key={ctxId} 
                            className="text-[9px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400/80 rounded font-mono border border-yellow-500/20"
                          >
                            ← {getTaskId(ctxId)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expected Output (when expanded) */}
                    {isExpanded && task.expectedOutput && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/10">
                        <p className="text-[10px] font-mono text-slate-500 mb-1">Expected Output:</p>
                        <p className="text-xs text-slate-400">{task.expectedOutput}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side - Execution Console */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-4 md:p-6 border-b border-cyan-500/15">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="flex items-center gap-2 cursor-default"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) / (rect.width / 2);
                const deltaY = (e.clientY - centerY) / (rect.height / 2);
                
                const tiltX = deltaY * -8;
                const tiltY = deltaX * 8;
                const moveX = deltaX * 12;
                const moveY = deltaY * 12;
                
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 8}px) scale(1.08)`;
                
                // Apply text shadow to the h3 child
                const h3 = e.currentTarget.querySelector('h3');
                if (h3 instanceof HTMLElement) {
                  h3.style.textShadow = `0 0 40px rgba(34, 197, 220, 0.5), 0 ${moveY + 20}px 30px rgba(0, 0, 0, 0.4)`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                
                // Remove text shadow from h3 child
                const h3 = e.currentTarget.querySelector('h3');
                if (h3 instanceof HTMLElement) {
                  h3.style.textShadow = 'none';
                }
              }}
            >
              <Terminal size={18} className="text-cyan-500 pointer-events-none font-bold" strokeWidth={2.5} />
              <h3 className="text-base md:text-lg font-semibold text-white">
                Execution Console
              </h3>
            </div>
            {isRunning && <span className="text-cyan-400 text-xs animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,197,220,0.8)]"></span>
              Live
            </span>}
          </div>
          
          {flow && <p className="text-xs font-mono text-cyan-500/60">Flow: {flow.name}</p>}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-black/5 border-l border-cyan-500/10 p-4 overflow-y-auto font-mono text-sm space-y-4">
            {logs.length === 0 && !isRunning && (
              <div className="text-slate-600 italic flex items-center gap-2">
                <Terminal size={14} className="text-cyan-500/30" />
                Ready to start execution...
              </div>
            )}
            
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 hover:bg-cyan-500/5 -mx-2 px-2 py-1 rounded transition-colors">
                <div className="w-24 text-right flex-shrink-0 text-cyan-500/70 font-bold text-xs pt-1 uppercase tracking-wider">
                  {log.agent}
                </div>
                <div className={`flex-1 leading-relaxed whitespace-pre-wrap ${getLogColor(log.type)}`}>
                  {log.content}
                </div>
              </div>
            ))}
            
            {isRunning && (
              <div className="flex gap-4">
                <div className="w-24 text-right flex-shrink-0"></div>
                <div className="text-cyan-400 animate-pulse">▊</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewView;