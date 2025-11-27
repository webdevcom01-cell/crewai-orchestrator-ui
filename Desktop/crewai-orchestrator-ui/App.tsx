import React, { useState } from 'react';
import Navigation from './components/Navigation';
import AgentsView from './components/AgentsView';
import TasksView from './components/TasksView';
import CrewView from './components/CrewView';
import ExportView from './components/ExportView';
import { Agent, Task } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('agents');
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      role: 'Senior Python Developer',
      goal: 'Write production-ready Python code for the CrewAI agents.',
      backstory: 'A seasoned developer with 10 years of experience in distributed systems and AI. prefers clean, type-safe code.',
      allowDelegation: false,
      verbose: true,
      tools: ['FileReadTool', 'FileWriteTool'],
      model: 'gpt-4o',
    }
  ]);
  const [tasks, setTasks] = useState<Task[]>([
     {
      id: '1',
      description: 'Create a main.py file that initializes a standard CrewAI flow with 2 agents.',
      expectedOutput: 'A valid python file content.',
      agentId: '1',
      asyncExecution: false,
    }
  ]);

  const renderView = () => {
    switch (currentView) {
      case 'agents':
        return <AgentsView agents={agents} setAgents={setAgents} />;
      case 'tasks':
        return <TasksView tasks={tasks} setTasks={setTasks} agents={agents} />;
      case 'run':
        return <CrewView agents={agents} tasks={tasks} />;
      case 'export':
        return <ExportView agents={agents} tasks={tasks} />;
      default:
        return <AgentsView agents={agents} setAgents={setAgents} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200">
      <Navigation currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
           <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 h-full">
           {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;