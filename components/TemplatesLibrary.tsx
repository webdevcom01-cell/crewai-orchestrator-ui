import React, { useState, useCallback } from 'react';
import { 
  FileText, Search, Download, Star, Clock, Users, CheckSquare,
  Code, Database, Brain, Newspaper, ShoppingCart, MessageSquare,
  ArrowRight, Filter, Grid, List, Sparkles, Copy, Check, Eye
} from 'lucide-react';
import { useOrchestrator } from '../hooks';
import { useToast } from './ui/Toast';
import { ACTION_TYPES } from '../reducer';
import Modal from './ui/Modal';
import { AgentConfig, TaskConfig, FlowConfig } from '../types';

// =============================================================================
// Templates Library - Gotovi workflow šabloni
// =============================================================================

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popularity: number;
  agents: Omit<AgentConfig, 'id'>[];
  tasks: Omit<TaskConfig, 'id'>[];
  flow: Omit<FlowConfig, 'id'>;
  tags: string[];
}

// Predefined workflow templates
const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'research-report',
    name: 'Research & Report Pipeline',
    description: 'Automatski istraži temu i generiši detaljan izveštaj sa izvorima.',
    category: 'Research',
    icon: Newspaper,
    difficulty: 'beginner',
    estimatedTime: '5-10 min',
    popularity: 4.8,
    tags: ['research', 'report', 'writing'],
    agents: [
      {
        name: 'Researcher',
        role: 'Senior Research Analyst',
        goal: 'Pronađi relevantne informacije i izvore za zadatu temu.',
        backstory: 'Iskusan istraživač sa fokusom na pouzdane izvore.',
        allowDelegation: false,
        verbose: true,
        tools: ['SerperApiTool', 'ScrapeWebsiteTool'],
        model: 'gemini-2.5-flash',
      },
      {
        name: 'Writer',
        role: 'Technical Writer',
        goal: 'Napiši jasan i struktuiran izveštaj na osnovu istraživanja.',
        backstory: 'Pisac tehničke dokumentacije sa godinama iskustva.',
        allowDelegation: false,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      }
    ],
    tasks: [
      {
        name: 'Research Phase',
        description: 'Istraži temu: {topic}. Pronađi minimum 5 relevantnih izvora.',
        expectedOutput: 'JSON sa ključnim nalazima i listom izvora.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: true,
      },
      {
        name: 'Report Writing',
        description: 'Na osnovu istraživanja napiši strukturiran izveštaj.',
        expectedOutput: 'Markdown izveštaj sa sekcijama i referencama.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: false,
      }
    ],
    flow: {
      name: 'Research Report Flow',
      description: 'Research → Report pipeline',
      process: 'sequential',
      agentIds: [],
      taskIds: [],
    }
  },
  {
    id: 'code-review',
    name: 'Code Review Pipeline',
    description: 'Automatska analiza koda sa preporukama za poboljšanje.',
    category: 'Development',
    icon: Code,
    difficulty: 'intermediate',
    estimatedTime: '3-5 min',
    popularity: 4.6,
    tags: ['code', 'review', 'quality'],
    agents: [
      {
        name: 'CodeAnalyzer',
        role: 'Senior Code Reviewer',
        goal: 'Analiziraj kod i identifikuj probleme.',
        backstory: 'Iskusan programer specijalizovan za code review.',
        allowDelegation: false,
        verbose: true,
        tools: ['FileReadTool'],
        model: 'gemini-2.5-flash',
      },
      {
        name: 'SecurityAuditor',
        role: 'Security Specialist',
        goal: 'Proveri sigurnosne propuste u kodu.',
        backstory: 'Sigurnosni ekspert sa fokusom na vulnerabilnosti.',
        allowDelegation: false,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      }
    ],
    tasks: [
      {
        name: 'Code Analysis',
        description: 'Analiziraj kod u {file_path}. Identifikuj anti-patterne.',
        expectedOutput: 'Lista problema sa preporukama.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: true,
      },
      {
        name: 'Security Check',
        description: 'Proveri sigurnosne propuste na osnovu analize.',
        expectedOutput: 'Sigurnosni izveštaj sa kritičnim problemima.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: false,
      }
    ],
    flow: {
      name: 'Code Review Flow',
      description: 'Analysis → Security pipeline',
      process: 'sequential',
      agentIds: [],
      taskIds: [],
    }
  },
  {
    id: 'data-pipeline',
    name: 'Data Processing Pipeline',
    description: 'ETL pipeline za obradu i analizu podataka.',
    category: 'Data',
    icon: Database,
    difficulty: 'advanced',
    estimatedTime: '10-15 min',
    popularity: 4.5,
    tags: ['data', 'etl', 'analysis'],
    agents: [
      {
        name: 'DataExtractor',
        role: 'Data Engineer',
        goal: 'Ekstrahuj podatke iz izvora.',
        backstory: 'Specijalizovan za integraciju različitih izvora.',
        allowDelegation: false,
        verbose: true,
        tools: ['ScrapeWebsiteTool'],
        model: 'gemini-2.5-flash',
      },
      {
        name: 'DataAnalyst',
        role: 'Data Analyst',
        goal: 'Analiziraj i vizualizuj podatke.',
        backstory: 'Analitičar sa iskustvom u statistici.',
        allowDelegation: false,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      }
    ],
    tasks: [
      {
        name: 'Data Extraction',
        description: 'Ekstrahuj podatke iz {source}.',
        expectedOutput: 'Strukturirani podaci u JSON formatu.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: true,
      },
      {
        name: 'Data Analysis',
        description: 'Analiziraj ekstrahirane podatke.',
        expectedOutput: 'Analiza sa grafikonima i zaključcima.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: false,
      }
    ],
    flow: {
      name: 'Data Pipeline Flow',
      description: 'Extract → Analyze pipeline',
      process: 'sequential',
      agentIds: [],
      taskIds: [],
    }
  },
  {
    id: 'customer-support',
    name: 'Customer Support Bot',
    description: 'Automatizovana korisnička podrška sa eskalacijom.',
    category: 'Support',
    icon: MessageSquare,
    difficulty: 'intermediate',
    estimatedTime: '5-8 min',
    popularity: 4.7,
    tags: ['support', 'chat', 'automation'],
    agents: [
      {
        name: 'SupportBot',
        role: 'Customer Support Agent',
        goal: 'Odgovori na korisničko pitanje.',
        backstory: 'Prijateljski support agent.',
        allowDelegation: true,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      },
      {
        name: 'Escalator',
        role: 'Senior Support',
        goal: 'Reši kompleksne probleme.',
        backstory: 'Senior support sa tehničkim znanjem.',
        allowDelegation: false,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      }
    ],
    tasks: [
      {
        name: 'Initial Response',
        description: 'Odgovori na pitanje: {question}',
        expectedOutput: 'Prijateljski odgovor korisniku.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: true,
      },
      {
        name: 'Escalation Check',
        description: 'Proveri da li je potrebna eskalacija.',
        expectedOutput: 'Odluka o eskalaciji sa obrazloženjem.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: false,
      }
    ],
    flow: {
      name: 'Support Flow',
      description: 'Response → Escalation pipeline',
      process: 'sequential',
      agentIds: [],
      taskIds: [],
    }
  },
  {
    id: 'content-generation',
    name: 'Content Generation Suite',
    description: 'Generiši blog postove, social media i marketing sadržaj.',
    category: 'Marketing',
    icon: Brain,
    difficulty: 'beginner',
    estimatedTime: '3-5 min',
    popularity: 4.9,
    tags: ['content', 'marketing', 'social'],
    agents: [
      {
        name: 'ContentCreator',
        role: 'Content Strategist',
        goal: 'Kreiraj engaging sadržaj.',
        backstory: 'Kreativac sa iskustvom u digitalnom marketingu.',
        allowDelegation: false,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      },
      {
        name: 'Editor',
        role: 'Content Editor',
        goal: 'Uredi i optimizuj sadržaj.',
        backstory: 'Iskusan urednik sa okom za detalje.',
        allowDelegation: false,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      }
    ],
    tasks: [
      {
        name: 'Content Draft',
        description: 'Napiši sadržaj na temu: {topic}',
        expectedOutput: 'Draft blog posta ili social media sadržaja.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: true,
      },
      {
        name: 'Content Polish',
        description: 'Uredi i poboljšaj draft.',
        expectedOutput: 'Finalni, optimizovan sadržaj.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: false,
      }
    ],
    flow: {
      name: 'Content Flow',
      description: 'Draft → Polish pipeline',
      process: 'sequential',
      agentIds: [],
      taskIds: [],
    }
  },
  {
    id: 'ecommerce-assistant',
    name: 'E-commerce Assistant',
    description: 'Pomoćnik za e-commerce: opisi proizvoda, SEO, preporuke.',
    category: 'E-commerce',
    icon: ShoppingCart,
    difficulty: 'intermediate',
    estimatedTime: '5-7 min',
    popularity: 4.4,
    tags: ['ecommerce', 'products', 'seo'],
    agents: [
      {
        name: 'ProductWriter',
        role: 'Product Copywriter',
        goal: 'Napiši privlačne opise proizvoda.',
        backstory: 'Copywriter specijalizovan za e-commerce.',
        allowDelegation: false,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      },
      {
        name: 'SEOExpert',
        role: 'SEO Specialist',
        goal: 'Optimizuj sadržaj za pretraživače.',
        backstory: 'SEO ekspert sa dokazanim rezultatima.',
        allowDelegation: false,
        verbose: true,
        tools: [],
        model: 'gemini-2.5-flash',
      }
    ],
    tasks: [
      {
        name: 'Product Description',
        description: 'Napiši opis za proizvod: {product}',
        expectedOutput: 'Privlačan opis proizvoda.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: true,
      },
      {
        name: 'SEO Optimization',
        description: 'Optimizuj opis za SEO.',
        expectedOutput: 'SEO-friendly verzija sa ključnim rečima.',
        agentId: '',
        contextTaskIds: [],
        isEntrypoint: false,
      }
    ],
    flow: {
      name: 'E-commerce Flow',
      description: 'Description → SEO pipeline',
      process: 'sequential',
      agentIds: [],
      taskIds: [],
    }
  }
];

