'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Shield,
  Database,
  Wheat,
  TrendingUp,
  HelpCircle,
  Lock,
  KeyRound,
  Fingerprint,
  Clock,
  Download,
  Upload,
  FileSpreadsheet,
  Moon,
  Sun,
  Type,
  Calendar,
  Compass,
  Scale,
  Bell,
  AlertTriangle,
  Check,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  FileText,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { Lang, FarmRecord, Khet, KhetCrop } from '../../lib/types';
import {
  FarmerProfile,
  SecuritySettings,
  AppPreferences,
  FarmingPreferences,
  MandiPreferences,
  getFarmerProfile,
  saveFarmerProfile,
  getSecuritySettings,
  saveSecuritySettings,
  getAppPreferences,
  saveAppPreferences,
  getFarmingPreferences,
  saveFarmingPreferences,
  getMandiPreferences,
  saveMandiPreferences,
  getLastBackupTimestamp,
  recordBackupTimestamp,
} from '../../lib/profileAndSecurity';
import {
  getLandSettings,
  saveLandSettings,
  REGION_PRESETS,
  LandUnitSettings,
} from '../../lib/landMeasurement';
import { downloadPhysicalBackup } from '../../lib/storageMigration';
import { exportToExcel, exportToCsv } from '../../lib/excelExport';
import { EditProfileModal } from './EditProfileModal';
import { ChangePinModal } from './ChangePinModal';
import { ResetDataModal } from './ResetDataModal';
import { HelpModal } from '../common/HelpModal';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SettingsSectionProps {
  lang: Lang;
  onToggleLang: () => void;
  records: FarmRecord[];
  setRecords: React.Dispatch<React.SetStateAction<FarmRecord[]>>;
  khets: Khet[];
  khetCrops: KhetCrop[];
  onOpenHowToUse?: () => void;
}

