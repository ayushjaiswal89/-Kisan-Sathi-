'use client';

import React, { useState } from 'react';
import { X, Check, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { Lang } from '../../lib/types';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onPinChanged: (newPin: string) => void;
  lang: Lang;
}

export function ChangePinModal({
  isOpen,
  onClose,
  currentPin,
  onPinChanged,
  lang,
}: ChangePinModalProps) {
  const isHi = lang === 'hi';
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Verify old pin
    if (oldPin !== currentPin) {
      setError(isHi ? 'पुराना PIN गलत है! कृपया सही PIN दर्ज करें।' : 'Old PIN is incorrect!');
      return;
    }

    // 2. Validate new pin format
    if (!/^\d{4}$/.test(newPin)) {
      setError(isHi ? 'नया PIN ठीक 4 अंकों का होना चाहिए।' : 'New PIN must be exactly 4 digits.');
      return;
    }

    // 3. Match confirmation
    if (newPin !== confirmPin) {
      setError(isHi ? 'नया PIN और पुष्टि PIN मेल नहीं खाते!' : 'New PIN and confirm PIN do not match!');
      return;
    }

    onPinChanged(newPin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#0c1a13] border border-[#1e3c2c] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 border-b border-[#1a3525] flex items-center justify-between bg-[#07130e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <KeyRound size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isHi ? 'सुरक्षा PIN बदलें' : 'Change Security PIN'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'पुराने PIN की पुष्टि के बाद नया PIN सेट करें' : 'Confirm old PIN then enter new 4-digit PIN'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Old PIN */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'पुराना PIN' : 'Current Old PIN'} <span className="text-emerald-400">*</span>
            </label>
            <input
              type="password"
              maxLength={4}
              required
              autoFocus
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] px-3 text-center text-lg tracking-widest text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* 2. New PIN */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'नया 4-अंकों का PIN' : 'New 4-Digit PIN'} <span className="text-emerald-400">*</span>
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] px-3 text-center text-lg tracking-widest text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* 3. Confirm New PIN */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'नए PIN की दोबारा पुष्टि' : 'Confirm New PIN'} <span className="text-emerald-400">*</span>
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] px-3 text-center text-lg tracking-widest text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-[#1a3525]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-[#1e3c2c] text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950"
            >
              <Check size={14} />
              <span>{isHi ? 'PIN बदलें' : 'Save PIN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
