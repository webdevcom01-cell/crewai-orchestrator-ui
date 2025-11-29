import React, { useEffect, useState, useCallback } from 'react';
import { FlowRun } from '../types';
import { apiFlows, apiRuns } from '../services/api';
import { Clock, CheckCircle, XCircle, Loader2, Terminal, Calendar, History, Play } from 'lucide-react';
import { useOrchestrator } from '../hooks';
import { FlowSkeleton } from './ui/Skeleton';

const HistoryView: React.FC = () => {
  const { state } = useOrchestrator();
  // Use selected flow or default to first flow if available
  const flowId = state.selectedFlowId || (state.flows.length > 0 ? state.flows[0].id : '');
  
  const [runs, setRuns] = useState<FlowRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runLogs, setRunLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchRuns = async () => {
      if (!flowId) return;
      setLoading(true);
      try {
        const data = await apiFlows.getRuns(flowId);
        // Sort by createdAt desc if available, or just reverse
        setRuns(data.reverse());
      } catch (error) {
        console.error("Failed to fetch runs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [flowId]);

  const handleRunClick = useCallback((run: FlowRun) => {
    setSelectedRunId(run.id);
    setRunLogs([]); // Clear previous logs
    // Logs will be populated by the effect below if running
  }, []);

  // Subscription effect
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    if (selectedRunId) {
        const run = runs.find(r => r.id === selectedRunId);
        if (run && (run.status === 'running' || run.status === 'pending')) {
             unsubscribe = apiRuns.streamEvents(selectedRunId, (data) => {
                try {
                    // data is already parsed by api.ts
                    const msg = data.message || data.output || JSON.stringify(data);
                    setRunLogs(prev => [...prev, `[${data.agent || 'System'}] ${msg}`]);
                } catch {
                    setRunLogs(prev => [...prev, String(data)]);
                }
            });
        }
    }
    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [selectedRunId, runs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-emerald-400" />;
      case 'failed': return <XCircle size={16} className="text-red-400" />;
      case 'running': return <Loader2 size={16} className="text-blue-400 animate-spin" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden text-slate-200">
      {/* Left Side - Run History List */}
      <div className="w-full lg:w-1/3 lg:border-r border-cyan-500/15 p-4 md:p-6 overflow-y-auto max-h-[50vh] lg:max-h-none">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Run History</h2>
            <p className="text-xs text-cyan-500/60 font-mono mt-1">
              {flowId ? `Flow: ${flowId.slice(0, 12)}...` : 'No flow selected'}
            </p>
          </div>
          <div 
            className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 group"
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
            <History size={20} className="pointer-events-none group-hover:text-cyan-300 transition-colors duration-300" />
          </div>
        </div>

        {/* Run Cards */}
        <div className="space-y-3">
          {loading && <FlowSkeleton count={3} />}
          
          {!loading && runs.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No runs found.</p>
              <p className="text-xs text-slate-600 mt-1">Execute a flow to see history</p>
            </div>
          )}
          
          {!loading && runs.map((run, index) => (
            <button
              key={run.id}
              onClick={() => handleRunClick(run)}
              className={`w-full text-left p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${
                selectedRunId === run.id
                  ? 'bg-[#080F1A] border-cyan-500/50 shadow-[0_0_30px_rgba(34,197,220,0.15)]' 
                  : 'bg-[#080F1A]/60 border-cyan-500/15 hover:border-cyan-500/30 hover:bg-[#080F1A] hover:shadow-[0_0_20px_rgba(34,197,220,0.1)]'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  selectedRunId === run.id 
                    ? 'bg-cyan-500/30 text-cyan-300' 
                    : 'bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20'
                }`}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-cyan-500/60">#{run.id.slice(0, 8)}</span>
                    <span className="text-[10px] text-slate-600">•</span>
                    <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${
                      run.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      run.status === 'failed' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      run.status === 'running' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                      {getStatusIcon(run.status)}
                      <span className="capitalize">{run.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={10} />
                    <span>{new Date(run.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
              
              {/* Run metadata */}
              {run.taskRuns && run.taskRuns.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600 ml-11">
                  <span>{run.taskRuns.length} tasks executed</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Side - Run Details */}
      <div className="w-full lg:w-2/3 p-4 md:p-8 overflow-y-auto">
        {selectedRunId ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-cyan-500/15">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Terminal size={20} className="text-cyan-500" />
                  Run Details
                </h3>
                <p className="text-xs font-mono text-cyan-500/60 mt-1">
                  ID: {selectedRunId}
                </p>
              </div>
              {runs.find(r => r.id === selectedRunId)?.status === 'running' && (
                <span className="text-cyan-400 text-xs animate-pulse flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Live
                </span>
              )}
            </div>

            {/* Run Info Card */}
            <div className="p-4 bg-[#080F1A]/50 border border-cyan-500/10 rounded-xl hover:border-cyan-500/20 transition-all">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono text-slate-500 mb-1 uppercase tracking-wider">Status</p>
                  {(() => {
                    const run = runs.find(r => r.id === selectedRunId);
                    if (!run) return null;
                    return (
                      <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${
                        run.status === 'completed' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                        run.status === 'failed' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                        run.status === 'running' ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' :
                        'bg-slate-500/15 border-slate-500/30 text-slate-400'
                      }`}>
                        {getStatusIcon(run.status)}
                        <span className="capitalize font-medium">{run.status}</span>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500 mb-1 uppercase tracking-wider">Created</p>
                  <p className="text-sm text-slate-300">
                    {new Date(runs.find(r => r.id === selectedRunId)?.createdAt || '').toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Console Output */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-cyan-500" />
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Console Output</label>
              </div>
              <div className="bg-black/50 border border-cyan-500/20 rounded-xl overflow-hidden shadow-inner hover:border-cyan-500/30 transition-all">
                <div className="bg-[#0a1628] p-3 border-b border-cyan-500/20 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="text-[10px] font-mono text-slate-500 ml-2">execution.log</span>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-2">
                  {runLogs.length > 0 ? (
                    runLogs.map((log, i) => (
                      <div key={i} className="text-slate-300 leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 italic">
                      {runs.find(r => r.id === selectedRunId)?.status === 'running' 
                        ? 'Waiting for logs...' 
                        : 'No logs available for this run.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Task Runs (if available) */}
            {(() => {
              const run = runs.find(r => r.id === selectedRunId);
              if (run?.taskRuns && run.taskRuns.length > 0) {
                return (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Task Execution</label>
                    <div className="space-y-2">
                      {run.taskRuns.map((taskRun, idx) => (
                        <div 
                          key={idx}
                          className="p-3 bg-[#080F1A]/50 border border-cyan-500/10 rounded-lg hover:border-cyan-500/20 hover:bg-[#080F1A]/70 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium font-mono">{taskRun.taskId}</span>
                            <div className={`text-xs px-2 py-0.5 rounded font-medium ${
                              taskRun.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              taskRun.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {taskRun.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <div 
              className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 cursor-pointer group"
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
              <Terminal size={32} className="text-cyan-500/50 group-hover:text-cyan-400 transition-colors duration-300 pointer-events-none" />
            </div>
            <p className="text-lg text-slate-400">Select a run to view details</p>
            <p className="text-sm text-slate-600 mt-1">Click on any run from the list</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;