export function SettingsSection({
  lang,
  onToggleLang,
  records,
  setRecords,
  khets,
  khetCrops,
  onOpenHowToUse,
}: SettingsSectionProps) {
  const isHi = lang === 'hi';

  // 1. Farmer Profile State
  const [profile, setProfile] = useState<FarmerProfile>(() => getFarmerProfile());
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // 2. Security / App Lock State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => getSecuritySettings());
  const [showChangePinModal, setShowChangePinModal] = useState(false);

  // 3. App Preferences State
  const [appPrefs, setAppPrefs] = useState<AppPreferences>(() => getAppPreferences());

  // 4. Farming & Accounting Preferences State
  const [farmingPrefs, setFarmingPrefs] = useState<FarmingPreferences>(() => getFarmingPreferences());
  const [landSettings, setLandSettings] = useState<LandUnitSettings>(() => getLandSettings());

  // 5. Mandi & Reminders State
  const [mandiPrefs, setMandiPrefs] = useState<MandiPreferences>(() => getMandiPreferences());

  // 6. Backup Timestamp
  const [lastBackupTime, setLastBackupTime] = useState<number | null>(() => getLastBackupTimestamp());

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile Save
  const handleProfileSave = (updated: FarmerProfile) => {
    setProfile(updated);
    saveFarmerProfile(updated);
    showToast(isHi ? 'किसान प्रोफाइल अपडेट हो गई!' : 'Farmer profile updated!');
  };

  // Toggle App Lock
  const handleToggleAppLock = () => {
    const nextState = !securitySettings.isLockEnabled;
    const updated = { ...securitySettings, isLockEnabled: nextState };
    setSecuritySettings(updated);
    saveSecuritySettings(updated);
    showToast(
      nextState
        ? isHi ? 'ऐप लॉक चालू कर दिया गया है!' : 'App Lock activated!'
        : isHi ? 'ऐप लॉक बंद कर दिया गया है' : 'App Lock deactivated'
    );
  };

  // Toggle Biometric
  const handleToggleBiometric = () => {
    const nextState = !securitySettings.biometricEnabled;
    const updated = { ...securitySettings, biometricEnabled: nextState };
    setSecuritySettings(updated);
    saveSecuritySettings(updated);
    showToast(
      nextState
        ? isHi ? 'बायोमेट्रिक अनलॉक सक्रिय!' : 'Biometric unlock enabled!'
        : isHi ? 'बायोमेट्रिक अनलॉक बंद किया गया' : 'Biometric unlock disabled'
    );
  };

  // Change Auto-lock Minutes
  const handleAutoLockChange = (mins: number) => {
    const updated = { ...securitySettings, autoLockMinutes: mins };
    setSecuritySettings(updated);
    saveSecuritySettings(updated);
    showToast(isHi ? 'ऑटो-लॉक समय सेट किया गया' : 'Auto-lock duration saved');
  };

  // PIN Changed
  const handlePinChanged = (newPin: string) => {
    const updated = { ...securitySettings, pin: newPin };
    setSecuritySettings(updated);
    saveSecuritySettings(updated);
    showToast(isHi ? 'सुरक्षा PIN सफलतापूर्वक बदल गया!' : 'Security PIN changed successfully!');
  };

  // App Prefs Handlers
  const handleThemeChange = (theme: AppPreferences['theme']) => {
    const updated = { ...appPrefs, theme };
    setAppPrefs(updated);
    saveAppPreferences(updated);
    // Apply theme attribute to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    showToast(isHi ? 'थीम बदल दी गई!' : 'Theme updated!');
  };

  const handleTextSizeChange = (textSize: AppPreferences['textSize']) => {
    const updated = { ...appPrefs, textSize };
    setAppPrefs(updated);
    saveAppPreferences(updated);
    // Adjust root font size
    if (typeof document !== 'undefined') {
      if (textSize === 'large') document.documentElement.style.fontSize = '17px';
      else if (textSize === 'huge') document.documentElement.style.fontSize = '18px';
      else document.documentElement.style.fontSize = '15px';
    }
    showToast(isHi ? 'टेक्स्ट का आकार अपडेट हुआ' : 'Text size updated');
  };

  const handleDateFormatChange = (dateFormat: AppPreferences['dateFormat']) => {
    const updated = { ...appPrefs, dateFormat };
    setAppPrefs(updated);
    saveAppPreferences(updated);
    showToast(isHi ? 'तारीख का प्रारूप सेट किया गया' : 'Date format updated');
  };

  // Farming Prefs Handlers
  const handleBighaMeasureChange = (presetId: string) => {
    const preset = REGION_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const updatedLand: LandUnitSettings = {
        presetId: preset.id,
        bighaPerAcre: preset.bighaPerAcre,
        biswaPerBigha: preset.biswaPerBigha,
        regionNameHi: preset.nameHi,
        regionNameEn: preset.nameEn,
        isCustom: false,
      };
      setLandSettings(updatedLand);
      saveLandSettings(updatedLand);
      showToast(isHi ? `बीघा माप सेट: 1 एकड़ = ${preset.bighaPerAcre} बीघा` : `Bigha measure set: 1 Acre = ${preset.bighaPerAcre} Bigha`);
    }
  };

  const handleCustomBighaPerAcre = (val: number) => {
    if (val > 0) {
      const updatedLand: LandUnitSettings = {
        presetId: 'custom',
        bighaPerAcre: val,
        biswaPerBigha: 20,
        regionNameHi: `कस्टम माप (1 एकड़ = ${val} बीघा)`,
        regionNameEn: `Custom Measure (1 Acre = ${val} Bigha)`,
        isCustom: true,
      };
      setLandSettings(updatedLand);
      saveLandSettings(updatedLand);
      showToast(isHi ? `स्थानीय माप सेट: 1 एकड़ = ${val} बीघा` : `Custom bigha measure set`);
    }
  };

  const handleFarmingPrefsChange = (partial: Partial<FarmingPreferences>) => {
    const updated = { ...farmingPrefs, ...partial };
    setFarmingPrefs(updated);
    saveFarmingPreferences(updated);
    showToast(isHi ? 'खेती प्राथमिकताएं सहेजी गईं' : 'Farming preferences saved');
  };

  // Mandi Prefs Handlers
  const handleToggleCropFavorite = (crop: string) => {
    let nextList = [...mandiPrefs.favoriteCrops];
    if (nextList.includes(crop)) {
      if (nextList.length > 1) nextList = nextList.filter((c) => c !== crop);
    } else {
      nextList.push(crop);
    }
    const updated = { ...mandiPrefs, favoriteCrops: nextList };
    setMandiPrefs(updated);
    saveMandiPreferences(updated);
  };

  const handleMandiPrefsChange = (partial: Partial<MandiPreferences>) => {
    const updated = { ...mandiPrefs, ...partial };
    setMandiPrefs(updated);
    saveMandiPreferences(updated);
    showToast(isHi ? 'मंडी सेटिंग्स अपडेट हुईं' : 'Mandi settings updated');
  };

  // Physical Backup
  const handleBackupDownload = () => {
    downloadPhysicalBackup();
    recordBackupTimestamp();
    setLastBackupTime(Date.now());
    showToast(isHi ? 'बैकअप फाइल सुरक्षित डाउनलोड हो गई!' : 'Backup file downloaded safely!');
  };

  // Restore from File
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') {
          let count = 0;
          for (const key of Object.keys(parsed)) {
            if (key.startsWith('kisan-') || key.startsWith('sk-') || key.startsWith('sk_')) {
              const val = typeof parsed[key] === 'string' ? parsed[key] : JSON.stringify(parsed[key]);
              localStorage.setItem(key, val);
              count++;
            }
          }
          showToast(isHi ? `डेटा सफलतापूर्वक रिस्टोर हो गया (${count} keys)! पेज रीलोड हो रहा है...` : `Data restored successfully! Reloading...`);
          setTimeout(() => window.location.reload(), 1200);
        }
      } catch (err) {
        alert(isHi ? 'बैकअप फाइल अमान्य या दूषित है।' : 'Invalid or corrupt backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Excel / CSV Export
  const handleExportExcel = () => {
    exportToExcel({
      lang,
      records,
      khets,
      khetCrops,
    });
    showToast(isHi ? 'Excel (.xlsx) फाइल डाउनलोड हो गई!' : 'Excel file downloaded!');
  };

  const handleExportCsv = () => {
    exportToCsv({
      lang,
      records,
      khets,
      khetCrops,
    });
    showToast(isHi ? 'CSV फाइल डाउनलोड हो गई!' : 'CSV file downloaded!');
  };

  // Full Data Reset Execution
  const handleConfirmReset = () => {
    try {
      // Clear farm data keys while preserving essential security/profile
      const keysToClear = [
        'kisan-mitra-records-v1',
        'kisan-mitra-khets-v1',
        'kisan-mitra-khet-crops-v1',
        'kisan-mitra-partners-v1',
        'kisan-mitra-partner-cash-v1',
        'kisan-mitra-stocks-v1',
        'sk-farms-v2',
        'sk-records-v2',
        'sk-crops-v2',
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
      showToast(isHi ? 'डेटा रीसेट हो गया! ऐप रीलोड हो रहा है...' : 'Data reset! Reloading app...');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      window.location.reload();
    }
  };

  const formattedLastBackup = lastBackupTime
    ? new Date(lastBackupTime).toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : isHi
    ? 'अभी तक कोई बैकअप नहीं लिया गया'
    : 'No backup taken yet';

  return (
    <div className="w-full max-w-[1000px] mx-auto px-3 sm:px-5 lg:px-6 pb-32 sm:pb-20 space-y-4 pt-2">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-xl shadow-black/60 flex items-center gap-2 border border-emerald-400/30 animate-in fade-in slide-in-from-top-2">
          <Check size={14} className="stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#1a3525]">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Settings size={20} className="text-emerald-400" />
            <span>{isHi ? 'सेटिंग्स व किसान प्रोफाइल' : 'Settings & Farmer Profile'}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isHi
              ? 'किसान की जानकारी, सुरक्षा लॉक, बैकअप, स्थानीय माप व रिमाइंडर'
              : 'Profile, App Security, Local Measures, Backup & Reminders'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleBackupDownload}
            className="h-8 px-2.5 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#152e20] text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title={isHi ? 'तुरंत बैकअप लें' : 'Quick Backup'}
          >
            <Download size={13} />
            <span>{isHi ? 'सुरक्षित बैकअप' : 'Quick Backup'}</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1. किसान की जानकारी (FARMER PROFILE CARD) */}
      {/* ==================================================== */}
      <div className="rounded-2xl border border-[#1e3c2c] bg-[#0c1a13] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <User size={26} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {profile.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  {isHi ? 'प्रमाणित किसान' : 'Farmer'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>📱 {profile.phone}</span>
                <span className="text-slate-600">•</span>
                <span>🏡 {profile.village}, तहसील {profile.tehsil}</span>
                <span className="text-slate-600">•</span>
                <span>जिला {profile.district} ({profile.state || 'मध्य प्रदेश'})</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEditProfileModal(true)}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950 active:scale-95 shrink-0"
          >
            <User size={14} />
            <span>{isHi ? 'प्रोफाइल एडिट करें' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1.5. ऐप इंस्टॉलेशन (PWA APP INSTALLATION CARD) */}
      {/* ==================================================== */}
      <PWAInstallButton lang={lang} variant="card" />

      {/* ==================================================== */}
      {/* 2. ऐप लॉक और सुरक्षा (APP LOCK & PIN SECURITY CARD) */}
      {/* ==================================================== */}
      <div className="rounded-2xl border border-[#1e3c2c] bg-[#0c1a13] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#1a3525] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isHi ? 'ऐप लॉक और सुरक्षा' : 'App Lock & Security'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'अपने खेती के हिसाब को सुरक्षित रखें' : 'Keep your farm ledger protected with PIN'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleAppLock}
            className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
              securitySettings.isLockEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
            title="App Lock Toggle"
          >
            <div className="w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* PIN Info & Change PIN */}
          <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">
                {isHi ? 'सुरक्षा PIN' : 'Security PIN'}
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {securitySettings.isLockEnabled ? '•••• (सक्रिय)' : '•••• (निष्क्रिय)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowChangePinModal(true)}
              className="px-2.5 py-1.5 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#152e20] text-emerald-300 font-semibold transition cursor-pointer text-[11px] flex items-center gap-1 active:scale-95"
            >
              <KeyRound size={12} />
              <span>{isHi ? 'PIN बदलें' : 'Change PIN'}</span>
            </button>
          </div>

          {/* Biometric Unlock */}
          <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1">
                <Fingerprint size={12} className="text-emerald-400" />
                <span>{isHi ? 'बायोमेट्रिक अनलॉक' : 'Biometric'}</span>
              </span>
              <span className="text-[11px] text-slate-300 mt-0.5 block">
                {securitySettings.biometricEnabled
                  ? isHi ? 'चालू (फिंगरप्रिंट)' : 'Enabled'
                  : isHi ? 'डिवाइस सपोर्ट होने पर' : 'Available'}
              </span>
            </div>
            <button
              type="button"
              disabled={!securitySettings.isLockEnabled}
              onClick={handleToggleBiometric}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                !securitySettings.isLockEnabled
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : securitySettings.biometricEnabled
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                  : 'border-[#1e3c2c] bg-[#0c1a13] text-slate-300 hover:bg-[#152e20]'
              }`}
            >
              {securitySettings.biometricEnabled ? (isHi ? 'चालू' : 'ON') : (isHi ? 'बंद' : 'OFF')}
            </button>
          </div>

          {/* Auto Lock Duration */}
          <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1">
                <Clock size={12} className="text-emerald-400" />
                <span>{isHi ? 'ऑटो लॉक' : 'Auto Lock'}</span>
              </span>
              <span className="text-[11px] text-slate-300 mt-0.5 block">
                {isHi ? 'निष्क्रिय रहने पर लॉक' : 'When inactive'}
              </span>
            </div>
            <select
              disabled={!securitySettings.isLockEnabled}
              value={securitySettings.autoLockMinutes}
              onChange={(e) => handleAutoLockChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] px-2 text-[11px] text-emerald-300 outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-40"
            >
              <option value={0}>{isHi ? 'तुरंत' : 'Immediately'}</option>
              <option value={1}>{isHi ? '1 मिनट' : '1 Minute'}</option>
              <option value={5}>{isHi ? '5 मिनट' : '5 Minutes'}</option>
              <option value={15}>{isHi ? '15 मिनट' : '15 Minutes'}</option>
              <option value={-1}>{isHi ? 'कभी नहीं' : 'Never'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. ऐप की सेटिंग्स (APP PREFERENCES CARD) */}
      {/* ==================================================== */}
      <div className="rounded-2xl border border-[#1e3c2c] bg-[#0c1a13] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="border-b border-[#1a3525] pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-400" />
            <span>{isHi ? 'ऐप की सेटिंग्स' : 'App Settings'}</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            {isHi ? 'भाषा, थीम मोड, टेक्स्ट साइज और तारीख का प्रारूप' : 'Language, theme mode, text sizing and date style'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Language */}
          <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-2">
            <span className="text-[11px] text-slate-400 font-semibold block">
              {isHi ? 'भाषा (Language)' : 'Language'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => lang !== 'hi' && onToggleLang()}
                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer text-center ${
                  lang === 'hi'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#0c1a13] border border-[#1e3c2c] text-slate-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => lang !== 'en' && onToggleLang()}
                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer text-center ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#0c1a13] border border-[#1e3c2c] text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* 2. Theme Mode */}
          <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-2">
            <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1">
              <Moon size={12} className="text-emerald-400" />
              <span>{isHi ? 'थीम मोड' : 'Theme Mode'}</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer text-center ${
                  appPrefs.theme === 'dark' || appPrefs.theme === 'forest'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#0c1a13] border border-[#1e3c2c] text-slate-300 hover:text-white'
                }`}
              >
                {isHi ? 'गहरा हरा (Dark)' : 'Dark'}
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer text-center ${
                  appPrefs.theme === 'light'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#0c1a13] border border-[#1e3c2c] text-slate-300 hover:text-white'
                }`}
              >
                {isHi ? 'हल्का (Light)' : 'Light'}
              </button>
            </div>
          </div>

          {/* 3. Text Size */}
          <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-2">
            <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1">
              <Type size={12} className="text-emerald-400" />
              <span>{isHi ? 'टेक्स्ट का आकार' : 'Text Size'}</span>
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['normal', 'large', 'huge'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleTextSizeChange(size)}
                  className={`py-1.5 px-1 rounded-lg text-center font-bold text-[11px] transition cursor-pointer ${
                    appPrefs.textSize === size
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-[#0c1a13] border border-[#1e3c2c] text-slate-300 hover:text-white'
                  }`}
                >
                  {size === 'normal'
                    ? isHi ? 'सामान्य' : 'Normal'
                    : size === 'large'
                    ? isHi ? 'बड़ा' : 'Large'
                    : isHi ? 'विशाल' : 'Huge'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Date Format */}
          <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-2">
            <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1">
              <Calendar size={12} className="text-emerald-400" />
              <span>{isHi ? 'तारीख का प्रारूप' : 'Date Format'}</span>
            </span>
            <select
              value={appPrefs.dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value as any)}
              className="w-full h-8 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] px-2 text-[11px] text-emerald-300 outline-none focus:border-emerald-500 cursor-pointer font-mono"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (13/10/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-10-13)</option>
              <option value="DD-MMM-YYYY">DD-MMM-YYYY (13-Oct-2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. डेटा और बैकअप (DATA & BACKUP CARD) */}
      {/* ==================================================== */}
      <div className="rounded-2xl border border-[#1e3c2c] bg-[#0c1a13] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a3525] pb-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Database size={16} className="text-emerald-400" />
              <span>{isHi ? 'डेटा और बैकअप' : 'Data & Backup'}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {isHi
                ? 'सुरक्षित बैकअप, डेटा रिस्टोर, Excel/CSV एक्सपोर्ट और बैकअप रिकॉर्ड'
                : 'Safe JSON backups, restore, Excel/CSV export and last backup info'}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 bg-[#07130e] px-2.5 py-1 rounded-lg border border-[#1e3c2c] self-start sm:self-auto">
            <span className="text-slate-500">{isHi ? 'आखिरी बैकअप:' : 'Last Backup:'} </span>
            <span className="text-emerald-300 font-semibold">{formattedLastBackup}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Action 1: Download JSON Backup */}
          <div className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Download size={15} className="text-emerald-400" />
                <span>{isHi ? 'सुरक्षित बैकअप डाउनलोड' : 'Download Safe Backup'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {isHi
                  ? 'सभी खेत, खर्च, बिक्री, फसल व बटाईदार का 100% सुरक्षित JSON बैकअप।'
                  : 'Download complete farm data JSON bundle to your phone or PC.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackupDownload}
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950 active:scale-95"
            >
              <Download size={14} />
              <span>{isHi ? 'बैकअप फाइल लें' : 'Get Backup File'}</span>
            </button>
          </div>

          {/* Action 2: Restore Data */}
          <div className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Upload size={15} className="text-emerald-400" />
                <span>{isHi ? 'डेटा रिस्टोर करें' : 'Restore from Backup'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {isHi
                  ? 'पहले से ली गई बैकअप JSON फाइल चुनकर अपने खाते को तुरंत पुनर्स्थापित करें।'
                  : 'Select previously downloaded JSON backup file to restore records.'}
              </p>
            </div>
            <label className="h-9 px-3 rounded-xl border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#152e20] text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <Upload size={14} />
              <span>{isHi ? 'बैकअप फाइल चुनें' : 'Choose Backup'}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>

          {/* Action 3: Excel & CSV Export */}
          <div className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <FileSpreadsheet size={15} className="text-emerald-400" />
                <span>{isHi ? 'Excel / CSV एक्सपोर्ट' : 'Excel / CSV Export'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {isHi
                  ? 'बहीखाते का संपूर्ण विवरण शीट व सारांश के साथ Excel या CSV में लें।'
                  : 'Export all records with formatted totals in Excel (.xlsx) and CSV.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="h-9 px-2.5 rounded-xl border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#152e20] text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <span>Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="h-9 px-2.5 rounded-xl border border-[#1e3c2c] bg-[#0c1a13] hover:bg-[#152e20] text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. खेती और हिसाब (FARMING & ACCOUNTING PREFERENCES) */}
      {/* ==================================================== */}
      <div className="rounded-2xl border border-[#1e3c2c] bg-[#0c1a13] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="border-b border-[#1a3525] pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Wheat size={16} className="text-emerald-400" />
            <span>{isHi ? 'खेती और हिसाब की सेटिंग्स' : 'Farming & Accounting Preferences'}</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            {isHi
              ? 'बीघा/एकड़, किलो/क्विंटल, स्थानीय बीघा का माप, डिफॉल्ट सीजन व बटाई अनुपात'
              : 'Units, local bigha conversions, default season and partnership ratios'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {/* 1. Local Bigha Measure Selection */}
          <div className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-2 sm:col-span-2">
            <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1">
              <Compass size={13} className="text-amber-400" />
              <span>{isHi ? 'स्थानीय बीघा का माप (क्षेत्र अनुसार)' : 'Local Bigha Measurement (Regional)'}</span>
            </span>
            <p className="text-[11px] text-slate-300">
              {isHi
                ? `वर्तमान में सेट: 1 एकड़ = ${landSettings.bighaPerAcre} बीघा (${landSettings.regionNameHi})`
                : `Currently set: 1 Acre = ${landSettings.bighaPerAcre} Bigha (${landSettings.regionNameEn})`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {REGION_PRESETS.map((preset) => {
                const isSelected = landSettings.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleBighaMeasureChange(preset.id)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-sm'
                        : 'border-[#1e3c2c] bg-[#0c1a13] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-300">{preset.nameHi}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{preset.descriptionHi}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom local measure input */}
            <div className="mt-2 pt-2 border-t border-[#1a3525] flex items-center gap-2">
              <span className="text-[11px] text-slate-400 shrink-0">
                {isHi ? 'या अपना कस्टम बीघा माप लिखें (1 एकड़ =):' : 'Or Custom (1 Acre =):'}
              </span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={landSettings.bighaPerAcre}
                onChange={(e) => handleCustomBighaPerAcre(parseFloat(e.target.value))}
                className="w-20 h-7 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] px-2 text-center text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[11px] text-slate-300">{isHi ? 'बीघा' : 'Bigha'}</span>
            </div>
          </div>

          {/* 2. Units, Season & Batai */}
          <div className="space-y-3">
            {/* Default Area Unit */}
            <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">
                {isHi ? 'डिफॉल्ट रकबा इकाई' : 'Default Area Unit'}
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['बीघा', 'एकड़', 'हेक्टेयर'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => handleFarmingPrefsChange({ defaultAreaUnit: unit })}
                    className={`py-1.5 px-1 rounded-lg text-center font-bold text-[11px] transition cursor-pointer ${
                      farmingPrefs.defaultAreaUnit === unit
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#0c1a13] border border-[#1e3c2c] text-slate-300 hover:text-white'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Season */}
            <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">
                {isHi ? 'डिफॉल्ट सीजन' : 'Default Season'}
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['रबी', 'खरीफ', 'जायद'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleFarmingPrefsChange({ defaultSeason: s })}
                    className={`py-1.5 px-1 rounded-lg text-center font-bold text-[11px] transition cursor-pointer ${
                      farmingPrefs.defaultSeason === s
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#0c1a13] border border-[#1e3c2c] text-slate-300 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Batai Ratio */}
            <div className="p-3 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">
                {isHi ? 'डिफॉल्ट बटाई अनुपात' : 'Default Batai Ratio'}
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[50, 60, 40].map((share) => (
                  <button
                    key={share}
                    type="button"
                    onClick={() => handleFarmingPrefsChange({ defaultBataiShare: share })}
                    className={`py-1.5 px-1 rounded-lg text-center font-bold text-[11px] transition cursor-pointer ${
                      farmingPrefs.defaultBataiShare === share
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#0c1a13] border border-[#1e3c2c] text-slate-300 hover:text-white'
                    }`}
                  >
                    {share === 50 ? (isHi ? '50-50 (आधा)' : '50-50') : `${share}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. मंडी भाव और रिमाइंडर (MANDI & REMINDERS CARD) */}
      {/* ==================================================== */}
      <div className="rounded-2xl border border-[#1e3c2c] bg-[#0c1a13] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="border-b border-[#1a3525] pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span>{isHi ? 'मंडी भाव और रिमाइंडर' : 'Mandi Rates & Reminders'}</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            {isHi
              ? 'पसंदीदा फसलें, मुख्य मंडी चयन, भाव अपडेट, बकाया भुगतान व स्टॉक रिमाइंडर'
              : 'Favorite crops, mandi selection, payment alerts and stock reminders'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* 1. Favorite Crops Selection */}
          <div className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-2.5">
            <span className="text-[11px] text-slate-400 font-semibold block">
              {isHi ? 'पसंदीदा फसलें (दैनिक भाव देखने के लिए):' : 'Favorite Crops (For daily rates):'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'Wheat', nameHi: '🌾 गेहूं' },
                { id: 'Soybean', nameHi: '🌱 सोयाबीन' },
                { id: 'Gram', nameHi: '🌿 चना' },
                { id: 'Mustard', nameHi: '🌼 सरसों' },
                { id: 'Garlic', nameHi: '🧄 लहसुन' },
                { id: 'Onion', nameHi: '🧅 प्याज' },
                { id: 'Maize', nameHi: '🌽 मक्का' },
                { id: 'Cotton', nameHi: '☁️ कपास' },
              ].map((c) => {
                const isFav = mandiPrefs.favoriteCrops.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleToggleCropFavorite(c.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      isFav
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-[#0c1a13] text-slate-400 border-[#1e3c2c] hover:text-white'
                    }`}
                  >
                    {c.nameHi}
                  </button>
                );
              })}
            </div>

            {/* Default Mandi selection */}
            <div className="pt-2 border-t border-[#1a3525]">
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                {isHi ? 'मुख्य मंडी चयन:' : 'Default Mandi Selection:'}
              </label>
              <select
                value={mandiPrefs.defaultMandi}
                onChange={(e) => handleMandiPrefsChange({ defaultMandi: e.target.value })}
                className="w-full h-8 rounded-lg border border-[#1e3c2c] bg-[#0c1a13] px-2 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="इन्दौर (Indore Mandi)">इन्दौर (Indore Mandi)</option>
                <option value="उज्जैन (Ujjain Mandi)">उज्जैन (Ujjain Mandi)</option>
                <option value="देवास (Dewas Mandi)">देवास (Dewas Mandi)</option>
                <option value="नीमच (Neemuch Mandi)">नीमच (Neemuch Mandi)</option>
                <option value="मंदसौर (Mandsaur Mandi)">मंदसौर (Mandsaur Mandi)</option>
                <option value="कोटा (Kota Mandi)">कोटा (Kota Mandi)</option>
                <option value="सीहोर (Sehore Mandi)">सीहोर (Sehore Mandi)</option>
              </select>
            </div>
          </div>

          {/* 2. Real Supported Alerts Toggles */}
          <div className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] space-y-3">
            <span className="text-[11px] text-slate-400 font-semibold block">
              {isHi ? 'ऐप सूचनाएं और अलर्ट्स:' : 'Supported Alerts & Reminders:'}
            </span>

            {/* Alert 1: Daily Rates */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1a3525]">
              <div>
                <span className="text-white font-semibold text-xs block">
                  {isHi ? 'दैनिक भाव अपडेट पट्टी' : 'Daily Rates Strip'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isHi ? 'हेडर के नीचे ताज़ा मंडी भाव पट्टी दिखाएं' : 'Show live rates ticker below header'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleMandiPrefsChange({ dailyRateUpdates: !mandiPrefs.dailyRateUpdates })}
                className={`w-10 h-5.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  mandiPrefs.dailyRateUpdates ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Alert 2: Pending Payment Reminder */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1a3525]">
              <div>
                <span className="text-white font-semibold text-xs block">
                  {isHi ? 'बकाया भुगतान रिमाइंडर' : 'Pending Payment Reminder'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isHi ? 'व्यापारियों से बकाया रकम का चेतावनी कार्ड' : 'Alert for unpaid harvest sale balances'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleMandiPrefsChange({ pendingPaymentAlerts: !mandiPrefs.pendingPaymentAlerts })}
                className={`w-10 h-5.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  mandiPrefs.pendingPaymentAlerts ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Alert 3: Low Stock Reminder */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold text-xs block">
                  {isHi ? 'स्टॉक रिमाइंडर' : 'Stock Reminder'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isHi ? 'घर में बचे अनाज की मात्रा व बिक्री सलाह' : 'Alert when harvest stock needs sale'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleMandiPrefsChange({ lowStockReminder: !mandiPrefs.lowStockReminder })}
                className={`w-10 h-5.5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  mandiPrefs.lowStockReminder ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 6. सहायता और सुरक्षा (HELP, PRIVACY, VERSION & RESET) */}
      {/* ==================================================== */}
      <div className="rounded-2xl border border-[#1e3c2c] bg-[#0c1a13] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="border-b border-[#1a3525] pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle size={16} className="text-emerald-400" />
            <span>{isHi ? 'सहायता और सुरक्षा' : 'Help & Safety'}</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            {isHi
              ? 'ऐप चलाना सीखें, समस्या रिपोर्ट करें, गोपनीयता, ऐप वर्जन व डेटा रीसेट'
              : 'How to use guide, report issues, privacy policy and reset options'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. How to use */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] hover:bg-[#152e20] text-left transition cursor-pointer flex flex-col justify-between gap-2 shadow-sm"
          >
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <HelpCircle size={15} />
              <span>{isHi ? 'कैसे चलाएँ (मार्गदर्शन)' : 'How to Use Guide'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isHi ? 'खर्च, बिक्री, बटाई व स्टॉक लिखने के आसान 5 चरण सीखें।' : 'Step-by-step 5 simple guide on tracking expenses, sales and batai.'}
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>{isHi ? 'गाइड देखें' : 'View Guide'}</span>
              <ChevronRight size={12} />
            </span>
          </button>

          {/* 2. Report Issue / Feedback */}
          <a
            href="https://wa.me/919826012345?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87%2C%20%E0%A4%AE%E0%A5%81%E0%A4%9D%E0%A5%87%20%E0%A4%95%E0%A4%BF%E0%A4%B8%E0%A4%BE%E0%A4%A8%20%E0%A4%B8%E0%A4%BE%E0%A4%A5%E0%A5%80%20%E0%A4%90%E0%A4%AA%20%E0%A4%AE%E0%A5%87%E0%A4%82%20%E0%A4%B8%E0%A4%B9%E0%A4%BE%E0%A4%AF%E0%A4%A4%E0%A4%BE%20%E0%A4%9A%E0%A4%BE%E0%A4%B9%E0%A4%BF%E0%A4%8F%E0%A5%A4"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] hover:bg-[#152e20] text-left transition cursor-pointer flex flex-col justify-between gap-2 shadow-sm"
          >
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <MessageSquare size={15} />
              <span>{isHi ? 'समस्या रिपोर्ट करें' : 'Report an Issue'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isHi ? 'कोई परेशानी या नया सुझाव हो तो सीधे WhatsApp पर बताएं।' : 'Get instant help or send your suggestion via WhatsApp.'}
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>{isHi ? 'मदद लें' : 'Contact Support'}</span>
              <ExternalLink size={11} />
            </span>
          </a>

          {/* 3. Privacy & App Version */}
          <div className="p-3.5 rounded-xl bg-[#07130e] border border-[#1e3c2c] flex flex-col justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>{isHi ? '100% डेटा गोपनीयता' : '100% Privacy Safe'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {isHi ? 'आपका पूरा हिसाब सिर्फ आपके फोन में सुरक्षित है। कोई बाहरी सर्वर नहीं।' : 'All accounts stay 100% safe inside your device.'}
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              <span>{isHi ? 'ऐप संस्करण:' : 'Version:'} </span>
              <span className="text-emerald-400 font-semibold">v2.6.0 Pro (लेटेस्ट)</span>
            </div>
          </div>

          {/* 4. Safe Reset Data Card */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex flex-col justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-red-300 font-bold">
                <AlertTriangle size={15} className="text-red-400" />
                <span>{isHi ? 'डेटा रीसेट करें' : 'Reset All Data'}</span>
              </div>
              <p className="text-[11px] text-red-200/70 mt-1 leading-relaxed">
                {isHi ? 'दोहरी पुष्टि व स्पष्ट चेतावनी के साथ पूरा डेटा रीसेट करें।' : 'Erase all records with mandatory 2-step confirmation.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="h-8 px-3 rounded-xl bg-red-600/30 border border-red-500/50 hover:bg-red-600/50 text-red-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <span>{isHi ? 'डेटा रीसेट' : 'Reset Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        profile={profile}
        onSave={handleProfileSave}
        lang={lang}
      />

      <ChangePinModal
        isOpen={showChangePinModal}
        onClose={() => setShowChangePinModal(false)}
        currentPin={securitySettings.pin}
        onPinChanged={handlePinChanged}
        lang={lang}
      />

      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirmReset={handleConfirmReset}
        lang={lang}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        lang={lang}
      />
    </div>
  );
}
