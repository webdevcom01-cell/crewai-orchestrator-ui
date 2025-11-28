import React, { useState, useEffect, useCallback } from 'react';
import { AgentConfig, AVAILABLE_MODELS, AVAILABLE_TOOLS } from '../types';
import { Trash2, Bot, Sparkles, Save, Cpu, Target, BookOpen, Wrench, Settings2, Hash, User } from 'lucide-react';
import { generateAgentBackstory } from '../services/gemini';
import { sanitizeId, escapeYaml } from '../utils/helpers';

interface AgentFormProps {
  initialData: AgentConfig;
  onSave: (agent: AgentConfig) => Promise<void>;
  onDelete: (id: string) => void;
}

const AgentForm: React.FC<AgentFormProps> = React.memo(({ initialData, onSave, onDelete }) => {
  const [formData, setFormData] = useState<AgentConfig>(initialData);
  const [loadingStory, setLoadingStory] = useState(false);

  // Reset form when initialData changes (e.g. selecting a different agent)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const generateBackstory = useCallback(async () => {
    if (!formData.role || !formData.goal) return;
    setLoadingStory(true);
    try {
      const story = await generateAgentBackstory(formData.role, formData.goal);
      setFormData(prev => ({ ...prev, backstory: story }));
    } catch (e) {
      console.error("Failed to generate backstory", e);
    }
    setLoadingStory(false);
  }, [formData.role, formData.goal]);

  const toggleTool = useCallback((tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  }, []);

  return (
    <div className="w-full lg:w-2/3 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-cyan-500/15">
          <div>
            <h3 className="text-xl font-semibold text-white">Configure Agent</h3>
            <p className="text-xs font-mono text-cyan-500/60 mt-1">
              AgentConfig → id: "{formData.id}"
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onDelete(formData.id)}
              className="px-6 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium min-w-[140px] justify-center"
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
                e.currentTarget.style.boxShadow = `0 0 40px rgba(239, 68, 68, 0.5), 0 ${moveY + 20}px 30px rgba(0, 0, 0, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Trash2 size={16} className="pointer-events-none" />
              Delete
            </button>
            <button 
              onClick={() => onSave(formData)}
              className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium text-sm hover:shadow-[0_0_20px_rgba(34,197,220,0.2)] min-w-[140px] justify-center"
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
              <Save size={16} className="pointer-events-none" />
              Save Agent
            </button>
          </div>
        </div>

        {/* Name & ID */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="agent-name" className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <User size={14} className="text-cyan-500" />
              Name
              <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">name:</span>
            </label>
            <input 
              id="agent-name"
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all duration-200 placeholder:text-slate-600"
              placeholder="e.g. ResearchAgent"
            />
            <p className="text-[10px] text-slate-500">Prikazno ime u UI</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="agent-id" className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Hash size={14} className="text-cyan-500" />
              ID
              <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">id:</span>
            </label>
            <input 
              id="agent-id"
              type="text" 
              value={formData.id}
              onChange={e => setFormData({...formData, id: sanitizeId(e.target.value)})}
              className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all duration-200 placeholder:text-slate-600 font-mono"
              placeholder="e.g. research_agent"
            />
            <p className="text-[10px] text-slate-500">Interni ID (snake_case)</p>
          </div>
        </div>

        {/* Role & Model - Python: role= i llm= */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="agent-role" className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Bot size={14} className="text-cyan-500" />
              Role
              <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">role:</span>
            </label>
            <input 
              id="agent-role"
              type="text" 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all duration-200 placeholder:text-slate-600"
              placeholder="e.g. Senior Research Analyst"
            />
            <p className="text-[10px] text-slate-500">Funkcija i ekspertiza agenta</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="agent-model" className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <Cpu size={14} className="text-cyan-500" />
              Model (LLM)
              <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">model:</span>
            </label>
            <select 
              id="agent-model"
              value={formData.model}
              onChange={e => setFormData({...formData, model: e.target.value})}
              className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all duration-200"
            >
              {AVAILABLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <p className="text-[10px] text-slate-500">AI model koji agent koristi</p>
          </div>
        </div>

        {/* Goal - Python: goal= */}
        <div className="space-y-2">
          <label htmlFor="agent-goal" className="text-xs font-medium text-slate-400 flex items-center gap-2">
            <Target size={14} className="text-cyan-500" />
            Goal
            <span className="text-[10px] font-mono text-cyan-500/50 ml-auto">goal:</span>
          </label>
          <textarea 
            id="agent-goal"
            value={formData.goal}
            onChange={e => setFormData({...formData, goal: e.target.value})}
            className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 h-24 resize-none transition-all duration-200 placeholder:text-slate-600"
            placeholder="Šta agent pokušava da postigne samostalno?"
          />
          <p className="text-[10px] text-slate-500">Cilj koji agent pokušava da ostvari - koristi se kao kontekst za LLM</p>
        </div>

        {/* Backstory - Python: backstory= */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="agent-backstory" className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <BookOpen size={14} className="text-cyan-500" />
              Backstory
              <span className="text-[10px] font-mono text-cyan-500/50">backstory:</span>
            </label>
            <button 
              onClick={generateBackstory}
              disabled={loadingStory || !formData.role || !formData.goal}
              className="text-xs flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
            >
              <Sparkles size={14} />
              {loadingStory ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
          <textarea 
            id="agent-backstory"
            value={formData.backstory}
            onChange={e => setFormData({...formData, backstory: e.target.value})}
            className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 h-32 resize-none transition-all duration-200 placeholder:text-slate-600"
            placeholder="Kontekst i persona agenta - ko je on i zašto je kvalifikovan..."
          />
          <p className="text-[10px] text-slate-500">Kontekst/persona - pomaže LLM-u da razume perspektivu agenta</p>
        </div>

        {/* Tools */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-2">
            <Wrench size={14} className="text-cyan-500" />
            Tools
            <span className="text-[10px] font-mono text-cyan-500/50">tools:</span>
            <span className="text-[10px] text-emerald-400 ml-auto">{formData.tools.length} selected</span>
          </label>
          <div className="flex flex-wrap gap-2 p-4 bg-[#080F1A]/50 border border-cyan-500/10 rounded-lg">
            {AVAILABLE_TOOLS.map(tool => (
              <button
                key={tool}
                onClick={() => toggleTool(tool)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  formData.tools.includes(tool)
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                    : 'bg-[#080F1A] text-slate-400 border-cyan-500/15 hover:border-cyan-500/30 hover:text-white'
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
                  
                  const isSelected = formData.tools.includes(tool);
                  const glowColor = isSelected ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 220, 0.5)';
                  
                  e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 8}px) scale(1.08)`;
                  e.currentTarget.style.boxShadow = `0 0 40px ${glowColor}, 0 ${moveY + 20}px 30px rgba(0, 0, 0, 0.4)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                  e.currentTarget.style.boxShadow = formData.tools.includes(tool) ? '0 0 10px rgba(34, 197, 94, 0.1)' : 'none';
                }}
              >
                {tool}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">Alati koje agent može koristiti - samo relevantni za njegovu ulogu</p>
        </div>

        {/* Options */}
        <div className="p-4 bg-[#080F1A]/50 border border-cyan-500/10 rounded-lg">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-2 mb-4">
            <Settings2 size={14} className="text-cyan-500" />
            Agent Options
          </label>
          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox"
                checked={formData.allowDelegation}
                onChange={e => setFormData({...formData, allowDelegation: e.target.checked})}
                className="w-4 h-4 rounded border-cyan-500/30 bg-[#080F1A] text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-[#050608]"
              />
              <div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Allow Delegation</span>
                <span className="text-[10px] font-mono text-cyan-500/50 ml-2">allow_delegation:</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox"
                checked={formData.verbose}
                onChange={e => setFormData({...formData, verbose: e.target.checked})}
                className="w-4 h-4 rounded border-cyan-500/30 bg-[#080F1A] text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-[#050608]"
              />
              <div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Verbose Logging</span>
                <span className="text-[10px] font-mono text-cyan-500/50 ml-2">verbose:</span>
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
            <span className="text-[10px] font-mono text-slate-500 ml-2">AgentConfig (YAML)</span>
          </div>
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
            <code>
{`${escapeYaml(formData.id) || 'agent'}:
  id: "${escapeYaml(formData.id) || '...'}"
  name: "${escapeYaml(formData.name) || '...'}"
  role: "${escapeYaml(formData.role) || '...'}"
  goal: "${escapeYaml(formData.goal?.slice(0, 40)) || '...'}${(formData.goal?.length || 0) > 40 ? '...' : ''}"
  backstory: "${escapeYaml(formData.backstory?.slice(0, 30)) || '...'}${(formData.backstory?.length || 0) > 30 ? '...' : ''}"
  model: "${escapeYaml(formData.model)}"
  tools: [${formData.tools.map(t => `"${escapeYaml(t)}"`).join(', ')}]
  allow_delegation: ${formData.allowDelegation}
  verbose: ${formData.verbose}`}
            </code>
          </pre>
        </div>

      </div>
    </div>
  );
});

AgentForm.displayName = 'AgentForm';

export default AgentForm;
