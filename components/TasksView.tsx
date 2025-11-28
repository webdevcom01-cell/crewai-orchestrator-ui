import React, { useState, useCallback, useMemo } from 'react';
import { TaskConfig, AgentConfig } from '../types';
import { Plus, Trash2, Save, ArrowRight, FileText, User, Link2, Play, GitBranch, Hash } from 'lucide-react';
import { apiTasks } from '../services/api';
import { ACTION_TYPES } from '../reducer';
import { useOrchestrator } from '../hooks';
import { useToast } from './ui/Toast';
import Modal from './ui/Modal';
import { FlowSkeleton, FormSkeleton } from './ui/Skeleton';
import { sanitizeId, escapeYaml } from '../utils/helpers';
import TaskCard from './TaskCard';

// =============================================================================
// TasksView - Main Component
// =============================================================================

const emptyTask: TaskConfig = {
  id: '',
  name: '',
  description: '',
  expectedOutput: '',
  agentId: '',
  contextTaskIds: [],
  isEntrypoint: false,
};

const TasksView: React.FC = () => {
  const { state, dispatch } = useOrchestrator();
  const { tasks, agents, isLoading } = state;
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<TaskConfig>(emptyTask);

  const handleCreate = useCallback(() => {
    const newId = crypto.randomUUID();
    const newTask = { ...emptyTask, id: newId, name: 'New Task' };
    setFormData(newTask);
    setEditingId(newId);
  }, []);

  const handleEdit = useCallback((task: TaskConfig) => {
    setFormData({ ...task, contextTaskIds: task.contextTaskIds || [] });
    setEditingId(task.id);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const isNew = !tasks.some(t => t.id === formData.id);
      
      if (isNew) {
        // Create - formData has id which is optional in create API
        const createdTask = await apiTasks.create(formData);
        dispatch({ type: ACTION_TYPES.ADD_TASK, payload: createdTask });
        showToast({ type: 'success', title: 'Task Created', message: 'Task created successfully.' });
      } else {
        // Update
        const updatedTask = await apiTasks.update(formData.id, formData);
        dispatch({ type: ACTION_TYPES.UPDATE_TASK, payload: updatedTask });
        showToast({ type: 'success', title: 'Task Updated', message: 'Task updated successfully.' });
      }
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save task:", error);
      const errorMessage = error instanceof Error ? error.message : 'Network error or server unavailable';
      showToast({ 
        type: 'error', 
        title: 'Save Failed', 
        message: errorMessage 
      });
    }
  }, [tasks, formData, dispatch, showToast]);

  const confirmDelete = useCallback((id: string) => {
    setTaskToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!taskToDelete) return;
    const id = taskToDelete;

    try {
      await apiTasks.delete(id);
      dispatch({ type: ACTION_TYPES.DELETE_TASK, payload: { id } });
      
      // Also remove from context of other tasks - this should ideally be handled by backend or reducer
      // But for local state consistency, we might need to update others.
      // The reducer DELETE_TASK doesn't automatically clean up references in other tasks.
      // We might need to fetch all tasks again or dispatch updates for affected tasks.
      // For now, we'll rely on the fact that if a task is deleted, it just won't be found in context lookups.
      
      if (editingId === id) setEditingId(null);
      showToast({ type: 'success', title: 'Task Deleted', message: 'Task deleted successfully.' });
    } catch (error) {
      console.error("Failed to delete task:", error);
      const errorMessage = error instanceof Error ? error.message : 'Network error or server unavailable';
      showToast({ 
        type: 'error', 
        title: 'Delete Failed', 
        message: errorMessage 
      });
    } finally {
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  }, [taskToDelete, dispatch, editingId, showToast]);

  // Note: Reordering is not supported by the current API/Reducer structure.
  // This is a placeholder that logs a warning. Remove useCallback since it does nothing useful.
  const moveTask = (index: number, direction: 'up' | 'down') => {
    console.warn("Task reordering is not currently persisted. Implement flow-based ordering.");
  };

  // Memoized helper functions to prevent unnecessary re-renders
  const getAgentName = useCallback((id: string | null): string => {
    if (!id) return 'Unassigned';
    const agent = agents.find(a => a.id === id);
    return agent?.name || agent?.role || 'Unknown';
  }, [agents]);

  // Get task variable name from task ID or generate from description
  const getTaskId = useCallback((task: TaskConfig): string => {
    if (task.id && !task.id.includes('-')) {
      return task.id;
    }
    // Generate from description
    const desc = (task.description || 'task').toLowerCase();
    const words = desc.split(' ').slice(0, 2).filter(w => w.length > 2);
    return words.join('_') + '_task';
  }, []);

  const toggleContext = useCallback((taskId: string) => {
    setFormData(prev => ({
      ...prev,
      contextTaskIds: prev.contextTaskIds.includes(taskId)
        ? prev.contextTaskIds.filter(c => c !== taskId)
        : [...prev.contextTaskIds, taskId]
    }));
  }, []);

  // Get tasks that can be in context (all tasks before current one)
  // Memoized to prevent recalculation on every render
  const availableContextTasks = useMemo(() => {
    const currentIndex = tasks.findIndex(t => t.id === formData.id);
    if (currentIndex <= 0) return [];
    return tasks.slice(0, currentIndex);
  }, [tasks, formData.id]);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Flow Column - Visual Pipeline */}
      <div className="w-full lg:w-1/3 lg:border-r border-cyan-500/15 p-4 md:p-6 overflow-y-auto backdrop-blur-sm max-h-[50vh] lg:max-h-none">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Task Flow</h2>
            <p className="text-xs text-cyan-500/60 font-mono mt-1">Sequential Pipeline</p>
          </div>
          <button 
            onClick={handleCreate}
            aria-label="Create new task"
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
            <Plus size={20} aria-hidden="true" className="pointer-events-none group-hover:text-cyan-300 transition-colors duration-300" />
          </button>
        </div>

        {/* Flow Visualization */}
        <div className="space-y-0">
          {isLoading ? (
            <FlowSkeleton count={4} />
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Play size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tasks in pipeline.</p>
              <p className="text-xs text-slate-600 mt-1">Click + to add first step</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                editingId={editingId}
                tasksLength={tasks.length}
                agents={agents}
                tasks={tasks}
                onEdit={handleEdit}
                onMoveTask={moveTask}
                getTaskId={getTaskId}
                getAgentName={getAgentName}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit Column */}
      <div className="w-full lg:w-2/3 p-4 md:p-8 overflow-y-auto">
        {editingId ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-cyan-500/15">
              <div>
                <h3 className="text-xl font-semibold text-white">Configure Task Step</h3>
                <p className="text-xs font-mono text-cyan-500/60 mt-1">
                  TaskConfig → id: "{formData.id}"
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => confirmDelete(formData.id)}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium text-sm hover:shadow-[0_0_20px_rgba(34,197,220,0.2)]"
                >
                  <Save size={16} />
                  Save Task
                </button>
              </div>
            </div>

            {/* Task ID & Name */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="task-id" className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <Hash size={14} className="text-cyan-500" aria-hidden="true" />
                  Task ID
                  <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">id:</span>
                </label>
                <input 
                  id="task-id"
                  type="text" 
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: sanitizeId(e.target.value)})}
                  className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all duration-200 placeholder:text-slate-600 font-mono"
                  placeholder="e.g. research_task"
                  aria-describedby="task-id-hint"
                />
                <p id="task-id-hint" className="text-[10px] text-slate-500">Jedinstveni ID taska (snake_case)</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="task-name" className="text-xs font-medium text-slate-400 flex items-center gap-2">
                  <FileText size={14} className="text-cyan-500" aria-hidden="true" />
                  Task Name
                  <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">name:</span>
                </label>
                <input 
                  id="task-name"
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all duration-200 placeholder:text-slate-600"
                  placeholder="e.g. Research Phase"
                  aria-describedby="task-name-hint"
                />
                <p id="task-name-hint" className="text-[10px] text-slate-500">Prikazno ime stepa</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="task-description" className="text-xs font-medium text-slate-400 flex items-center gap-2">
                <FileText size={14} className="text-cyan-500" aria-hidden="true" />
                Description
                <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">description:</span>
              </label>
              <textarea 
                id="task-description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 h-32 resize-none transition-all duration-200 placeholder:text-slate-600 font-mono text-sm"
                placeholder="Detaljan opis šta agent treba da uradi u ovom koraku..."
                aria-describedby="task-description-hint"
              />
              <p id="task-description-hint" className="text-[10px] text-slate-500">Jasan opis šta se radi u ovom koraku - koristi {'{feature}'} za input varijable</p>
            </div>

            {/* Expected Output */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
                <ArrowRight size={14} className="text-cyan-500" />
                Expected Output
                <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">expected_output:</span>
              </label>
              <textarea 
                value={formData.expectedOutput}
                onChange={e => setFormData({...formData, expectedOutput: e.target.value})}
                className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 h-24 resize-none transition-all duration-200 placeholder:text-slate-600 font-mono text-sm"
                placeholder="Format i struktura očekivanog rezultata..."
              />
              <p className="text-[10px] text-slate-500">Opis kako izgleda kraj - format, nivo detalja, struktura</p>
            </div>

            {/* Agent Assignment - Python: agent= */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
                <User size={14} className="text-cyan-500" />
                Assigned Agent
                <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">agent=</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setFormData({...formData, agentId: agent.id})}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                      formData.agentId === agent.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                        : 'bg-[#080F1A] border-cyan-500/15 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${formData.agentId === agent.id ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                      <span className={`text-sm font-medium ${formData.agentId === agent.id ? 'text-emerald-400' : 'text-white'}`}>
                        {agent.name || agent.role}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{agent.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
                <Link2 size={14} className="text-cyan-500" />
                Context Dependencies
                <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">context:</span>
                <span className="text-[10px] text-yellow-400 ml-2">{formData.contextTaskIds.length} linked</span>
              </label>
              
              {availableContextTasks.length > 0 ? (
                <div className="p-4 bg-[#080F1A]/50 border border-cyan-500/10 rounded-lg space-y-2">
                  <p className="text-[10px] text-slate-500 mb-3">Selektuj taskove čiji output se koristi kao ulaz za ovaj task:</p>
                  {availableContextTasks.map((task) => {
                    const isSelected = formData.contextTaskIds.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleContext(task.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-[#080F1A] border-cyan-500/15 hover:border-cyan-500/30'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-yellow-500/20 border-yellow-500/50' : 'border-slate-600'
                        }`}>
                          {isSelected && <GitBranch size={12} className="text-yellow-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-cyan-500">{getTaskId(task)}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {task.description?.slice(0, 50)}...
                          </p>
                        </div>
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-mono">
                            linked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-[#080F1A]/30 border border-cyan-500/10 rounded-lg text-center">
                  <p className="text-xs text-slate-500">Ovo je prvi task - nema prethodnih taskova za context</p>
                </div>
              )}
              <p className="text-[10px] text-slate-500">Veze ka prethodnim stepovima čiji se output koristi kao ulaz</p>
            </div>

            {/* Options */}
            <div className="p-4 bg-[#080F1A]/50 border border-cyan-500/10 rounded-lg">
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.isEntrypoint}
                    onChange={e => setFormData({...formData, isEntrypoint: e.target.checked})}
                    className="w-4 h-4 rounded border-cyan-500/30 bg-[#080F1A] text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-[#050608]"
                  />
                  <div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Is Entrypoint</span>
                    <span className="text-[10px] font-mono text-cyan-500/50 ml-2">is_entrypoint:</span>
                  </div>
                </label>
              </div>
            </div>

            {/* YAML Preview */}
            <div className="p-4 bg-[#0a1628] border border-cyan-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="text-[10px] font-mono text-slate-500 ml-2">TaskConfig (YAML)</span>
              </div>
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
                <code>
{`${escapeYaml(formData.id) || 'task'}:
  id: "${escapeYaml(formData.id) || '...'}"
  name: "${escapeYaml(formData.name) || '...'}"
  description: "${escapeYaml(formData.description?.slice(0, 40)) || '...'}${(formData.description?.length || 0) > 40 ? '...' : ''}"
  expected_output: "${escapeYaml(formData.expectedOutput?.slice(0, 30)) || '...'}${(formData.expectedOutput?.length || 0) > 30 ? '...' : ''}"
  agent_id: "${escapeYaml(formData.agentId) || '...'}"
  context_task_ids: [${formData.contextTaskIds.map(c => `"${escapeYaml(c)}"`).join(', ')}]
  is_entrypoint: ${formData.isEntrypoint}`}
                </code>
              </pre>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <div 
              className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 cursor-pointer group"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
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
              <Play size={32} className="text-cyan-500/50 group-hover:text-cyan-400 transition-colors duration-300 pointer-events-none" />
            </div>
            <p className="text-lg text-slate-400">Select a task step to edit</p>
            <p className="text-sm text-slate-600 mt-1">or add a new step to the flow</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Task"
        footer={
          <>
            <button 
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Delete Task
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default TasksView;
