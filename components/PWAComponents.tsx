import React from 'react';
import { Wifi, WifiOff, Download, RefreshCw, X, Check } from 'lucide-react';
import { usePWA, useOfflineIndicator } from '../hooks/usePWA';

// Offline Indicator Banner
export const OfflineIndicator: React.FC = () => {
  const { showIndicator, isOnline } = useOfflineIndicator();

  if (!showIndicator) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] py-2 px-4 text-center text-sm font-medium transition-all duration-300 ${
        isOnline 
          ? 'bg-green-500/90 text-white translate-y-0' 
          : 'bg-yellow-500/90 text-black translate-y-0'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may be limited.</span>
          </>
        )}
      </div>
    </div>
  );
};

// Install Prompt
export const InstallPrompt: React.FC = () => {
  const { status, installApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!status.isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 shadow-2xl shadow-cyan-500/10">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Download className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Install CrewAI</h3>
            <p className="text-gray-400 text-sm mb-3">
              Install the app for faster access and offline capabilities.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-all duration-200 text-sm font-medium"
              >
                Install
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update Available Prompt
export const UpdatePrompt: React.FC = () => {
  const { status, updateApp, dismissUpdate } = usePWA();
  const [updating, setUpdating] = React.useState(false);

  if (!status.isUpdateAvailable) return null;

  const handleUpdate = async () => {
    setUpdating(true);
    await updateApp();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 shadow-2xl shadow-green-500/10">
        <button
          onClick={dismissUpdate}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
          disabled={updating}
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <RefreshCw className={`w-6 h-6 text-green-400 ${updating ? 'animate-spin' : ''}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Update Available</h3>
            <p className="text-gray-400 text-sm mb-3">
              A new version is available. Refresh to update.
            </p>
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-all duration-200 text-sm font-medium disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Offline Ready Toast
export const OfflineReadyToast: React.FC = () => {
  const { status, dismissOfflineReady } = usePWA();

  if (!status.isOfflineReady) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-4 py-3 shadow-2xl shadow-cyan-500/10 flex items-center gap-3">
        <div className="p-1.5 bg-cyan-500/20 rounded-lg">
          <Check className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-white text-sm">App ready for offline use</span>
        <button
          onClick={dismissOfflineReady}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Combined PWA UI Components
export const PWAComponents: React.FC = () => {
  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
      <UpdatePrompt />
      <OfflineReadyToast />
    </>
  );
};

export default PWAComponents;
