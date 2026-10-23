import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChromeOrEdge, setIsChromeOrEdge] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed or running as standalone PWA)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isWindowStandalone = window.matchMedia('(display-mode: window-controls-overlay)').matches;
      return isStandaloneMedia || isIOSStandalone || isWindowStandalone;
    };

    setIsInstalled(checkStandalone());

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);
    const isChromeOrEdgeBrowser = /chrome|crios|edg/.test(ua) && !/opr\//.test(ua);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsChromeOrEdge(isChromeOrEdgeBrowser);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    if (!deferredPrompt) {
      return 'manual';
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('Install prompt failed:', err);
      return 'manual';
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isChromeOrEdge,
    install,
    hasNativePrompt: !!deferredPrompt,
  };
}
