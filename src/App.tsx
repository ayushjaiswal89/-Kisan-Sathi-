'use client';

import React, { useEffect, useState } from 'react';
import {
  Wheat,
  TrendingUp,
  BookOpen,
  Plus,
  Sprout,
  Sun,
  Compass,
  Users,
  Warehouse,
  Mic,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { CropStock, FarmRecord, Lang, Partner, PartnerCashEntry } from './lib/types';
import { INITIAL_FARM_RECORDS, INITIAL_PARTNERS, INITIAL_PARTNER_CASH, INITIAL_STOCKS } from './lib/initialData';
import { FarmSection } from './components/farm/FarmSection';
import { MandiSection } from './components/mandi/MandiSection';
import { CropAdvisorySection } from './components/crops/CropAdvisorySection';
import { PartnershipSection } from './components/partnership/PartnershipSection';
import { StockSection } from './components/stock/StockSection';
import { SettingsSection } from './components/settings/SettingsSection';
import { AppLockScreen } from './components/security/AppLockScreen';
import { getLandSettings, LAND_SETTINGS_CHANGED_EVENT } from './lib/landMeasurement';
import { LandSettingsModal } from './components/farm/LandSettingsModal';
import { HelpModal } from './components/common/HelpModal';
import { getSecuritySettings, saveSecuritySettings, SecuritySettings } from './lib/profileAndSecurity';
import { loadAndMigrateKhets } from './lib/storageMigration';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { OfflineIndicator } from './components/common/OfflineIndicator';

const STORAGE_RECORDS_KEY = 'kisan-mitra-records-v1';
const STORAGE_PARTNERS_KEY = 'kisan-mitra-partners-v1';
const STORAGE_PARTNER_CASH_KEY = 'kisan-mitra-partner-cash-v1';
const STORAGE_STOCKS_KEY = 'kisan-mitra-stocks-v1';
const STORAGE_LANG_KEY = 'kisan-mitra-lang';

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'hi';
    return (localStorage.getItem(STORAGE_LANG_KEY) as Lang) || 'hi';
  });

  const [activeSection, setActiveSection] = useState<'farm' | 'partnership' | 'stock' | 'mandi' | 'crops' | 'settings'>('farm');
  const [autoOpenAddRecord, setAutoOpenAddRecord] = useState(false);
  const [initialAddType, setInitialAddType] = useState<'Expense' | 'Sale' | 'Yield'>('Expense');
  const [showLandModal, setShowLandModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [landSettings, setLandSettings] = useState(() => getLandSettings());

  // Security Lock State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => getSecuritySettings());
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const sec = getSecuritySettings();
    return sec.isLockEnabled;
  });

  // Cached Khets data for Settings & Exports
  const [khetsData] = useState(() => loadAndMigrateKhets());

  // Stored Crop Stocks state
  const [stocks, setStocks] = useState<CropStock[]>(() => {
    if (typeof window === 'undefined') return INITIAL_STOCKS;
    try {
      const saved = localStorage.getItem(STORAGE_STOCKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_STOCKS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_STOCKS_KEY, JSON.stringify(stocks));
    }
  }, [stocks]);

  // Partners state
  const [partners, setPartners] = useState<Partner[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PARTNERS;
    try {
      const saved = localStorage.getItem(STORAGE_PARTNERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PARTNERS;
  });

  // Partner Cash state
  const [partnerCash, setPartnerCash] = useState<PartnerCashEntry[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PARTNER_CASH;
    try {
      const saved = localStorage.getItem(STORAGE_PARTNER_CASH_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_PARTNER_CASH;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PARTNERS_KEY, JSON.stringify(partners));
    }
  }, [partners]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PARTNER_CASH_KEY, JSON.stringify(partnerCash));
    }
  }, [partnerCash]);

  // Farm records persistence
  const [records, setRecords] = useState<FarmRecord[]>(() => {
    if (typeof window === 'undefined') return INITIAL_FARM_RECORDS;
    try {
      const saved = localStorage.getItem(STORAGE_RECORDS_KEY) || localStorage.getItem('sk-records-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[Storage Safety] Preserving corrupted records without deleting:', e);
    }
    return INITIAL_FARM_RECORDS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const payload = JSON.stringify(records);
        localStorage.setItem(STORAGE_RECORDS_KEY, payload);
        localStorage.setItem('sk-records-v2', payload);
      } catch (err) {
        console.error('Failed to save records:', err);
      }
    }
  }, [records]);

  const toggleLanguage = () => {
    const next: Lang = lang === 'hi' ? 'en' : 'hi';
    setLang(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_LANG_KEY, next);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) setLandSettings(e.detail);
      else setLandSettings(getLandSettings());
    };
    window.addEventListener(LAND_SETTINGS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(LAND_SETTINGS_CHANGED_EVENT, handler);
  }, []);

  // Auto-lock on app background or inactivity
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        const sec = getSecuritySettings();
        if (sec.isLockEnabled) {
          saveSecuritySettings({ ...sec, lastActiveTimestamp: Date.now() });
        }
      } else {
        const sec = getSecuritySettings();
        if (sec.isLockEnabled) {
          if (sec.autoLockMinutes === 0) {
            setIsAppLocked(true);
          } else if (sec.autoLockMinutes > 0) {
            const elapsed = Date.now() - (sec.lastActiveTimestamp || 0);
            if (elapsed >= sec.autoLockMinutes * 60 * 1000) {
              setIsAppLocked(true);
            }
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const isHi = lang === 'hi';

  return (
    <div className="min-h-screen bg-[var(--sk-bg)] text-[var(--sk-text)] flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 pb-28 md:pb-6">
      {/* PWA INSTALL INVITATION BANNER */}
      <PWAInstallBanner lang={lang} />

      {/* TOP APP BAR (Compact header with Logo, App Name, Help, Language) */}
      <header className="sticky top-0 z-40 border-b border-[#1a3525] bg-[#07130e]/95 backdrop-blur-md px-3 sm:px-5 py-2 overflow-hidden">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Brand Wordmark (Logo & App Name) */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-slate-950 shadow-sm shrink-0">
              <Sprout size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-base text-white tracking-tight leading-tight">
                {isHi ? 'किसान साथी' : 'Kisan Sathi'}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium leading-none hidden sm:block">
                {isHi ? 'डिजिटल कृषि बहीखाता' : 'Simple Farm Ledger'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 shrink">
            <button
              type="button"
              onClick={() => setActiveSection('farm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeSection === 'farm'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Wheat size={14} className="shrink-0" />
              <span>{isHi ? 'खेत बहीखाता' : 'Farm Ledger'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('partnership')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeSection === 'partnership'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Users size={14} className="shrink-0" />
              <span>{isHi ? 'बटाई / साझेदारी' : 'Partner / Batai'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('stock')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeSection === 'stock'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Warehouse size={14} className="shrink-0" />
              <span>{isHi ? 'घर का स्टॉक' : 'Home Stock'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('mandi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeSection === 'mandi'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <TrendingUp size={14} className="shrink-0" />
              <span>{isHi ? 'मंडी भाव' : 'Mandi Rates'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('crops')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeSection === 'crops'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BookOpen size={14} className="shrink-0" />
              <span>{isHi ? 'फसल सलाह' : 'Crop Guides'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeSection === 'settings'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Settings size={14} className="shrink-0" />
              <span>{isHi ? 'सेटिंग्स' : 'Settings'}</span>
            </button>
          </nav>

          {/* Right Action Controls: ऐप इंस्टॉल करें, सेटिंग्स, सहायता और भाषा */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PWA Install Button */}
            <PWAInstallButton lang={lang} variant="header" />

            {/* Settings Trigger */}
            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className={`h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm shrink-0 ${
                activeSection === 'settings'
                  ? 'border-emerald-500 bg-emerald-600 text-white font-bold'
                  : 'border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#12271c] text-emerald-300 font-semibold'
              }`}
              title={isHi ? 'सेटिंग्स व प्रोफाइल' : 'Settings & Profile'}
            >
              <Settings size={14} className={activeSection === 'settings' ? 'text-white' : 'text-emerald-400 shrink-0'} />
              <span>{isHi ? 'सेटिंग्स' : 'Settings'}</span>
            </button>

            {/* Help & Guide Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#12271c] text-[11px] sm:text-xs font-semibold text-emerald-300 transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm shrink-0"
              title={isHi ? 'सहायता एवं निर्देश' : 'Help & Guide'}
            >
              <HelpCircle size={14} className="text-emerald-400 shrink-0" />
              <span>{isHi ? 'सहायता' : 'Help'}</span>
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="h-7.5 sm:h-8 px-2 sm:px-2.5 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#12271c] text-[11px] sm:text-xs font-bold text-slate-200 transition cursor-pointer active:scale-95 shrink-0"
              title="Change Language"
            >
              {lang === 'hi' ? 'English' : 'हिंदी'}
            </button>
          </div>
        </div>
      </header>

      {/* SLIM DAILY MANDI RATES STRIP */}
      <div className="border-b border-[#14261d] bg-[#05100a] py-1 px-3 sm:px-5 overflow-hidden text-[11px] text-slate-300">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-3 overflow-x-auto whitespace-nowrap no-scrollbar">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <span className="font-bold text-emerald-400 flex items-center gap-1 shrink-0">
              <Sun size={11} className="text-amber-400" />
              {isHi ? 'मंडी भाव:' : 'Mandi Rates:'}
            </span>
            <span className="font-mono text-slate-300">
              गेहूं: <b className="text-emerald-300 font-semibold">₹2,650</b>
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">
              सोयाबीन: <b className="text-emerald-300 font-semibold">₹4,620</b>
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">
              लहसुन: <b className="text-emerald-300 font-semibold">₹17,800</b>
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">
              सरसों: <b className="text-emerald-300 font-semibold">₹5,650</b>
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">
              चना: <b className="text-emerald-300 font-semibold">₹6,100</b>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden md:inline shrink-0">
            {isHi ? 'दैनिक मॉडल भाव (प्रति क्विंटल)' : 'Daily rates /Qtl'}
          </span>
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 py-3 sm:py-5">
        {activeSection === 'farm' && (
          <FarmSection
            records={records}
            setRecords={setRecords}
            lang={lang}
            autoOpenAdd={autoOpenAddRecord}
            initialAddType={initialAddType}
            onClearAutoOpenAdd={() => setAutoOpenAddRecord(false)}
            partners={partners}
            setPartners={setPartners}
            partnerCash={partnerCash}
            setPartnerCash={setPartnerCash}
          />
        )}
        {activeSection === 'partnership' && (
          <PartnershipSection
            lang={lang}
            partners={partners}
            setPartners={setPartners}
            partnerCash={partnerCash}
            setPartnerCash={setPartnerCash}
            farmRecords={records}
          />
        )}
        {activeSection === 'stock' && (
          <StockSection
            lang={lang}
            stocks={stocks}
            setStocks={setStocks}
            onSellStockDirect={(crop, qty, price) => {
              setInitialAddType('Sale');
              setActiveSection('farm');
              setAutoOpenAddRecord(true);
            }}
          />
        )}
        {activeSection === 'mandi' && (
          <MandiSection
            lang={lang}
            onNavigateToSale={(crop, price) => {
              setInitialAddType('Sale');
              setActiveSection('farm');
              setAutoOpenAddRecord(true);
            }}
          />
        )}
        {activeSection === 'crops' && (
          <CropAdvisorySection
            lang={lang}
            onSelectCropForKhet={(crop) => {
              setActiveSection('farm');
            }}
          />
        )}
        {activeSection === 'settings' && (
          <SettingsSection
            lang={lang}
            onToggleLang={toggleLanguage}
            records={records}
            setRecords={setRecords}
            khets={khetsData.khets}
            khetCrops={khetsData.khetCrops}
            onOpenHowToUse={() => setShowHelpModal(true)}
          />
        )}
      </main>

      {/* FLOATING ACTION BUTTON (FAB) ON MOBILE */}
      <div className="fixed right-3.5 bottom-16 z-40 md:hidden pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            setInitialAddType('Expense');
            setActiveSection('farm');
            setAutoOpenAddRecord(true);
          }}
          className="h-10 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-black/60 border border-emerald-400/30 flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          aria-label="Add new entry"
        >
          <Plus size={15} className="stroke-[3]" />
          <span className="font-bold whitespace-nowrap">
            {isHi ? '+ नया हिसाब' : '+ New Entry'}
          </span>
        </button>
      </div>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (आइकन और नाम एक ही जगह स्थिर) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07130e] border-t border-[#1a3525] px-1 py-1 pb-safe shadow-lg"
      >
        <div className="grid grid-cols-5 items-center h-13">
          {/* Tab 1: Farm */}
          <button
            type="button"
            onClick={() => setActiveSection('farm')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeSection === 'farm'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-7 h-5 flex items-center justify-center">
              <Wheat size={18} className={activeSection === 'farm' ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 truncate max-w-full">
              {isHi ? 'खेत खाता' : 'Ledger'}
            </span>
          </button>

          {/* Tab 2: Partnership */}
          <button
            type="button"
            onClick={() => setActiveSection('partnership')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeSection === 'partnership'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-7 h-5 flex items-center justify-center">
              <Users size={18} className={activeSection === 'partnership' ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 truncate max-w-full">
              {isHi ? 'बटाई 50-50' : 'Batai'}
            </span>
          </button>

          {/* Tab 3: Home Stock */}
          <button
            type="button"
            onClick={() => setActiveSection('stock')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeSection === 'stock'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-7 h-5 flex items-center justify-center">
              <Warehouse size={18} className={activeSection === 'stock' ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 truncate max-w-full">
              {isHi ? 'घर का स्टॉक' : 'Stock'}
            </span>
          </button>

          {/* Tab 4: Mandi */}
          <button
            type="button"
            onClick={() => setActiveSection('mandi')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeSection === 'mandi'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-7 h-5 flex items-center justify-center">
              <TrendingUp size={18} className={activeSection === 'mandi' ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 truncate max-w-full">
              {isHi ? 'मंडी भाव' : 'Mandi'}
            </span>
          </button>

          {/* Tab 5: Crop Guides */}
          <button
            type="button"
            onClick={() => setActiveSection('crops')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeSection === 'crops'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-7 h-5 flex items-center justify-center">
              <BookOpen size={18} className={activeSection === 'crops' ? 'stroke-[2.5]' : 'stroke-2'} />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 truncate max-w-full">
              {isHi ? 'फसल सलाह' : 'Guides'}
            </span>
          </button>
        </div>
      </nav>

      {/* FOOTER (Clean desktop / bottom informational note) */}
      <footer className="hidden md:block border-t border-[var(--sk-border)] bg-[#07130d] py-5 px-4 text-xs text-slate-500">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-300">
              🌱 {isHi ? 'किसान साथी' : 'Kisan Sathi'}
            </span>{' '}
            - {isHi ? 'स्मार्ट डिजिटल कृषि बहीखाता, मंडी भाव एवं बटाईदार हिसाब ऐप।' : 'Smart Digital Farm Ledger & Mandi App.'}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>सुरक्षित डेटा (100% ऑफलाइन लोकल स्टोरेज)</span>
            <span>•</span>
            <span>CSV / PDF / WhatsApp शेयरिंग</span>
          </div>
        </div>
      </footer>

      {/* LAND UNIT MODAL */}
      <LandSettingsModal
        isOpen={showLandModal}
        onClose={() => setShowLandModal(false)}
        lang={lang}
        onSettingsSaved={(newSettings) => setLandSettings(newSettings)}
      />

      {/* HELP & BEGINNER GUIDE MODAL */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        lang={lang}
      />

      {/* OFFLINE STATUS NOTIFICATION */}
      <OfflineIndicator lang={lang} />
    </div>
  );
}
