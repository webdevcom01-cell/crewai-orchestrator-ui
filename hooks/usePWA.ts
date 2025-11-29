import { useEffect, useState } from 'react';

// Virtual module from vite-plugin-pwa - types defined in types/pwa.d.ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Virtual module from vite-plugin-pwa
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  isOfflineReady: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    isOfflineReady: false,
  });

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('SW Registered:', registration);
      
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setStatus(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setStatus(prev => ({ 
        ...prev, 
        isInstallable: false, 
        isInstalled: true 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setStatus(prev => ({ ...prev, isInstalled: true }));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update status based on SW state
  useEffect(() => {
    setStatus(prev => ({
      ...prev,
      isUpdateAvailable: needRefresh,
      isOfflineReady: offlineReady,
    }));
  }, [needRefresh, offlineReady]);

  // Install app
  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        deferredPrompt = null;
        setStatus(prev => ({ ...prev, isInstallable: false }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Install error:', error);
      return false;
    }
  };

  // Update app
  const updateApp = async (): Promise<void> => {
    await updateServiceWorker(true);
  };

  // Dismiss update
  const dismissUpdate = () => {
    setNeedRefresh(false);
  };

  // Dismiss offline ready notification
  const dismissOfflineReady = () => {
    setOfflineReady(false);
  };

  return {
    status,
    installApp,
    updateApp,
    dismissUpdate,
    dismissOfflineReady,
  };
}

// Offline indicator component hook
export function useOfflineIndicator() {
  const [showIndicator, setShowIndicator] = useState(false);
  const { status } = usePWA();

  useEffect(() => {
    if (!status.isOnline) {
      setShowIndicator(true);
    } else {
      // Hide after a short delay when coming back online
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status.isOnline]);

  return {
    showIndicator,
    isOnline: status.isOnline,
  };
}
