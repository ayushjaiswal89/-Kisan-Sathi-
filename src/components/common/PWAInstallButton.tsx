import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Lang } from '../../lib/types';
import { usePWAInstall } from '../../lib/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  lang: Lang;
  variant?: 'header' | 'card' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang,
  variant = 'header',
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const isHi = lang === 'hi';

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'manual') {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  // If already running standalone and rendered in header, show compact check badge or hide
  if (isInstalled && variant === 'header') {
    return (
      <div
        title={isHi ? 'ऐप इंस्टॉल किया गया है' : 'App is Installed'}
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-[11px] font-medium text-emerald-400"
      >
        <CheckCircle2 size={13} className="text-emerald-400" />
        <span>{isHi ? 'इंस्टॉल्ड' : 'Installed'}</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          title={isHi ? 'ऐप को अपने डिवाइस में इंस्टॉल करें' : 'Install App on your device'}
          className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition shadow-sm active:scale-95 shrink-0"
        >
          <Download size={14} className="stroke-[2.5]" />
          <span>{isHi ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
        </button>
      )}

      {variant === 'card' && (
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 to-[#0e2117] border border-emerald-600/40 hover:border-emerald-500 transition text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shrink-0 transition">
              <Download size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>{isHi ? 'किसान साथी ऐप इंस्टॉल करें' : 'Install Kisan Sathi App'}</span>
                {isInstalled && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {isHi ? 'स्थापित' : 'Installed'}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                {isHi
                  ? 'होम स्क्रीन पर जोड़ें, बिना इंटरनेट और बिना ब्राउज़र बार के चलाएं'
                  : 'Add to home screen, works offline like a native app'}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition shrink-0 ml-2">
            {isHi ? 'गाइड व इंस्टॉल →' : 'Install →'}
          </span>
        </button>
      )}

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
