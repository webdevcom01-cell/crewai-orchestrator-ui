import React, { useState } from 'react';
import { Agent, Task } from '../types';
import { Copy, Check, FileText, Download } from 'lucide-react';

interface ExportViewProps {
  agents: Agent[];
  tasks: Task[];
}

const ExportView: React.FC<ExportViewProps> = ({ agents, tasks }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'agents' | 'tasks' | 'env'>('main');
  const [copied, setCopied] = useState(false);

  const getAgentVariableName = (role: string) => {
    return role.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  };

  const generateAgentsPy = () => {
    return `from crewai import Agent
from crewai_tools import ${Array.from(new Set(agents.flatMap(a => a.tools))).filter(t => !['FileRead', 'FileWrite', 'PostgreSQLConnector', 'RedisCache'].includes(t)).join(', ') || 'SerperDevTool'}

class CrewAgents:
${agents.map(agent => `
    def ${getAgentVariableName(agent.role)}(self):
        return Agent(
            role='${agent.role}',
            goal='${agent.goal.replace(/'/g, "\\'")}',
            backstory="""${agent.backstory.replace(/"/g, '\\"')}""",
            verbose=${agent.verbose ? 'True' : 'False'},
            allow_delegation=${agent.allowDelegation ? 'True' : 'False'},
            llm='${agent.model}',
            tools=[${agent.tools.map(t => `${t}()`).join(', ')}]
        )`).join('\n')}
`;
  };

  const generateTasksPy = () => {
    return `from crewai import Task

class CrewTasks:
${tasks.map(task => {
    const agentName = task.agentId 
        ? getAgentVariableName(agents.find(a => a.id === task.agentId)?.role || 'unknown') 
        : 'None';
    return `
    def ${task.description.slice(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '_')}_task(self, agent):
        return Task(
            description="""${task.description.replace(/"/g, '\\"')}""",
            expected_output="""${task.expectedOutput.replace(/"/g, '\\"')}""",
            agent=agent,
            async_execution=${task.asyncExecution ? 'True' : 'False'}
        )`;
}).join('\n')}
`;
  };

  const generateMainPy = () => {
    const agentVars = agents.map(a => getAgentVariableName(a.role));
    
    return `import os
from crewai import Crew, Process
from agents import CrewAgents
from tasks import CrewTasks

# Ensure API keys are set in environment variables
# os.environ["OPENAI_API_KEY"] = "sk-..."

def run():
    # Instantiate classes
    agents = CrewAgents()
    tasks = CrewTasks()

    # Create Agents
${agents.map(a => `    ${getAgentVariableName(a.role)} = agents.${getAgentVariableName(a.role)}()`).join('\n')}

    # Create Tasks
${tasks.map(t => {
    const taskName = t.description.slice(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '_') + '_task';
    const agentVar = t.agentId ? getAgentVariableName(agents.find(a => a.id === t.agentId)?.role || '') : 'None';
    return `    ${taskName} = tasks.${taskName}(${agentVar})`;
}).join('\n')}

    # Instantiate Crew
    crew = Crew(
        agents=[${agentVars.join(', ')}],
        tasks=[${tasks.map(t => t.description.slice(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '_') + '_task').join(', ')}],
        process=Process.sequential,
        verbose=True
    )

    result = crew.kickoff()
    print("######################")
    print(result)

if __name__ == "__main__":
    run()
`;
  };

  const generateRequirements = () => {
    return `crewai>=0.28.8
crewai-tools>=0.2.6
langchain-openai
python-dotenv`;
  };

  const getCode = () => {
    switch(activeTab) {
      case 'agents': return generateAgentsPy();
      case 'tasks': return generateTasksPy();
      case 'env': return generateRequirements();
      default: return generateMainPy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200">
      <div className="border-b border-slate-800 p-6 bg-slate-900">
        <h2 className="text-2xl font-bold text-white mb-2">Project Export</h2>
        <p className="text-slate-400 text-sm">Generate production-ready Python code for your CrewAI project.</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Project Structure</h3>
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('main')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'main' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <FileText size={16} /> main.py
            </button>
            <button 
              onClick={() => setActiveTab('agents')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'agents' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <FileText size={16} /> agents.py
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'tasks' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <FileText size={16} /> tasks.py
            </button>
            <button 
              onClick={() => setActiveTab('env')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'env' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <FileText size={16} /> requirements.txt
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <button className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors">
              <Download size={16} /> Download ZIP
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="flex-1 flex flex-col bg-slate-950 relative">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
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