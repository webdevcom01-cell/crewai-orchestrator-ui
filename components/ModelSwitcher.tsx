import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Bot, X, Thermometer, Hash, Zap, Check } from 'lucide-react';

interface ModelConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ModelSwitcherProps {
  workspaceId: string;
  currentModel?: ModelConfig;
  onModelChange?: (model: ModelConfig) => void;
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

export const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ workspaceId, currentModel, onModelChange }) => {
  const { hasPermission } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<ModelConfig['provider']>(currentModel?.provider || 'gemini');
  const [config, setConfig] = useState<ModelConfig>(
    currentModel || {
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxTokens: 8000,
    }
  );
  const [isOpen, setIsOpen] = useState(false);

  const modelOptions = {
    gemini: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    ollama: ['llama2', 'mistral', 'codellama', 'mixtral'],
  };

  const providerInfo = {
    gemini: {
      name: 'Google Gemini',
      icon: '🔷',
      needsKey: true,
      description: "Google's latest multimodal AI model",
      color: 'cyan',
    },
    openai: {
      name: 'OpenAI',
      icon: '🤖',
      needsKey: true,
      description: 'GPT models from OpenAI',
      color: 'emerald',
    },
    anthropic: {
      name: 'Anthropic Claude',
      icon: '🧠',
      needsKey: true,
      description: 'Claude models from Anthropic',
      color: 'purple',
    },
    ollama: {
      name: 'Ollama (Local)',
      icon: '💻',
      needsKey: false,
      description: 'Run models locally with Ollama',
      color: 'orange',
    },
  };

  const saveConfig = async () => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to change AI models');
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/ai-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('AI model configuration saved successfully!');
        if (onModelChange) {
          onModelChange(config);
        }
        setIsOpen(false);
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save model config:', error);
      alert('Failed to save configuration');
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/ai-model/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Connection successful!\n\n' + result.message);
      } else {
        alert('❌ Connection failed:\n\n' + result.error);
      }
    } catch {
      alert('❌ Connection test failed');
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <div 
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#080F1A]/60 border border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-2xl">{providerInfo[config.provider].icon}</span>
        <div>
          <p className="font-medium text-white">{providerInfo[config.provider].name}</p>
          <p className="text-xs text-slate-400 font-mono">{config.model}</p>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-[#0c1621] border border-cyan-500/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot size={22} className="text-cyan-400" />
                AI Model Configuration
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Provider Selection */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Select Provider</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(providerInfo) as Array<keyof typeof providerInfo>).map((provider) => (
                    <div
                      key={provider}
                      onClick={() => {
                        setSelectedProvider(provider);
                        setConfig({
                          ...config,
                          provider,
                          model: modelOptions[provider][0],
                        });
                      }}
                      className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${
                        selectedProvider === provider
                          ? 'bg-cyan-500/10 border-cyan-500/40'
                          : 'bg-[#080F1A]/60 border-cyan-500/15 hover:border-cyan-500/30'
                      }`}
                      style={{ 
                        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                      onMouseMove={(e) => apply3DHover(e, 3)}
                      onMouseLeave={reset3DHover}
                    >
                      <span className="text-4xl block mb-2">{providerInfo[provider].icon}</span>
                      <p className="font-bold text-white mb-1">{providerInfo[provider].name}</p>
                      <p className="text-xs text-slate-400">{providerInfo[provider].description}</p>
                      {selectedProvider === provider && (
                        <div className="mt-2">
                          <Check size={16} className="mx-auto text-cyan-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Settings */}
              <div className="space-y-5">
                <h3 className="text-sm font-medium text-slate-300">Model Settings</h3>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Model</label>
                  <select 
                    value={config.model} 
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    {modelOptions[selectedProvider].map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {providerInfo[selectedProvider].needsKey && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">API Key</label>
                    <input
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="Enter API key..."
                      className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                )}

                {selectedProvider === 'ollama' && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Base URL</label>
                    <input
                      type="text"
                      value={config.baseUrl || 'http://localhost:11434'}
                      onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                      placeholder="http://localhost:11434"
                      className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <Thermometer size={14} className="text-orange-400" />
                    Temperature: {config.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>More Focused</span>
                    <span>More Creative</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <Hash size={14} className="text-purple-400" />
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                    min="1"
                    max="128000"
                    className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={testConnection}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500/20 transition-colors"
                >
                  <Zap size={18} />
                  Test Connection
                </button>
                <button 
                  onClick={saveConfig}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
