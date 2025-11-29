import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Palette, Upload, Save, Eye, EyeOff, Globe, AlertTriangle } from 'lucide-react';

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
      <div className="p-6 md:p-8 text-center">
        <Palette size={48} className="mx-auto text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">White Label Customization</h2>
        <p className="text-slate-400">You do not have permission to manage white label settings. Contact your workspace owner.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Palette size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,197,220,0.5)]" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">White Label Customization</h1>
            <p className="text-sm text-slate-400 font-mono">workspace.branding.config</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${
              previewMode 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                : 'bg-[#080F1A] border-cyan-500/20 text-slate-400 hover:border-cyan-500/30'
            }`}
          >
            {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
            {previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button 
            onClick={saveBrandingConfig}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Identity */}
        <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm space-y-6">
          <h3 className="text-lg font-bold text-white">Brand Identity</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
              placeholder="Your Company Name"
              className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Logo</label>
            {config.logo && (
              <div className="mb-3 p-4 rounded-lg bg-slate-800/50 flex justify-center">
                <img src={config.logo} alt="Logo" className="max-h-12" />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-cyan-500/30 text-cyan-400 cursor-pointer hover:bg-cyan-500/5 transition-colors">
              <Upload size={18} />
              <span>Upload Logo</span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
            </label>
            <p className="text-xs text-slate-500 mt-2">Recommended: 200x50px PNG with transparent background</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Favicon</label>
            {config.favicon && (
              <div className="mb-3 p-4 rounded-lg bg-slate-800/50 flex justify-center">
                <img src={config.favicon} alt="Favicon" className="w-8 h-8" />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-cyan-500/30 text-cyan-400 cursor-pointer hover:bg-cyan-500/5 transition-colors">
              <Upload size={18} />
              <span>Upload Favicon</span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} className="hidden" />
            </label>
            <p className="text-xs text-slate-500 mt-2">Recommended: 32x32px PNG or ICO</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Globe size={14} />
              Custom Domain
            </label>
            <input
              type="text"
              value={config.customDomain || ''}
              onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
              placeholder="app.yourdomain.com"
              className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-2">Configure DNS to point to our servers</p>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm space-y-6">
          <h3 className="text-lg font-bold text-white">Color Scheme</h3>
          
          {[
            { key: 'primaryColor', label: 'Primary Color', hint: 'Main brand color (buttons, links, highlights)' },
            { key: 'secondaryColor', label: 'Secondary Color', hint: 'Supporting color for gradients and accents' },
            { key: 'accentColor', label: 'Accent Color', hint: 'Accent color for alerts and special elements' },
          ].map(({ key, label, hint }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={config[key as keyof BrandingConfig] as string}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  className="w-14 h-12 rounded-lg border border-cyan-500/20 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config[key as keyof BrandingConfig] as string}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{hint}</p>
            </div>
          ))}

          {/* Preview */}
          <div className="pt-4 border-t border-cyan-500/10">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Preview</h4>
            <div className="flex gap-2 mb-3">
              <button 
                style={{ background: config.primaryColor }} 
                className="flex-1 py-2 rounded-lg text-black font-bold text-sm"
              >
                Primary
              </button>
              <button 
                style={{ background: config.secondaryColor }} 
                className="flex-1 py-2 rounded-lg text-black font-bold text-sm"
              >
                Secondary
              </button>
              <button 
                style={{ background: config.accentColor }} 
                className="flex-1 py-2 rounded-lg text-white font-bold text-sm"
              >
                Accent
              </button>
            </div>
            <div 
              className="p-4 rounded-lg text-center font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
            >
              Gradient Preview
            </div>
          </div>
        </div>

        {/* Advanced Customization */}
        <div className="p-6 rounded-xl bg-[#080F1A]/60 border border-cyan-500/15 backdrop-blur-sm space-y-6">
          <h3 className="text-lg font-bold text-white">Advanced Customization</h3>
          
          <label className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-cyan-500/10 cursor-pointer hover:border-cyan-500/20 transition-colors">
            <input
              type="checkbox"
              checked={config.hideFooter}
              onChange={(e) => setConfig({ ...config, hideFooter: e.target.checked })}
              className="w-5 h-5 rounded border-cyan-500/30 bg-[#080F1A] text-cyan-500 focus:ring-cyan-500/30"
            />
            <div>
              <span className="text-white font-medium">Hide "Powered by CrewAI" footer</span>
              <p className="text-xs text-slate-500 mt-0.5">Remove attribution from your white-labeled instance</p>
            </div>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Custom CSS</label>
            <textarea
              value={config.customCSS || ''}
              onChange={(e) => setConfig({ ...config, customCSS: e.target.value })}
              placeholder="/* Add your custom CSS here */"
              rows={8}
              className="w-full px-4 py-3 rounded-lg bg-[#080F1A] border border-cyan-500/20 text-cyan-400 font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">Advanced: Override default styles with custom CSS</p>
          </div>

          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-orange-400 mb-1">Enterprise Feature</h4>
                <p className="text-sm text-slate-400">
                  White label customization is available on the Enterprise plan. Some features may be restricted on lower tiers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
