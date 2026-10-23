/**
 * Farmer Profile, App Preferences, and App Lock Security Engine
 */

export interface FarmerProfile {
  name: string;
  village: string;
  tehsil: string;
  district: string;
  phone: string;
  state?: string;
}

export interface SecuritySettings {
  isLockEnabled: boolean;
  pin: string; // 4-digit PIN
  biometricEnabled: boolean;
  autoLockMinutes: number; // 0 = instantly, 1 = 1m, 5 = 5m, 15 = 15m, -1 = never
  lastActiveTimestamp: number;
}

export interface AppPreferences {
  theme: 'dark' | 'light' | 'forest';
  textSize: 'normal' | 'large' | 'huge';
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';
}

export interface FarmingPreferences {
  defaultAreaUnit: 'बीघा' | 'एकड़' | 'हेक्टेयर';
  defaultWeightUnit: 'क्विंटल' | 'किलो' | 'टन';
  defaultSeason: 'रबी' | 'खरीफ' | 'जायद';
  defaultBataiShare: number; // e.g. 50%
}

export interface MandiPreferences {
  favoriteCrops: string[];
  defaultMandi: string;
  dailyRateUpdates: boolean;
  pendingPaymentAlerts: boolean;
  lowStockReminder: boolean;
}

export const PROFILE_STORAGE_KEY = 'sk-farmer-profile-v1';
export const SECURITY_STORAGE_KEY = 'sk-app-security-v1';
export const PREFERENCES_STORAGE_KEY = 'sk-app-preferences-v1';
export const FARMING_PREFS_STORAGE_KEY = 'sk-farming-prefs-v1';
export const MANDI_PREFS_STORAGE_KEY = 'sk-mandi-prefs-v1';
export const LAST_BACKUP_STORAGE_KEY = 'sk-last-backup-timestamp-v1';

export const DEFAULT_FARMER_PROFILE: FarmerProfile = {
  name: 'रामेश्वर प्रसाद पाटीदार',
  village: 'रामपुरा',
  tehsil: 'सांवेर',
  district: 'इन्दौर',
  phone: '9826012345',
  state: 'मध्य प्रदेश',
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  isLockEnabled: false,
  pin: '1234',
  biometricEnabled: false,
  autoLockMinutes: 1, // 1 minute default
  lastActiveTimestamp: Date.now(),
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  theme: 'dark',
  textSize: 'normal',
  dateFormat: 'DD/MM/YYYY',
};

export const DEFAULT_FARMING_PREFERENCES: FarmingPreferences = {
  defaultAreaUnit: 'बीघा',
  defaultWeightUnit: 'क्विंटल',
  defaultSeason: 'रबी',
  defaultBataiShare: 50,
};

export const DEFAULT_MANDI_PREFERENCES: MandiPreferences = {
  favoriteCrops: ['Wheat', 'Soybean', 'Garlic', 'Gram'],
  defaultMandi: 'इन्दौर (Indore Mandi)',
  dailyRateUpdates: true,
  pendingPaymentAlerts: true,
  lowStockReminder: true,
};

export function getFarmerProfile(): FarmerProfile {
  if (typeof window === 'undefined') return DEFAULT_FARMER_PROFILE;
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.name === 'string') return parsed;
    }
  } catch {}
  return DEFAULT_FARMER_PROFILE;
}

export function saveFarmerProfile(profile: FarmerProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function getSecuritySettings(): SecuritySettings {
  if (typeof window === 'undefined') return DEFAULT_SECURITY_SETTINGS;
  try {
    const saved = localStorage.getItem(SECURITY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.isLockEnabled === 'boolean') {
        return { ...DEFAULT_SECURITY_SETTINGS, ...parsed };
      }
    }
  } catch {}
  return DEFAULT_SECURITY_SETTINGS;
}

export function saveSecuritySettings(settings: SecuritySettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save security settings:', e);
  }
}

export function getAppPreferences(): AppPreferences {
  if (typeof window === 'undefined') return DEFAULT_APP_PREFERENCES;
  try {
    const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.theme) return { ...DEFAULT_APP_PREFERENCES, ...parsed };
    }
  } catch {}
  return DEFAULT_APP_PREFERENCES;
}

export function saveAppPreferences(prefs: AppPreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

export function getFarmingPreferences(): FarmingPreferences {
  if (typeof window === 'undefined') return DEFAULT_FARMING_PREFERENCES;
  try {
    const saved = localStorage.getItem(FARMING_PREFS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.defaultAreaUnit) return { ...DEFAULT_FARMING_PREFERENCES, ...parsed };
    }
  } catch {}
  return DEFAULT_FARMING_PREFERENCES;
}

export function saveFarmingPreferences(prefs: FarmingPreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FARMING_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save farming preferences:', e);
  }
}

export function getMandiPreferences(): MandiPreferences {
  if (typeof window === 'undefined') return DEFAULT_MANDI_PREFERENCES;
  try {
    const saved = localStorage.getItem(MANDI_PREFS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.favoriteCrops)) return { ...DEFAULT_MANDI_PREFERENCES, ...parsed };
    }
  } catch {}
  return DEFAULT_MANDI_PREFERENCES;
}

export function saveMandiPreferences(prefs: MandiPreferences) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MANDI_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save mandi preferences:', e);
  }
}

export function getLastBackupTimestamp(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_BACKUP_STORAGE_KEY);
    if (raw) {
      const num = parseInt(raw, 10);
      if (!isNaN(num)) return num;
    }
  } catch {}
  return null;
}

export function recordBackupTimestamp() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_BACKUP_STORAGE_KEY, String(Date.now()));
  } catch {}
}
