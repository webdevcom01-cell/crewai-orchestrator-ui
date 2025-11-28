import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

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
      description: 'Google\'s latest multimodal AI model',
    },
    openai: {
      name: 'OpenAI',
      icon: '🤖',
      needsKey: true,
      description: 'GPT models from OpenAI',
    },
    anthropic: {
      name: 'Anthropic Claude',
      icon: '🧠',
      needsKey: true,
      description: 'Claude models from Anthropic',
    },
    ollama: {
      name: 'Ollama (Local)',
      icon: '💻',
      needsKey: false,
      description: 'Run models locally with Ollama',
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
    } catch (error) {
      alert('❌ Connection test failed');
    }
  };

  return (
    <>
      <div className="model-switcher-button" onClick={() => setIsOpen(true)}>
        <span className="provider-icon">{providerInfo[config.provider].icon}</span>
        <span className="provider-name">{providerInfo[config.provider].name}</span>
        <span className="model-name">{config.model}</span>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal model-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ×
            </button>
            <h2>AI Model Configuration</h2>

            <div className="provider-selector">
              <h3>Select Provider</h3>
              <div className="provider-grid">
                {(Object.keys(providerInfo) as Array<keyof typeof providerInfo>).map((provider) => (
                  <div
                    key={provider}
                    className={`provider-card ${selectedProvider === provider ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setConfig({
                        ...config,
                        provider,
                        model: modelOptions[provider][0],
                      });
                    }}
                  >
                    <div className="provider-icon-large">{providerInfo[provider].icon}</div>
                    <div className="provider-name">{providerInfo[provider].name}</div>
                    <div className="provider-description">{providerInfo[provider].description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="model-config">
              <h3>Model Settings</h3>

              <label>
                Model
                <select value={config.model} onChange={(e) => setConfig({ ...config, model: e.target.value })}>
                  {modelOptions[selectedProvider].map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </label>

              {providerInfo[selectedProvider].needsKey && (
                <label>
                  API Key
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Enter API key..."
                  />
                </label>
              )}

              {selectedProvider === 'ollama' && (
                <label>
                  Base URL
                  <input
                    type="text"
                    value={config.baseUrl || 'http://localhost:11434'}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                  />
                </label>
              )}

              <label>
                Temperature ({config.temperature})
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                />
                <div className="range-labels">
                  <span>More Focused</span>
                  <span>More Creative</span>
                </div>
              </label>

              <label>
                Max Tokens
                <input
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                  min="1"
                  max="128000"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={testConnection} className="btn-test">
                Test Connection
              </button>
              <button onClick={saveConfig} className="btn-save">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .model-switcher-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .model-switcher-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #00ff9f;
        }

        .provider-icon {
          font-size: 20px;
        }

        .provider-name {
          font-weight: 600;
        }

        .model-name {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
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

        .model-modal {
          background: #1a1a1a;
          padding: 30px;
          border-radius: 12px;
          max-width: 700px;
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

        .model-modal h2 {
          margin-top: 0;
          margin-bottom: 25px;
        }

        .provider-selector h3,
        .model-config h3 {
          margin-bottom: 15px;
        }

        .provider-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }

        .provider-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .provider-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .provider-card.selected {
          background: rgba(0, 255, 159, 0.1);
          border-color: #00ff9f;
        }

        .provider-icon-large {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .provider-card .provider-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }

        .provider-description {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }

        .model-config label {
          display: block;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .model-config input,
        .model-config select {
          display: block;
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        .model-config input[type='range'] {
          cursor: pointer;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
        }

        .btn-test {
          flex: 1;
          background: #00d4ff;
          color: #000;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 15px;
        }

        .btn-save {
          flex: 1;
          background: #00ff9f;
          color: #000;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 15px;
        }

        .btn-test:hover,
        .btn-save:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
};
