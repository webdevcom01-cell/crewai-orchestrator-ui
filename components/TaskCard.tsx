import React, { useCallback, memo } from 'react';
import { TaskConfig, AgentConfig } from '../types';
import { ArrowRight, User, GitBranch, ChevronDown, ChevronUp } from 'lucide-react';

export interface TaskCardProps {
  task: TaskConfig;
  index: number;
  editingId: string | null;
  tasksLength: number;
  agents: AgentConfig[];
  tasks: TaskConfig[];
  onEdit: (task: TaskConfig) => void;
  onMoveTask: (index: number, direction: 'up' | 'down') => void;
  getTaskId: (task: TaskConfig) => string;
  getAgentName: (id: string | null) => string;
}

const TaskCard = memo<TaskCardProps>(({ 
  task, 
  index, 
  editingId, 
  tasksLength,
  agents,
  tasks,
  onEdit, 
  onMoveTask,
  getTaskId,
  getAgentName 
}) => {
  const hasContext = (task.contextTaskIds || []).length > 0;
  const isEditing = editingId === task.id;

  const handleMoveUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveTask(index, 'up');
  }, [index, onMoveTask]);

  const handleMoveDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveTask(index, 'down');
  }, [index, onMoveTask]);

  const handleClick = useCallback(() => {
    onEdit(task);
  }, [task, onEdit]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
    e.currentTarget.style.boxShadow = 'none';
  }, []);

  return (
    <div className="relative">
      {/* Connection Line */}
      {index > 0 && (
        <div className="flex justify-center py-2">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-500/50 to-cyan-500/20"></div>
            <div 
              className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 cursor-pointer group"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) / (rect.width / 2);
                const deltaY = (e.clientY - centerY) / (rect.height / 2);
                
                const tiltX = deltaY * -12;
                const tiltY = deltaX * 12;
                const moveX = deltaX * 8;
                const moveY = deltaY * 8;
                
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 6}px) scale(1.15)`;
                e.currentTarget.style.boxShadow = `0 0 30px rgba(34, 197, 220, 0.6), 0 ${moveY + 15}px 25px rgba(0, 0, 0, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <ArrowRight size={14} className="text-cyan-500/50 rotate-90 group-hover:text-cyan-400 transition-colors duration-300 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
      
      {/* Task Card */}
      <div 
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        role="button"
        tabIndex={0}
        aria-label={`Task ${index + 1}: ${task.name || task.description?.slice(0, 30) || 'Unnamed task'}. Press Enter to edit.`}
        aria-pressed={isEditing}
        className={`relative p-4 rounded-xl border cursor-pointer ${
          isEditing 
            ? 'bg-[#080F1A] border-cyan-500/50 shadow-[0_0_30px_rgba(34,197,220,0.15)]' 
            : 'bg-[#080F1A]/60 border-cyan-500/15 hover:border-cyan-500/30 hover:bg-[#080F1A]'
        }`}
        style={{ 
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Step Number & Reorder */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <button 
            onClick={handleMoveUp}
            aria-label={`Move task ${index + 1} up`}
            disabled={index === 0}
            className={`p-1 rounded-lg bg-cyan-500/5 border border-transparent hover:border-cyan-500/20 text-slate-500 hover:text-cyan-400 transition-all duration-300 group ${index === 0 ? 'opacity-30 pointer-events-none' : ''}`}
            style={{ 
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform'
            }}
            onMouseMove={(e) => {
              if (index === 0) return;
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const deltaX = (e.clientX - centerX) / (rect.width / 2);
              const deltaY = (e.clientY - centerY) / (rect.height / 2);
              
              const tiltX = deltaY * -10;
              const tiltY = deltaX * 10;
              const moveX = deltaX * 6;
              const moveY = deltaY * 6;
              
              e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 4}px) scale(1.12)`;
              e.currentTarget.style.boxShadow = `0 0 20px rgba(34, 197, 220, 0.5), 0 ${moveY + 10}px 20px rgba(0, 0, 0, 0.3)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ChevronUp size={20} aria-hidden="true" className="pointer-events-none group-hover:text-cyan-300 transition-colors duration-300" />
          </button>
          <div 
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold ${
              isEditing 
                ? 'bg-cyan-500 text-black' 
                : 'bg-cyan-500/20 text-cyan-400'
            }`}
            aria-label={`Step ${index + 1}`}
          >
            {index + 1}
          </div>
          <button 
            onClick={handleMoveDown}
            aria-label={`Move task ${index + 1} down`}
            disabled={index === tasksLength - 1}
            className={`p-1 rounded-lg bg-cyan-500/5 border border-transparent hover:border-cyan-500/20 text-slate-500 hover:text-cyan-400 transition-all duration-300 group ${index === tasksLength - 1 ? 'opacity-30 pointer-events-none' : ''}`}
            style={{ 
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform'
            }}
            onMouseMove={(e) => {
              if (index === tasksLength - 1) return;
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const deltaX = (e.clientX - centerX) / (rect.width / 2);
              const deltaY = (e.clientY - centerY) / (rect.height / 2);
              
              const tiltX = deltaY * -10;
              const tiltY = deltaX * 10;
              const moveX = deltaX * 6;
              const moveY = deltaY * 6;
              
              e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 4}px) scale(1.12)`;
              e.currentTarget.style.boxShadow = `0 0 20px rgba(34, 197, 220, 0.5), 0 ${moveY + 10}px 20px rgba(0, 0, 0, 0.3)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ChevronDown size={20} aria-hidden="true" className="pointer-events-none group-hover:text-cyan-300 transition-colors duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="ml-4">
          {/* Task ID */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-cyan-500/60">{getTaskId(task)}</span>
            {hasContext && (
              <div className="flex items-center gap-1 text-[10px] text-yellow-500/80">
                <GitBranch size={10} />
                <span>context</span>
              </div>
            )}
          </div>
          
          {/* Description Preview */}
          <p className="text-sm text-white font-medium line-clamp-2 mb-3">
            {task.description?.slice(0, 60) || 'No description'}...
          </p>
          
          {/* Agent Badge */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
              task.agentId 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
            }`}>
              <User size={12} />
              <span>{getAgentName(task.agentId)}</span>
            </div>
            {task.agentId && (
              <span className="text-[10px] font-mono text-slate-500">
                {task.agentId}
              </span>
            )}
          </div>

          {/* Context Preview */}
          {hasContext && (
            <div className="mt-2 flex flex-wrap gap-1">
              {(task.contextTaskIds || []).map(ctxId => {
                const ctxTask = tasks.find(t => t.id === ctxId);
                return (
                  <span key={ctxId} className="text-[9px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400/80 rounded font-mono border border-yellow-500/20">
                    ← {ctxTask ? getTaskId(ctxTask) : ctxId}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
