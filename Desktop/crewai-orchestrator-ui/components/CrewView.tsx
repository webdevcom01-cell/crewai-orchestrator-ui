import React, { useState, useRef, useEffect } from 'react';
import { Agent, Task, CrewConfig } from '../types';
import { Play, Loader2, Terminal, AlertTriangle } from 'lucide-react';
import { simulateCrewRun } from '../services/gemini';

interface CrewViewProps {
  agents: Agent[];
  tasks: Task[];
}

const CrewView: React.FC<CrewViewProps> = ({ agents, tasks }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{agent: string, type: string, content: string}[]>([]);
  const [processType, setProcessType] = useState<'sequential' | 'hierarchical'>('sequential');
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleRun = async () => {
    if (agents.length === 0 || tasks.length === 0) return;
    
    setIsRunning(true);
    setLogs([]);
    
    try {
      // Add initial system logs
      setLogs(prev => [...prev, { agent: 'System', type: 'info', content: 'Initializing crew...' }]);
      await new Promise(r => setTimeout(r, 800));
      setLogs(prev => [...prev, { agent: 'System', type: 'info', content: `Loaded ${agents.length} agents and ${tasks.length} tasks.` }]);
      
      const resultJsonString = await simulateCrewRun(agents, tasks, processType);
      
      try {
        const parsedLogs = JSON.parse(resultJsonString);
        
        // Stream the logs for effect
        for (const log of parsedLogs) {
            await new Promise(r => setTimeout(r, 1000)); // Simulate thinking time
            setLogs(prev => [...prev, log]);
        }
        
        setLogs(prev => [...prev, { agent: 'System', type: 'success', content: 'Crew execution finished successfully.' }]);

      } catch (e) {
        console.error("Failed to parse simulation", e);
        setLogs(prev => [...prev, { agent: 'System', type: 'error', content: 'Simulation returned invalid format. See console.' }]);
         // Fallback display
         setLogs(prev => [...prev, { agent: 'Raw Output', type: 'thought', content: resultJsonString }]);
      }

    } catch (error) {
      setLogs(prev => [...prev, { agent: 'System', type: 'error', content: 'Failed to run simulation. Check API Key.' }]);
    } finally {
      setIsRunning(false);
    }
  };

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
    <div className="flex flex-col h-full bg-slate-950">
        {/* Header Control */}
        <div className="border-b border-slate-800 p-6 flex justify-between items-center bg-slate-900">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Crew Execution</h2>
                <p className="text-slate-400 text-sm">Review configuration and start the process</p>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setProcessType('sequential')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${processType === 'sequential' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                    >
                        Sequential
                    </button>
                    <button 
                         onClick={() => setProcessType('hierarchical')}
                         className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${processType === 'hierarchical' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                    >
                        Hierarchical
                    </button>
                </div>

                <button 
                    onClick={handleRun}
                    disabled={isRunning}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                        isRunning 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                    }`}
                >
                    {isRunning ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                    {isRunning ? 'Running Crew...' : 'Start Crew'}
                </button>
            </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <div className="bg-black/50 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden shadow-inner font-mono text-sm">
                <div className="bg-slate-900/80 p-3 border-b border-slate-800 flex items-center gap-2">
                    <Terminal size={14} className="text-slate-500" />
                    <span className="text-slate-500 text-xs">console output</span>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {logs.length === 0 && !isRunning && (
                        <div className="text-slate-600 italic">Ready to start...</div>
                    )}
                    
                    {logs.map((log, idx) => (
                        <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="w-24 text-right flex-shrink-0 text-slate-500 font-bold text-xs pt-1 uppercase tracking-wider">
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
                            <div className="text-slate-500 animate-pulse">_</div>
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