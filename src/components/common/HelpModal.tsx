'use client';

import React from 'react';
import {
  X,
  Wheat,
  Plus,
  Users,
  Warehouse,
  TrendingUp,
  Share2,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  IndianRupee,
  Mic,
} from 'lucide-react';
import { Lang } from '../../lib/types';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
}

export function HelpModal({ isOpen, onClose, lang }: HelpModalProps) {
  if (!isOpen) return null;
  const isHi = lang === 'hi';

  const steps = isHi
    ? [
        {
          num: '1',
          icon: Plus,
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          title: 'खर्च लिखें (बीज, खाद, डीजल, मजदूरी)',
          desc: 'नीचे या ऊपर लाल बटन "+ नया खर्च" दबाएं। जो भी पैसा खेती में लगा, तुरंत दर्ज करें। आप बोलकर भी लिख सकते हैं!',
        },
        {
          num: '2',
          icon: IndianRupee,
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          title: 'फसल बिक्री लिखें (कमाई व उधारी)',
          desc: 'हरा बटन "+ फसल बिक्री" दबाएं। कितना अनाज बेचा, कितना नकद मिला और कितना व्यापारी से लेना बाकी है, सब साफ दिखेगा।',
        },
        {
          num: '3',
          icon: Users,
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          title: 'बटाई 50-50 हिसाब (साझेदार)',
          desc: 'बटाईदार के साथ आधा-आधा (50-50) खर्चा और कमाई का सटीक हिसाब। 1 क्लिक में WhatsApp पर रसीद भेजें।',
        },
        {
          num: '4',
          icon: Warehouse,
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          title: 'घर का स्टॉक व आज का मंडी भाव',
          desc: 'घर या गोदाम में रखा गेहूं, सोयाबीन आदि दर्ज करें। ऐप आज के लाइव मंडी भाव से तुरंत बता देगा कि आपके रखे अनाज की कुल कीमत कितनी है।',
        },
        {
          num: '5',
          icon: Mic,
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          title: 'बोलकर लिखें (Voice Typing)',
          desc: 'माइक दबाकर बोलें जैसे "डीजल 1200" या "सोयाबीन 20 क्विंटल 4600 भाव", ऐप अपने आप फॉर्म भर देगा।',
        },
      ]
    : [
        {
          num: '1',
          icon: Plus,
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          title: 'Record Expenses (Seeds, Fertilizer, Diesel, Labor)',
          desc: 'Tap "+ Add Expense" to log all inputs. You can also use voice typing in Hindi/English.',
        },
        {
          num: '2',
          icon: IndianRupee,
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          title: 'Log Crop Sales (Cash & Pending Dues)',
          desc: 'Tap "+ Crop Sale" to record sold grain, cash received, and remaining dues from traders.',
        },
        {
          num: '3',
          icon: Users,
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          title: '50-50 Batai & Partnership Settlement',
          desc: 'Automatic 50-50 shared input costs, harvest sales, and direct WhatsApp receipt generation.',
        },
        {
          num: '4',
          icon: Warehouse,
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          title: 'Home Stock & Live Mandi Valuation',
          desc: 'Track unsold harvest stored at home. The app calculates real-time valuation using latest Mandi rates.',
        },
        {
          num: '5',
          icon: Mic,
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          title: 'Voice Entry (बोलकर दर्ज करें)',
          desc: 'Tap the microphone and speak phrases like "Diesel 1200" or "Wheat 50 quintal 2650 rate" to auto-fill.',
        },
      ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[var(--sk-card)] border border-[var(--sk-border)] rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[var(--sk-border)] flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isHi ? 'किसान साथी कैसे चलाएं?' : 'How to use Kisan Sathi?'}
              </h2>
              <p className="text-xs text-emerald-400">
                {isHi ? 'सरल और आसान 5 मुख्य बातें' : '5 simple steps for every farmer'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2.5">
            <Smartphone size={20} className="text-emerald-400 shrink-0" />
            <span>
              {isHi
                ? 'यह ऐप मोबाइल पर ठीक एक सामान्य ऐप की तरह काम करता है। नीचे दिए गए 5 टैब से आप किसी भी हिस्से में जा सकते हैं।'
                : 'This app is designed like a native mobile app. Use the bottom navigation bar to switch sections.'}
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3.5 hover:border-slate-700 transition"
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${st.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        #{st.num}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        {st.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick WhatsApp Reminder */}
          <div className="p-3.5 rounded-xl bg-green-950/30 border border-green-500/30 flex items-center gap-2.5 text-xs text-green-300">
            <Share2 size={18} className="text-green-400 shrink-0" />
            <span>
              {isHi
                ? '📱 हर हिसाब का WhatsApp पर्चा सीधे व्यापारी या पार्टनर को 1-क्लिक में भेजा जा सकता है।'
                : 'Instant 1-click WhatsApp statements for traders and partners.'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--sk-border)] bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>{isHi ? 'समझ गया, शुरू करें' : 'Got it, let’s start'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
