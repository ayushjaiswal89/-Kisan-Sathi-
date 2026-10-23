import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Monitor,
  X,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  Wifi,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Lang } from '../../lib/types';
import { usePWAInstall } from '../../lib/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'android';
  });
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const isHi = lang === 'hi';

  const handleNativeInstall = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#0e1914] border border-[#1e382b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e382b] bg-[#07130e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-md">
              <Download size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {isHi ? 'किसान साथी ऐप इंस्टॉल करें' : 'Install Kisan Sathi App'}
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'सभी मोबाइल, टैबलेट और कंप्यूटर पर सीधे इंस्टॉल करें'
                  : 'Install directly on any Mobile, Tablet, or PC'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15271e] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Quick Features Banner */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#09110d] border border-[#162e21] text-center text-xs">
            <div className="flex flex-col items-center gap-1 p-1">
              <Zap size={16} className="text-emerald-400" />
              <span className="text-[11px] text-slate-300 font-medium leading-tight">
                {isHi ? 'तेज़ व सुचारू' : 'Fast & Smooth'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-1 border-x border-[#162e21]">
              <Wifi size={16} className="text-emerald-400" />
              <span className="text-[11px] text-slate-300 font-medium leading-tight">
                {isHi ? 'ऑफलाइन भी चले' : 'Works Offline'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-1">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-[11px] text-slate-300 font-medium leading-tight">
                {isHi ? 'डेटा सुरक्षित' : '100% Private'}
              </span>
            </div>
          </div>

          {/* Already installed state */}
          {isInstalled && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">
                  {isHi ? 'ऐप पहले से इंस्टॉल है!' : 'App is already installed!'}
                </p>
                <p className="text-slate-300">
                  {isHi
                    ? 'आप इसे अपनी होम स्क्रीन या ऐप लिस्ट से सीधे खोल सकते हैं।'
                    : 'You can launch it directly from your home screen or app menu.'}
                </p>
              </div>
            </div>
          )}

          {/* Direct 1-Click Install Button if browser supports beforeinstallprompt */}
          {isInstallable && !isInstalled && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-900/60 to-teal-900/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles size={20} className="text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-white">
                    {isHi ? '1-क्लिक में तुरंत इंस्टॉल करें' : 'Direct 1-Click Install Ready'}
                  </p>
                  <p className="text-slate-300">
                    {isHi
                      ? 'प्ले स्टोर की जरूरत नहीं, केवल 2 सेकंड में!'
                      : 'No store required, lightweight & instant.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleNativeInstall}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Download size={15} className="stroke-[2.5]" />
                {isHi ? 'अभी इंस्टॉल करें' : 'Install Now'}
              </button>
            </div>
          )}

          {installSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-center text-xs font-semibold text-emerald-300">
              {isHi ? '🎉 बधाई! ऐप सफलतापूर्वक इंस्टॉल हो गया।' : '🎉 Success! App installed.'}
            </div>
          )}

          {/* Device Tabs */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2">
              {isHi ? 'अपने डिवाइस के अनुसार गाइड चुनें:' : 'Select instructions for your device:'}
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#09110d] rounded-xl border border-[#1e382b]">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition ${
                  activeTab === 'android'
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone size={14} />
                <span>Android</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition ${
                  activeTab === 'ios'
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Apple size={14} />
                <span>iPhone / iPad</span>
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition ${
                  activeTab === 'desktop'
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Monitor size={14} />
                <span>PC / Laptop</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 rounded-xl bg-[#07130e] border border-[#183124] space-y-3 text-xs">
            {activeTab === 'android' && (
              <div className="space-y-3">
                <div className="font-semibold text-emerald-400">
                  {isHi ? 'Android फोन में इंस्टॉल कैसे करें:' : 'How to install on Android phone:'}
                </div>
                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          ब्राउज़र के ऊपर या नीचे बने <strong className="text-white">तीन बिंदुओं (⋮ Menu)</strong> पर टैप करें।
                        </>
                      ) : (
                        <>
                          Tap the <strong className="text-white">three dots (⋮ Menu)</strong> in Chrome or Samsung Internet.
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          मेन्यू में <strong className="text-white">&ldquo;ऐप इंस्टॉल करें&rdquo;</strong> या <strong className="text-white">&ldquo;होम स्क्रीन पर जोड़ें&rdquo; (Install App / Add to Home screen)</strong> विकल्प चुनें।
                        </>
                      ) : (
                        <>
                          Select <strong className="text-white">&ldquo;Install App&rdquo;</strong> or <strong className="text-white">&ldquo;Add to Home screen&rdquo;</strong>.
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          <strong className="text-white">&ldquo;इंस्टॉल&rdquo;</strong> दबाएं। ऐप का आइकन आपके मोबाइल स्क्रीन पर आ जाएगा।
                        </>
                      ) : (
                        <>
                          Confirm by tapping <strong className="text-white">&ldquo;Install&rdquo;</strong>. The Kisan Sathi icon will appear on your phone home screen!
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="space-y-3">
                <div className="font-semibold text-emerald-400">
                  {isHi ? 'iPhone या iPad में इंस्टॉल करने का तरीका:' : 'How to install on iPhone or iPad (Safari):'}
                </div>
                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          Safari ब्राउज़र में नीचे दिए गए <strong className="text-white">शेयर (Share <Share2 size={12} className="inline mx-0.5" />)</strong> बटन पर टैप करें।
                        </>
                      ) : (
                        <>
                          Tap the <strong className="text-white">Share button (<Share2 size={12} className="inline mx-0.5" />)</strong> in the Safari toolbar.
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          नीचे स्क्रॉल करें और <strong className="text-white">&ldquo;होम स्क्रीन में जोड़ें&rdquo; (Add to Home Screen <PlusSquare size={12} className="inline mx-0.5" />)</strong> पर टैप करें।
                        </>
                      ) : (
                        <>
                          Scroll down and tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo; (<PlusSquare size={12} className="inline mx-0.5" />)</strong>.
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          ऊपर दाएं कोने में <strong className="text-white">&ldquo;Add&rdquo;</strong> पर क्लिक करें। ऐप आपके iPhone पर इंस्टॉल हो जाएगा!
                        </>
                      ) : (
                        <>
                          Tap <strong className="text-white">&ldquo;Add&rdquo;</strong> at the top right. Kisan Sathi is now installed on your Apple device!
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-3">
                <div className="font-semibold text-emerald-400">
                  {isHi ? 'कंप्यूटर या लैपटॉप (Windows/Mac) पर इंस्टॉल करें:' : 'How to install on Computer or Laptop:'}
                </div>
                <div className="space-y-2.5 text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          Chrome या Edge ब्राउज़र के <strong className="text-white">एड्रेस बार (URL बार)</strong> के दाएं तरफ बने <strong className="text-white">इंस्टॉल आइकन (⊕ या 💻)</strong> पर क्लिक करें।
                        </>
                      ) : (
                        <>
                          In Chrome or Edge, click the <strong className="text-white">Install icon (⊕)</strong> on the right side of the URL address bar.
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          या ऊपर 3 बिंदुओं (⋮ मेन्यू) पर क्लिक करके <strong className="text-white">&ldquo;Save and share&rdquo; → &ldquo;Install Kisan Sathi&rdquo;</strong> चुनें।
                        </>
                      ) : (
                        <>
                          Or open browser menu (⋮) → <strong className="text-white">&ldquo;Install Kisan Sathi...&rdquo;</strong>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-[#183124] text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      {isHi ? (
                        <>
                          ऐप एक अलग विंडो में डेस्कटॉप ऐप की तरह खुलेगा और डेस्कटॉप पर शॉर्टकट बन जाएगा।
                        </>
                      ) : (
                        <>
                          The app will open as a standalone desktop window with its own icon on your desktop/taskbar.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#1e382b] bg-[#07130e] flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            {isHi ? 'ऑटोमैटिक अपडेट्स और बिना इंटरनेट काम करता है' : 'Auto updates & offline ready'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#14251e] hover:bg-[#1c3629] text-white font-medium text-xs transition"
          >
            {isHi ? 'समझ गया (बंद करें)' : 'Got it (Close)'}
          </button>
        </div>
      </div>
    </div>
  );
};
