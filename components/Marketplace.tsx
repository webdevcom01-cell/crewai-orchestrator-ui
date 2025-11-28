import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

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
        const installedAgent = await response.json();
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
    <div className="marketplace">
      <div className="marketplace-header">
        <h2>Agent Template Marketplace</h2>
        <p>Discover and install pre-built AI agents for your workflows</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && loadTemplates()}
        />
        <button onClick={loadTemplates}>Search</button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="popular">Most Popular</option>
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading templates...</div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="template-card" onClick={() => setSelectedTemplate(template)}>
              <div className="template-header">
                <h3>{template.name}</h3>
                {template.isPremium && <span className="premium-badge">Premium</span>}
              </div>
              <p className="template-description">{template.description}</p>
              <div className="template-meta">
                <span className="downloads">📥 {template.downloads.toLocaleString()}</span>
                <span className="rating">⭐ {template.rating.toFixed(1)}</span>
              </div>
              <div className="template-tags">
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="template-author">by {template.author}</div>
            </div>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <div className="modal-overlay" onClick={() => setSelectedTemplate(null)}>
          <div className="modal template-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedTemplate(null)}>
              ×
            </button>
            <div className="modal-header">
              <h2>{selectedTemplate.name}</h2>
              {selectedTemplate.isPremium && <span className="premium-badge">Premium</span>}
            </div>
            <div className="modal-meta">
              <span>⭐ {selectedTemplate.rating.toFixed(1)}</span>
              <span>📥 {selectedTemplate.downloads.toLocaleString()} installs</span>
              <span>by {selectedTemplate.author}</span>
            </div>
            <p className="modal-description">{selectedTemplate.description}</p>

            <div className="config-preview">
              <h3>Configuration</h3>
              <div className="config-item">
                <strong>Role:</strong> {selectedTemplate.config.role}
              </div>
              <div className="config-item">
                <strong>Goal:</strong> {selectedTemplate.config.goal}
              </div>
              <div className="config-item">
                <strong>Backstory:</strong> {selectedTemplate.config.backstory}
              </div>
              <div className="config-item">
                <strong>Tools:</strong>
                <div className="tools-list">
                  {selectedTemplate.config.tools.map((tool) => (
                    <span key={tool} className="tool-tag">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-tags">
              {selectedTemplate.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            {hasPermission('agent:create') && (
              <button onClick={() => installTemplate(selectedTemplate)} className="btn-install">
                Install Template
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .marketplace {
          padding: 20px;
        }

        .marketplace-header {
          margin-bottom: 30px;
        }

        .marketplace-header h2 {
          margin-bottom: 10px;
        }

        .marketplace-header p {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .search-bar input {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          font-size: 16px;
        }

        .search-bar button {
          background: #00ff9f;
          color: #000;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .filters {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-group label {
          font-weight: 600;
        }

        .filter-group select {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .template-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .template-card:hover {
          transform: translateY(-4px);
          border-color: #00ff9f;
          box-shadow: 0 8px 24px rgba(0, 255, 159, 0.2);
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }

        .template-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .premium-badge {
          background: linear-gradient(135deg, #ff0080, #ff8c00);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }

        .template-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .template-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .template-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .tag {
          background: rgba(0, 212, 255, 0.2);
          color: #00d4ff;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
        }

        .template-author {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .template-modal {
          background: #1a1a1a;
          padding: 30px;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          line-height: 1;
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .modal-meta {
          display: flex;
          gap: 20px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 20px;
          font-size: 14px;
        }

        .modal-description {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 25px;
        }

        .config-preview {
          background: rgba(0, 0, 0, 0.3);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .config-preview h3 {
          margin-top: 0;
          margin-bottom: 15px;
        }

        .config-item {
          margin-bottom: 15px;
        }

        .config-item strong {
          color: #00ff9f;
          display: block;
          margin-bottom: 5px;
        }

        .tools-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .tool-tag {
          background: rgba(255, 0, 128, 0.2);
          color: #ff0080;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
        }

        .modal-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .btn-install {
          width: 100%;
          background: linear-gradient(135deg, #00ff9f, #00d4ff);
          color: #000;
          padding: 15px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
        }

        .btn-install:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};
