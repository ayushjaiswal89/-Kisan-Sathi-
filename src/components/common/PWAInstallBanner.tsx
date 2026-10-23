import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { Lang } from '../../lib/types';
import { usePWAInstall } from '../../lib/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallBannerProps {
  lang: Lang;
}

const DISMISS_KEY = 'kisan-sathi-pwa-banner-dismissed-time';
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ lang }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      setIsDismissed(true);
      return;
    }
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const parsed = parseInt(dismissedAt, 10);
      if (Date.now() - parsed < DISMISS_DURATION_MS) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);
  }, [isInstalled]);

  if (isInstalled || isDismissed) {
    return (
      <>
        {showModal && (
          <PWAInstallModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            lang={lang}
          />
        )}
      </>
    );
  }

  const isHi = lang === 'hi';

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'manual') {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-900 border-b border-emerald-600/30 px-3 py-2 text-xs text-white">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
              <Smartphone size={14} className="stroke-[2.5]" />
            </div>
            <p className="truncate font-medium text-[11px] sm:text-xs">
              <span className="font-bold text-emerald-300">
                {isHi ? 'किसान साथी ऐप:' : 'Kisan Sathi App:'}
              </span>{' '}
              {isHi
                ? 'अपने फोन या कंप्यूटर में ऐप की तरह इंस्टॉल करें (ऑफलाइन भी काम करेगा)'
                : 'Install as an app on your phone or PC (Works offline)'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] sm:text-xs transition shadow active:scale-95"
            >
              <Download size={13} className="stroke-[2.5]" />
              <span>{isHi ? 'इंस्टॉल करें' : 'Install'}</span>
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1 rounded text-slate-400 hover:text-white transition"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <PWAInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          lang={lang}
        />
      )}
    </>
  );
};
