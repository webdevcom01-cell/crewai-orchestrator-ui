import React, { useState } from 'react';
import { Agent, AVAILABLE_MODELS, AVAILABLE_TOOLS } from '../types';
import { Plus, Trash2, Bot, Sparkles, Save } from 'lucide-react';
import { generateAgentBackstory } from '../services/gemini';

interface AgentsViewProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const AgentsView: React.FC<AgentsViewProps> = ({ agents, setAgents }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);
  
  // Empty state for new agent
  const emptyAgent: Agent = {
    id: '',
    role: '',
    goal: '',
    backstory: '',
    allowDelegation: false,
    verbose: true,
    tools: [],
    model: AVAILABLE_MODELS[0],
  };

  const [formData, setFormData] = useState<Agent>(emptyAgent);

  const handleCreate = () => {
    const newId = crypto.randomUUID();
    const newAgent = { ...emptyAgent, id: newId };
    setFormData(newAgent);
    setEditingId(newId);
  };

  const handleEdit = (agent: Agent) => {
    setFormData(agent);
    setEditingId(agent.id);
  };

  const handleSave = () => {
    if (agents.some(a => a.id === formData.id)) {
      setAgents(agents.map(a => a.id === formData.id ? formData : a));
    } else {
      setAgents([...agents, formData]);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setAgents(agents.filter(a => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const generateBackstory = async () => {
    if (!formData.role || !formData.goal) return;
    setLoadingStory(true);
    const story = await generateAgentBackstory(formData.role, formData.goal);
    setFormData(prev => ({ ...prev, backstory: story }));
    setLoadingStory(false);
  };

  const toggleTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  return (
    <div className="flex h-full">
      {/* List Column */}
      <div className="w-1/3 border-r border-slate-800 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Agents</h2>
          <button 
            onClick={handleCreate}
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {agents.map(agent => (
            <div 
              key={agent.id}
              onClick={() => handleEdit(agent)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                editingId === agent.id 
                  ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-slate-900 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bot size={18} />
                </div>
                <h3 className="font-semibold text-white">{agent.role || 'Unnamed Agent'}</h3>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{agent.goal || 'No goal defined'}</p>
            </div>
          ))}
          {agents.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No agents defined yet.
            </div>
          )}
        </div>
      </div>

      {/* Edit Column */}
      <div className="w-2/3 p-8 bg-slate-900/50 overflow-y-auto">
        {editingId ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-semibold text-white">Configure Agent</h3>
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
                  Save Agent
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Role</label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Senior Research Analyst"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Model</label>
                <select 
                  value={formData.model}
                  onChange={e => setFormData({...formData, model: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  {AVAILABLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Goal</label>
              <textarea 
                value={formData.goal}
                onChange={e => setFormData({...formData, goal: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="What is this agent trying to achieve?"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-400">Backstory</label>
                <button 
                  onClick={generateBackstory}
                  disabled={loadingStory || !formData.role || !formData.goal}
                  className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {loadingStory ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea 
                value={formData.backstory}
                onChange={e => setFormData({...formData, backstory: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                placeholder="Provide context and personality..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-400">Tools</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TOOLS.map(tool => (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      formData.tools.includes(tool)
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-8 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.allowDelegation}
                  onChange={e => setFormData({...formData, allowDelegation: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-300">Allow Delegation</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.verbose}
                  onChange={e => setFormData({...formData, verbose: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-300">Verbose Logging</span>
              </label>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Bot size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Select an agent to edit or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsView;