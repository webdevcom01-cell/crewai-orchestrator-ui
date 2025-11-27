import React, { useState } from 'react';
import { Agent, Task } from '../types';
import { Plus, Trash2, CheckSquare, Save } from 'lucide-react';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  agents: Agent[];
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, setTasks, agents }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyTask: Task = {
    id: '',
    description: '',
    expectedOutput: '',
    agentId: null,
    asyncExecution: false,
  };

  const [formData, setFormData] = useState<Task>(emptyTask);

  const handleCreate = () => {
    const newId = crypto.randomUUID();
    const newTask = { ...emptyTask, id: newId };
    setFormData(newTask);
    setEditingId(newId);
  };

  const handleEdit = (task: Task) => {
    setFormData(task);
    setEditingId(task.id);
  };

  const handleSave = () => {
    if (tasks.some(t => t.id === formData.id)) {
      setTasks(tasks.map(t => t.id === formData.id ? formData : t));
    } else {
      setTasks([...tasks, formData]);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const getAgentName = (id: string | null) => {
    if (!id) return 'Unassigned';
    return agents.find(a => a.id === id)?.role || 'Unknown';
  };

  return (
    <div className="flex h-full">
      {/* List Column */}
      <div className="w-1/3 border-r border-slate-800 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <button 
            onClick={handleCreate}
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => handleEdit(task)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                editingId === task.id 
                  ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-slate-900 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                  <CheckSquare size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{task.description || 'New Task'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                       {getAgentName(task.agentId)}
                     </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No tasks defined yet.
            </div>
          )}
        </div>
      </div>

      {/* Edit Column */}
      <div className="w-2/3 p-8 bg-slate-900/50 overflow-y-auto">
        {editingId ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-semibold text-white">Configure Task</h3>
              <div className="flex gap-2">
                 <button 
                  onClick={() => handleDelete(formData.id)}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <Save size={18} />
                  Save Task
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="Detailed description of what needs to be done..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Expected Output</label>
              <textarea 
                value={formData.expectedOutput}
                onChange={e => setFormData({...formData, expectedOutput: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="What exactly should the agent produce?"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Assigned Agent</label>
                <select 
                  value={formData.agentId || ''}
                  onChange={e => setFormData({...formData, agentId: e.target.value || null})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Auto Assign / Manager --</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.role}</option>)}
                </select>
              </div>
              
              <div className="flex items-center pt-8">
                 <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.asyncExecution}
                    onChange={e => setFormData({...formData, asyncExecution: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">Async Execution</span>
                </label>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <CheckSquare size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Select a task to edit or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;