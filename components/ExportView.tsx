import React, { useState, useCallback, useMemo } from 'react';
import { TaskConfig } from '../types';
import { Copy, Check, FileText, Download } from 'lucide-react';
import { useOrchestrator } from '../hooks';
import { generateIdFromName } from '../utils/helpers';

const ExportView: React.FC = () => {
  const { state } = useOrchestrator();
  const { agents, tasks, flows, selectedFlowId } = state;
  const flow = flows.find(f => f.id === selectedFlowId) || flows[0];
  const [activeTab, setActiveTab] = useState<'main' | 'agents' | 'tasks' | 'env'>('main');
  const [copied, setCopied] = useState(false);

  const getAgentVariableName = useCallback((role: string) => {
    const nameMap: Record<string, string> = {
      'Senior Researcher': 'research_agent',
      'Senior Python Developer': 'dev_agent',
      'QA Engineer': 'qa_agent',
      'Technical Writer': 'report_agent',
    };
    return nameMap[role] || generateIdFromName(role) + '_agent';
  }, []);

  const getTaskVariableName = useCallback((task: TaskConfig) => {
    return task.id || `task_${tasks.indexOf(task) + 1}`;
  }, [tasks]);

  const generateAgentsPy = () => {
    const allTools = Array.from(new Set(agents.flatMap(a => a.tools))).filter(t => t);
    const toolImports = allTools.length > 0 ? allTools.join(', ') : '';
    
    return `from crewai import Agent
${toolImports ? `from crewai_tools import ${toolImports}` : '# No tools imported'}

${agents.map(agent => {
  const varName = getAgentVariableName(agent.role);
  const toolsList = agent.tools.length > 0 
    ? `[${agent.tools.map(t => `${t}()`).join(', ')}]` 
    : '[]';
  
  return `${varName} = Agent(
    role="${agent.role}",
    goal="${agent.goal.replace(/"/g, '\\"')}",
    backstory="${agent.backstory.replace(/"/g, '\\"')}",
    tools=${toolsList},
    verbose=${agent.verbose ? 'True' : 'False'},
    allow_delegation=${agent.allowDelegation ? 'True' : 'False'},
    llm="${agent.model}",
)`;
}).join('\n\n')}
`;
  };

  const generateTasksPy = () => {
    return `from crewai import Task

${tasks.map((task) => {
  const taskVar = getTaskVariableName(task);
  const agentVar = task.agentId 
    ? getAgentVariableName(agents.find(a => a.id === task.agentId)?.role || 'unknown')
    : 'None';
  
  const contextVars = (task.contextTaskIds || [])
    .map(ctxId => {
      const ctxTask = tasks.find(t => t.id === ctxId);
      return ctxTask ? getTaskVariableName(ctxTask) : null;
    })
    .filter(Boolean);

  const contextLine = contextVars.length > 0 
    ? `\n    context=[${contextVars.join(', ')}],` 
    : '';
  
  return `${taskVar} = Task(
    description=(
        "${task.description.replace(/\n/g, '\\n"\n        "').replace(/"/g, '\\"')}"
    ),
    expected_output=(
        "${task.expectedOutput.replace(/\n/g, '\\n"\n        "').replace(/"/g, '\\"')}"
    ),
    agent=${agentVar},${contextLine}
)`;
}).join('\n\n')}
`;
  };

  const generateMainPy = () => {
    // Filter agents and tasks based on flow config
    const flowAgents = agents.filter(a => flow.agentIds.includes(a.id));
    const flowTasks = tasks.filter(t => flow.taskIds.includes(t.id));

    const agentVars = flowAgents.map(a => getAgentVariableName(a.role));
    const taskVars = flowTasks.map(t => getTaskVariableName(t));
    
    return `from crewai import Crew, Process
from agents import ${agentVars.join(', ')}
from tasks import ${taskVars.join(', ')}

crew = Crew(
    agents=[${agentVars.join(', ')}],
    tasks=[${taskVars.join(', ')}],
    process=Process.${flow.process},
    verbose=True,
)

if __name__ == "__main__":
    result = crew.kickoff(
        inputs={"feature": "REST API endpoint za generisanje i validaciju CrewAI konfiguracije"}
    )
    print(result)
`;
  };

  const generateRequirements = () => {
    return `crewai>=0.80.0
crewai-tools>=0.14.0
python-dotenv`;
  };

  const getCode = useCallback(() => {
    switch(activeTab) {
      case 'agents': return generateAgentsPy();
      case 'tasks': return generateTasksPy();
      case 'env': return generateRequirements();
      default: return generateMainPy();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, agents, tasks, flow?.id]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, agents, tasks, flow?.id]); // Dependencies for getCode - use flow.id to avoid object comparison

  const handleTabChange = useCallback((tab: 'main' | 'agents' | 'tasks' | 'env') => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="h-full flex flex-col text-slate-200">
      <div className="border-b border-cyan-500/15 p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Project Export</h2>
        <p className="text-slate-400 text-xs md:text-sm">Generate production-ready Python code for your CrewAI project.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Tabs - shown only on mobile */}
        <div className="lg:hidden flex overflow-x-auto border-b border-cyan-500/15 px-2 py-2 gap-2">
          <button 
            onClick={() => handleTabChange('main')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border whitespace-nowrap ${activeTab === 'main' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 border-transparent bg-[#080F1A]/40'}`}
          >
            <FileText size={12} /> main.py
          </button>
          <button 
            onClick={() => handleTabChange('agents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border whitespace-nowrap ${activeTab === 'agents' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 border-transparent bg-[#080F1A]/40'}`}
          >
            <FileText size={12} /> agents.py
          </button>
          <button 
            onClick={() => handleTabChange('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border whitespace-nowrap ${activeTab === 'tasks' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 border-transparent bg-[#080F1A]/40'}`}
          >
            <FileText size={12} /> tasks.py
          </button>
          <button 
            onClick={() => handleTabChange('env')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border whitespace-nowrap ${activeTab === 'env' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 border-transparent bg-[#080F1A]/40'}`}
          >
            <FileText size={12} /> requirements.txt
          </button>
        </div>

        {/* File Explorer Sidebar - Desktop */}
        <div className="hidden lg:block w-64 border-r border-cyan-500/15 p-4">
          <h3 className="text-base font-bold text-cyan-400/60 uppercase tracking-wider mb-4 px-2 font-mono">Project Structure</h3>
          <div className="space-y-1">
            <button 
              onClick={() => handleTabChange('main')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md border group ${activeTab === 'main' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-[#080F1A]/40 backdrop-blur-sm border-transparent'}`}
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
              <FileText size={16} className="pointer-events-none" /> main.py
            </button>
            <button 
              onClick={() => handleTabChange('agents')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md border group ${activeTab === 'agents' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-[#080F1A]/40 backdrop-blur-sm border-transparent'}`}
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
              <FileText size={16} className="pointer-events-none" /> agents.py
            </button>
            <button 
              onClick={() => handleTabChange('tasks')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md border group ${activeTab === 'tasks' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-[#080F1A]/40 backdrop-blur-sm border-transparent'}`}
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
              <FileText size={16} className="pointer-events-none" /> tasks.py
            </button>
            <button 
              onClick={() => handleTabChange('env')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md border group ${activeTab === 'env' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-[#080F1A]/40 backdrop-blur-sm border-transparent'}`}
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
              <FileText size={16} className="pointer-events-none" /> requirements.txt
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-cyan-500/15">
            <button 
              className="w-full py-2.5 px-4 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center gap-2 text-sm font-medium border border-cyan-500/30 group"
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
              <Download size={16} className="pointer-events-none group-hover:text-cyan-300 transition-colors duration-300" /> 
              Download ZIP
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="flex-1 flex flex-col relative">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#080F1A]/60 backdrop-blur-sm text-slate-300 rounded-md text-xs font-medium border border-cyan-500/20 group"
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
              {copied ? <Check size={14} className="text-green-400 pointer-events-none" /> : <Copy size={14} className="pointer-events-none group-hover:text-cyan-300 transition-colors duration-300" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-6 font-mono text-sm">
            <pre className="text-slate-300 leading-relaxed">
              <code>{getCode()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportView;