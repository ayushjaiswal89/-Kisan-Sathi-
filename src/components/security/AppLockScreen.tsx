'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Delete, Fingerprint, Shield, Sprout, AlertCircle } from 'lucide-react';
import { Lang } from '../../lib/types';
import { SecuritySettings } from '../../lib/profileAndSecurity';

interface AppLockScreenProps {
  lang: Lang;
  securitySettings: SecuritySettings;
  onUnlock: () => void;
}

export function AppLockScreen({ lang, securitySettings, onUnlock }: AppLockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isHi = lang === 'hi';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      setErrorMessage('');

      if (nextPin.length === 4) {
        // Validate PIN
        if (nextPin === securitySettings.pin) {
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setTimeout(() => {
            setError(true);
            setErrorMessage(isHi ? 'गलत PIN दर्ज किया गया है!' : 'Incorrect PIN entered!');
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const handleBiometric = () => {
    // Check WebAuthn or mock biometric prompt
    if (window.PublicKeyCredential) {
      // Simulate/trigger biometric
      onUnlock();
    } else {
      onUnlock();
    }
  };

  // Keyboard support for typing PIN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, securitySettings.pin]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#07130e] text-white flex flex-col items-center justify-between p-6 select-none font-sans">
      {/* HEADER */}
      <div className="flex flex-col items-center text-center pt-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950">
          <Sprout size={32} className="stroke-[2.5]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {isHi ? 'किसान साथी' : 'Kisan Sathi'}
        </h1>
        <p className="text-xs text-emerald-400 font-medium mt-0.5">
          {isHi ? 'डिजिटल कृषि बहीखाता' : 'Digital Farm Ledger'}
        </p>

        <div className="mt-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c1a13] border border-[#1e3c2c] text-xs text-slate-300">
          <Lock size={12} className="text-emerald-400" />
          <span>{isHi ? 'अपने खेती के हिसाब को सुरक्षित रखें' : 'Keep your farm ledger protected'}</span>
        </div>
      </div>

      {/* PIN ENTRY DOTS */}
      <div className="flex flex-col items-center">
        <p className="text-xs text-slate-400 mb-4 font-semibold">
          {isHi ? '4-अंकों का सुरक्षा PIN दर्ज करें' : 'Enter 4-Digit Security PIN'}
        </p>

        <div className={`flex items-center gap-4 py-2 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-110 shadow-md shadow-emerald-500/50'
                    : 'border-2 border-slate-600 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 mt-3 font-semibold">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* NUMPAD KEYPAD */}
      <div className="w-full max-w-xs pb-4">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 sm:h-16 rounded-2xl bg-[#0c1a13] border border-[#1e3c2c] hover:bg-[#152e20] active:scale-95 text-xl font-bold text-white transition flex items-center justify-center cursor-pointer shadow-sm"
            >
              {digit}
            </button>
          ))}

          {/* Biometric Button or Blank */}
          {securitySettings.biometricEnabled ? (
            <button
              type="button"
              onClick={handleBiometric}
              className="h-14 sm:h-16 rounded-2xl bg-[#0c1a13] border border-[#1e3c2c] hover:bg-[#152e20] active:scale-95 text-emerald-400 transition flex items-center justify-center cursor-pointer shadow-sm"
              title={isHi ? 'बायोमेट्रिक से खोलें' : 'Unlock with Biometric'}
            >
              <Fingerprint size={24} />
            </button>
          ) : (
            <div className="h-14 sm:h-16" />
          )}

          {/* Digit 0 */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 sm:h-16 rounded-2xl bg-[#0c1a13] border border-[#1e3c2c] hover:bg-[#152e20] active:scale-95 text-xl font-bold text-white transition flex items-center justify-center cursor-pointer shadow-sm"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 sm:h-16 rounded-2xl bg-[#0c1a13] border border-[#1e3c2c] hover:bg-[#152e20] active:scale-95 text-slate-300 transition flex items-center justify-center cursor-pointer shadow-sm"
            title={isHi ? 'हटाएं' : 'Delete'}
          >
            <Delete size={20} />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500">
            {isHi
              ? 'डिफ़ॉल्ट PIN 1234 है | सेटिंग्स में जाकर बदल सकते हैं'
              : 'Default PIN is 1234 | Can be changed in Settings'}
          </p>
        </div>
      </div>
    </div>
  );
}
