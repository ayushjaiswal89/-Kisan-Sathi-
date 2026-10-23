import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../lib/useOnlineStatus';
import { Lang } from '../../lib/types';

interface OfflineIndicatorProps {
  lang: Lang;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  const isHi = lang === 'hi';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500 text-slate-950 text-xs font-semibold shadow-xl border border-amber-300 animate-bounce"
    >
      <WifiOff size={15} className="shrink-0 stroke-[2.5]" />
      <span>
        {isHi
          ? 'ऑफलाइन मोड सक्रिय — सहेजा गया डेटा सुरक्षित काम कर रहा है'
          : 'Offline Mode Active — Cached farm data is running offline'}
      </span>
    </div>
  );
};
