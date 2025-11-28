import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

interface BrandingConfig {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain?: string;
  companyName: string;
  hideFooter: boolean;
  customCSS?: string;
}

interface WhiteLabelProps {
  workspaceId: string;
}

export const WhiteLabel: React.FC<WhiteLabelProps> = ({ workspaceId }) => {
  const { hasPermission } = useAuth();
  const [config, setConfig] = useState<BrandingConfig>({
    primaryColor: '#00ff9f',
    secondaryColor: '#00d4ff',
    accentColor: '#ff0080',
    companyName: 'CrewAI Orchestrator',
    hideFooter: false,
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBrandingConfig();
  }, [workspaceId]);

  const loadBrandingConfig = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/branding`);
      const data = await response.json();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to load branding config:', error);
    }
  };

  const saveBrandingConfig = async () => {
    if (!hasPermission('settings:manage')) {
      alert('You do not have permission to manage branding');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/branding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('Branding configuration saved successfully!');
      } else {
        alert('Failed to save branding configuration');
      }
    } catch (error) {
      console.error('Failed to save branding config:', error);
      alert('Failed to save branding configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (file: File, type: 'logo' | 'favicon') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/upload-asset`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setConfig({ ...config, [type]: data.url });
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file, type);
    }
  };

  const applyPreview = () => {
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', config.accentColor);
  };

  const resetPreview = () => {
    document.documentElement.style.setProperty('--primary-color', '#00ff9f');
    document.documentElement.style.setProperty('--secondary-color', '#00d4ff');
    document.documentElement.style.setProperty('--accent-color', '#ff0080');
  };

  useEffect(() => {
    if (previewMode) {
      applyPreview();
    } else {
      resetPreview();
    }
    return () => resetPreview();
  }, [previewMode, config]);

  if (!hasPermission('settings:manage')) {
    return (
      <div className="white-label">
        <h2>White Label Customization</h2>
        <p>You do not have permission to manage white label settings. Contact your workspace owner.</p>
      </div>
    );
  }

  return (
    <div className="white-label">
      <div className="header">
        <h2>White Label Customization</h2>
        <div className="header-actions">
          <label className="toggle-label">
            <input type="checkbox" checked={previewMode} onChange={(e) => setPreviewMode(e.target.checked)} />
            Preview Mode
          </label>
          <button onClick={saveBrandingConfig} disabled={isSaving} className="btn-save">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="config-grid">
        <div className="config-section">
          <h3>Brand Identity</h3>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
              placeholder="Your Company Name"
            />
          </div>

          <div className="form-group">
            <label>Logo</label>
            {config.logo && (
              <div className="image-preview">
                <img src={config.logo} alt="Logo" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
            <span className="hint">Recommended: 200x50px PNG with transparent background</span>
          </div>

          <div className="form-group">
            <label>Favicon</label>
            {config.favicon && (
              <div className="image-preview small">
                <img src={config.favicon} alt="Favicon" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} />
            <span className="hint">Recommended: 32x32px PNG or ICO</span>
          </div>

          <div className="form-group">
            <label>Custom Domain</label>
            <input
              type="text"
              value={config.customDomain || ''}
              onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
              placeholder="app.yourdomain.com"
            />
            <span className="hint">Configure DNS to point to our servers</span>
          </div>
        </div>

        <div className="config-section">
          <h3>Color Scheme</h3>

          <div className="form-group">
            <label>Primary Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                placeholder="#00ff9f"
              />
            </div>
            <span className="hint">Main brand color (buttons, links, highlights)</span>
          </div>

          <div className="form-group">
            <label>Secondary Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
              />
              <input
                type="text"
                value={config.secondaryColor}
                onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                placeholder="#00d4ff"
              />
            </div>
            <span className="hint">Supporting color for gradients and accents</span>
          </div>

          <div className="form-group">
            <label>Accent Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
              />
              <input
                type="text"
                value={config.accentColor}
                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                placeholder="#ff0080"
              />
            </div>
            <span className="hint">Accent color for alerts and special elements</span>
          </div>

          <div className="color-preview">
            <h4>Preview</h4>
            <div className="preview-buttons">
              <button style={{ background: config.primaryColor, color: '#000' }}>Primary Button</button>
              <button style={{ background: config.secondaryColor, color: '#000' }}>Secondary Button</button>
              <button style={{ background: config.accentColor, color: '#fff' }}>Accent Button</button>
            </div>
            <div
              className="preview-gradient"
              style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
            >
              Gradient Preview
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Advanced Customization</h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.hideFooter}
                onChange={(e) => setConfig({ ...config, hideFooter: e.target.checked })}
              />
              Hide "Powered by CrewAI" footer
            </label>
          </div>

          <div className="form-group">
            <label>Custom CSS</label>
            <textarea
              value={config.customCSS || ''}
              onChange={(e) => setConfig({ ...config, customCSS: e.target.value })}
              placeholder="/* Add your custom CSS here */"
              rows={10}
            />
            <span className="hint">Advanced: Override default styles with custom CSS</span>
          </div>

          <div className="warning-box">
            <h4>⚠️ Enterprise Feature</h4>
            <p>White label customization is available on the Enterprise plan. Some features may be restricted on lower tiers.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .white-label {
          padding: 20px;
          max-width: 1400px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .btn-save {
          background: #00ff9f;
          color: #000;
          padding: 10px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          font-size: 15px;
        }

        .btn-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }

        .config-section {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 25px;
        }

        .config-section h3 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 20px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-group input[type='text'],
        .form-group input[type='file'],
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          font-family: inherit;
        }

        .form-group textarea {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 13px;
        }

        .hint {
          display: block;
          margin-top: 5px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .image-preview {
          margin-bottom: 10px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          text-align: center;
        }

        .image-preview img {
          max-width: 100%;
          max-height: 100px;
        }

        .image-preview.small img {
          max-height: 32px;
        }

        .color-picker {
          display: flex;
          gap: 10px;
        }

        .color-picker input[type='color'] {
          width: 60px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          cursor: pointer;
        }

        .color-picker input[type='text'] {
          flex: 1;
        }

        .color-preview {
          margin-top: 30px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
        }

        .color-preview h4 {
          margin-top: 0;
          margin-bottom: 15px;
        }

        .preview-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .preview-buttons button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .preview-gradient {
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          font-weight: bold;
          color: white;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .warning-box {
          background: rgba(255, 165, 0, 0.1);
          border: 1px solid rgba(255, 165, 0, 0.3);
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }

        .warning-box h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #ffaa00;
        }

        .warning-box p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};
