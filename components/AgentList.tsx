import React from 'react';
import { AgentConfig } from '../types';
import { Plus, Bot } from 'lucide-react';

interface AgentListProps {
  agents: AgentConfig[];
  editingId: string | null;
  onEdit: (agent: AgentConfig) => void;
  onCreate: () => void;
}

const AgentList: React.FC<AgentListProps> = React.memo(({ agents, editingId, onEdit, onCreate }) => {
  return (
    <div className="w-full lg:w-1/3 lg:border-r border-cyan-500/15 p-4 md:p-6 overflow-y-auto max-h-[50vh] lg:max-h-none">
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-bold text-white cursor-default"
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
            e.currentTarget.style.textShadow = `0 0 40px rgba(34, 197, 220, 0.5), 0 ${moveY + 20}px 30px rgba(0, 0, 0, 0.4)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
            e.currentTarget.style.textShadow = 'none';
          }}
        >
          Agents
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onCreate}
            className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 group"
            title="Create New Agent"
            aria-label="Create new agent"
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
            <Plus size={20} aria-hidden="true" className="pointer-events-none group-hover:text-cyan-300 transition-colors duration-300" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {agents.map((agent, index) => (
          <button 
            key={agent.id}
            onClick={() => onEdit(agent)}
            className={`w-full text-left p-4 rounded-xl border cursor-pointer group ${
              editingId === agent.id 
                ? 'bg-[#080F1A] border-cyan-500/50 shadow-[0_0_30px_rgba(34,197,220,0.15)]' 
                : 'bg-[#080F1A]/60 border-cyan-500/15 hover:border-cyan-500/30 hover:bg-[#080F1A] hover:shadow-[0_0_20px_rgba(34,197,220,0.1)]'
            }`}
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
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold transition-all ${
                editingId === agent.id 
                  ? 'bg-cyan-500/30 text-cyan-300' 
                  : 'bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20'
              }`}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{agent.name || 'Unnamed Agent'}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-500/60">{agent.id}</span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-[10px] text-slate-500">{agent.role}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 ml-11">{agent.goal || 'No goal defined'}</p>
            {agent.tools.length > 0 && (
              <div className="flex gap-1 mt-2 ml-11 flex-wrap">
                {agent.tools.slice(0, 3).map(tool => (
                  <span key={tool} className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400/80 rounded font-mono">
                    {tool}
                  </span>
                ))}
                {agent.tools.length > 3 && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-500/20 text-slate-400 rounded">
                    +{agent.tools.length - 3}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
        {agents.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Bot size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No agents defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default AgentList;
