import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Store, Search, Download, Star, X, Tag, User, Sparkles, Bot, Wrench } from 'lucide-react';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  config: {
    role: string;
    goal: string;
    backstory: string;
    tools: string[];
  };
  isPremium: boolean;
}

interface MarketplaceProps {
  workspaceId: string;
  onInstall?: (template: AgentTemplate) => void;
}

// 3D Hover effect helper
const apply3DHover = (e: React.MouseEvent<HTMLElement>, intensity: number = 5) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = (e.clientX - centerX) / (rect.width / 2);
  const deltaY = (e.clientY - centerY) / (rect.height / 2);
  
  e.currentTarget.style.transform = `perspective(1000px) rotateX(${deltaY * -intensity}deg) rotateY(${deltaX * intensity}deg) translateY(-4px) scale(1.02)`;
};

const reset3DHover = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
};

export const Marketplace: React.FC<MarketplaceProps> = ({ workspaceId, onInstall }) => {
  const { hasPermission } = useAuth();
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);

  const categories = [
    'all',
    'data-analysis',
    'content-creation',
    'research',
    'automation',
    'customer-service',
    'development',
    'marketing',
    'sales',
  ];

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, sortBy]);

  const loadTemplates = async () => {
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        sortBy,
        search: searchQuery,
      });
      const response = await fetch(`/api/marketplace/templates?${params}`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const installTemplate = async (template: AgentTemplate) => {
    if (!hasPermission('agent:create')) {
      alert('You do not have permission to install templates');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/templates/${template.id}/install`, {
        method: 'POST',
      });

      if (response.ok) {
        alert(`Template "${template.name}" installed successfully!`);
        if (onInstall) {
          onInstall(template);
        }
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Failed to install template:', error);
      alert('Failed to install template');
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <Store size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Agent Template Marketplace</h1>
          <p className="text-sm text-slate-400 font-mono">marketplace.templates.browse</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && loadTemplates()}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <button 
            onClick={loadTemplates}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all"
          >
            Search
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'rating')}
              className="px-4 py-2 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <Bot size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-2">No templates found</p>
          <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="p-5 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm cursor-pointer"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
              onMouseMove={(e) => apply3DHover(e)}
              onMouseLeave={reset3DHover}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-bold text-white">{template.name}</h3>
                {template.isPremium && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold">
                    <Sparkles size={10} />
                    Premium
                  </span>
                )}
              </div>
              
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">{template.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <Download size={14} />
                  {template.downloads.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star size={14} fill="currentColor" />
                  {template.rating.toFixed(1)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {template.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag} 
                    className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <User size={12} />
                by {template.author}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTemplate(null)}
        >
          <div 
            className="bg-[#0c1621] border border-cyan-500/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{selectedTemplate.name}</h2>
                {selectedTemplate.isPremium && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold">
                    <Sparkles size={10} />
                    Premium
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  {selectedTemplate.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Download size={16} />
                  {selectedTemplate.downloads.toLocaleString()} installs
                </span>
                <span className="flex items-center gap-1">
                  <User size={16} />
                  by {selectedTemplate.author}
                </span>
              </div>
              
              <p className="text-slate-300 leading-relaxed">{selectedTemplate.description}</p>
              
              {/* Configuration Preview */}
              <div className="p-5 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Bot size={18} className="text-cyan-400" />
                  Configuration
                </h3>
                
                <div>
                  <p className="text-sm text-cyan-400 font-medium mb-1">Role</p>
                  <p className="text-slate-300">{selectedTemplate.config.role}</p>
                </div>
                
                <div>
                  <p className="text-sm text-cyan-400 font-medium mb-1">Goal</p>
                  <p className="text-slate-300">{selectedTemplate.config.goal}</p>
                </div>
                
                <div>
                  <p className="text-sm text-cyan-400 font-medium mb-1">Backstory</p>
                  <p className="text-slate-300">{selectedTemplate.config.backstory}</p>
                </div>
                
                <div>
                  <p className="text-sm text-cyan-400 font-medium mb-2 flex items-center gap-1">
                    <Wrench size={14} />
                    Tools
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.config.tools.map((tool) => (
                      <span 
                        key={tool} 
                        className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={16} className="text-slate-400" />
                {selectedTemplate.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {hasPermission('agent:create') && (
                <button 
                  onClick={() => installTemplate(selectedTemplate)}
                  className="w-full py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold text-lg hover:opacity-90 transition-all hover:scale-[1.01]"
                >
                  Install Template
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
