'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Download, Trash2, ShieldAlert } from 'lucide-react';
import { Lang } from '../../lib/types';
import { downloadPhysicalBackup } from '../../lib/storageMigration';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  lang: Lang;
}

export function ResetDataModal({
  isOpen,
  onClose,
  onConfirmReset,
  lang,
}: ResetDataModalProps) {
  const isHi = lang === 'hi';
  const confirmationKeyword = isHi ? 'मिटाएं' : 'RESET';
  const [typedKeyword, setTypedKeyword] = useState('');
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = typedKeyword.trim().toLowerCase() === confirmationKeyword.toLowerCase();

  const handleDownloadBackup = () => {
    downloadPhysicalBackup();
    setHasDownloadedBackup(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0c1a13] border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-red-500/20 flex items-center justify-between bg-red-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-300">
                {isHi ? 'चेतावनी: पूरा डेटा रीसेट करें' : 'Warning: Reset All App Data'}
              </h2>
              <p className="text-[11px] text-red-200/80">
                {isHi ? 'यह क्रिया अपरिवर्तनीय है' : 'This action is permanent and cannot be undone'}
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

        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* WARNING MESSAGE */}
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 space-y-2">
            <p className="font-semibold text-red-200">
              {isHi
                ? '⚠️ क्या आप सचमुच पूरा डेटा मिटाना चाहते हैं?'
                : '⚠️ Are you sure you want to delete all data?'}
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
              <li>{isHi ? 'सभी खेत और उनकी फसलें हट जाएंगी।' : 'All fields and crops will be deleted.'}</li>
              <li>{isHi ? 'सभी खर्चे, उपज और बिक्री के रिकॉर्ड मिट जाएंगे।' : 'All expense, yield and sale records will be erased.'}</li>
              <li>{isHi ? 'बटाईदार और घर का स्टॉक रीसेट हो जाएगा।' : 'Partnership and home stock data will be reset.'}</li>
            </ul>
          </div>

          {/* BACKUP FIRST RECOMMENDATION */}
          <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">
                {isHi ? 'रीसेट से पहले बैकअप लें (सुझाव)' : 'Download Backup First (Recommended)'}
              </p>
              <p className="text-[10px] text-slate-400">
                {hasDownloadedBackup
                  ? isHi ? '✓ बैकअप डाउनलोड हो चुका है' : '✓ Backup downloaded'
                  : isHi ? 'ताकि बाद में डेटा वापस ला सकें' : 'In case you need to restore later'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="h-8 px-2.5 rounded-lg bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download size={13} />
              <span>{isHi ? 'सुरक्षित बैकअप' : 'Backup'}</span>
            </button>
          </div>

          {/* TYPE CONFIRMATION BOX */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isHi ? (
                <>
                  पुष्टि के लिए नीचे दिए बॉक्स में <b className="text-red-400">'{confirmationKeyword}'</b> लिखें:
                </>
              ) : (
                <>
                  Type <b className="text-red-400">'{confirmationKeyword}'</b> below to confirm:
                </>
              )}
            </label>
            <input
              type="text"
              value={typedKeyword}
              onChange={(e) => setTypedKeyword(e.target.value)}
              placeholder={confirmationKeyword}
              className="w-full h-10 rounded-xl border border-red-500/40 bg-[#07130e] px-3 text-center text-sm font-bold text-red-300 placeholder:text-slate-600 outline-none focus:border-red-500"
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2.5 pt-3 border-t border-[#1a3525]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-[#1e3c2c] text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={!isConfirmed}
              onClick={onConfirmReset}
              className={`flex-1 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isConfirmed
                  ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-lg shadow-red-950'
                  : 'bg-red-950/30 text-red-400/40 border border-red-900/30 cursor-not-allowed'
              }`}
            >
              <Trash2 size={14} />
              <span>{isHi ? 'हाँ, पूरा डेटा मिटाएं' : 'Permanently Reset'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