const CATEGORIES = ['All', 'Research', 'Development', 'Data', 'Support', 'Marketing', 'E-commerce'];
const DIFFICULTIES = ['All', 'beginner', 'intermediate', 'advanced'];

interface TemplateCardProps {
  template: WorkflowTemplate;
  onUse: (template: WorkflowTemplate) => void;
  onPreview: (template: WorkflowTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse, onPreview }) => {
  const Icon = template.icon;
  
  const difficultyColors = {
    beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div 
      className="group p-5 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 hover:border-cyan-500/30 transition-all duration-300"
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
        
        const tiltX = deltaY * -4;
        const tiltY = deltaX * 4;
        const moveY = deltaY * 6;
        
        e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${moveY - 3}px) scale(1.01)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30 transition-colors">
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <Star size={14} fill="currentColor" />
          <span className="text-sm font-medium">{template.popularity}</span>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
        {template.name}
      </h3>
      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full border ${difficultyColors[template.difficulty]}`}>
          {template.difficulty}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
          <Clock size={10} className="inline mr-1" />
          {template.estimatedTime}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <Users size={12} /> {template.agents.length} agents
        </span>
        <span className="flex items-center gap-1">
          <CheckSquare size={12} /> {template.tasks.length} tasks
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {template.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-500/70 rounded font-mono">
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onPreview(template)}
          className="flex-1 py-2 px-3 text-sm text-slate-400 hover:text-white border border-slate-500/30 hover:border-slate-500/50 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Eye size={14} />
          Preview
        </button>
        <button
          onClick={() => onUse(template)}
          className="flex-1 py-2 px-3 text-sm bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Download size={14} />
          Use Template
        </button>
      </div>
    </div>
  );
};

const TemplatesLibrary: React.FC = () => {
  const { dispatch } = useOrchestrator();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter templates
  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleUseTemplate = useCallback((template: WorkflowTemplate) => {
    // Generate unique IDs and add agents
    const agentIdMap: Record<number, string> = {};
    
    template.agents.forEach((agent, index) => {
      const id = `${agent.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${index}`;
      agentIdMap[index] = id;
      dispatch({ 
        type: ACTION_TYPES.ADD_AGENT, 
        payload: { ...agent, id } 
      });
    });

    // Add tasks with proper agent and context mappings
    const taskIdMap: Record<number, string> = {};
    
    template.tasks.forEach((task, index) => {
      const id = `${task.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${index}`;
      taskIdMap[index] = id;
      
      const agentId = agentIdMap[index] || agentIdMap[0];
      const contextTaskIds = index > 0 ? [taskIdMap[index - 1]] : [];
      
      dispatch({ 
        type: ACTION_TYPES.ADD_TASK, 
        payload: { ...task, id, agentId, contextTaskIds } 
      });
    });

    // Add flow
    const flowId = `${template.flow.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    dispatch({
      type: ACTION_TYPES.ADD_FLOW,
      payload: {
        ...template.flow,
        id: flowId,
        agentIds: Object.values(agentIdMap),
        taskIds: Object.values(taskIdMap),
      }
    });

    showToast({
      type: 'success',
      title: 'Template Applied',
      message: `${template.name} has been added to your workspace.`
    });
  }, [dispatch, showToast]);

  const handleCopyConfig = useCallback(() => {
    if (!previewTemplate) return;
    
    const config = JSON.stringify({
      agents: previewTemplate.agents,
      tasks: previewTemplate.tasks,
      flow: previewTemplate.flow
    }, null, 2);
    
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [previewTemplate]);

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Templates Library</h1>
              <p className="text-sm text-slate-400 font-mono">workspace.templates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg border transition-all ${
                viewMode === 'grid' 
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' 
                  : 'border-cyan-500/20 text-slate-400 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg border transition-all ${
                viewMode === 'list' 
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' 
                  : 'border-cyan-500/20 text-slate-400 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080F1A] border border-cyan-500/20 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#080F1A] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#080F1A] border border-cyan-500/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
          >
            {DIFFICULTIES.map(diff => (
              <option key={diff} value={diff}>
                {diff === 'All' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-500">
          Showing {filteredTemplates.length} of {TEMPLATES.length} templates
        </div>

        {/* Templates Grid/List */}
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredTemplates.map(template => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onUse={handleUseTemplate}
              onPreview={setPreviewTemplate}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No templates found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Preview Modal */}
        <Modal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={previewTemplate?.name || 'Template Preview'}
          footer={
            <>
              <button
                onClick={handleCopyConfig}
                className="px-4 py-2 text-slate-400 hover:text-white border border-slate-500/30 rounded-lg transition-all flex items-center gap-2 text-sm"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Config'}
              </button>
              <button
                onClick={() => {
                  if (previewTemplate) handleUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Download size={16} />
                Use Template
              </button>
            </>
          }
        >
          {previewTemplate && (
            <div className="space-y-4">
              <p className="text-slate-400">{previewTemplate.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-[#080F1A] rounded-lg border border-cyan-500/10">
                  <p className="text-slate-500 mb-1">Agents</p>
                  <p className="text-white font-medium">{previewTemplate.agents.length}</p>
                </div>
                <div className="p-3 bg-[#080F1A] rounded-lg border border-cyan-500/10">
                  <p className="text-slate-500 mb-1">Tasks</p>
                  <p className="text-white font-medium">{previewTemplate.tasks.length}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Agents:</p>
                <div className="space-y-2">
                  {previewTemplate.agents.map((agent, i) => (
                    <div key={i} className="p-2 bg-[#080F1A] rounded border border-cyan-500/10 text-sm">
                      <span className="text-cyan-400 font-medium">{agent.name}</span>
                      <span className="text-slate-500 ml-2">- {agent.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Tasks:</p>
                <div className="space-y-2">
                  {previewTemplate.tasks.map((task, i) => (
                    <div key={i} className="p-2 bg-[#080F1A] rounded border border-cyan-500/10 text-sm">
                      <span className="text-emerald-400 font-medium">{task.name}</span>
                      <p className="text-slate-500 text-xs mt-1 truncate">{task.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default TemplatesLibrary;
