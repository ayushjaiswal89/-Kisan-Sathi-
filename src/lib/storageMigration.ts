/**
 * Storage Migration and Data Safety Utility
 * Ensures existing localStorage keys (including sk-farms-v2 and sk-records-v2)
 * are safely backed up, validated, and migrated without data loss.
 */

import { FarmRecord, Khet, KhetCrop } from './types';
import { INITIAL_KHETS, INITIAL_KHET_CROPS, INITIAL_FARM_RECORDS } from './initialData';

export const STORAGE_KEYS = {
  // Primary Keys
  KHETS_PRIMARY: 'kisan-mitra-khets-v1',
  RECORDS_PRIMARY: 'kisan-mitra-records-v1',
  KHET_CROPS_PRIMARY: 'kisan-mitra-khet-crops-v1',
  PARTNERS_PRIMARY: 'kisan-mitra-partners-v1',
  PARTNER_CASH_PRIMARY: 'kisan-mitra-partner-cash-v1',
  STOCKS_PRIMARY: 'kisan-mitra-stocks-v1',
  LANG: 'kisan-mitra-lang',

  // Legacy Keys (Checked without destructive overwrite)
  LEGACY_FARMS_V2: 'sk-farms-v2',
  LEGACY_RECORDS_V2: 'sk-records-v2',
  LEGACY_CROPS_V2: 'sk-crops-v2',

  // Backup Keys
  BACKUP_LATEST: 'sk_backup_v2_latest',
} as const;

/**
 * Safely parse JSON without throwing or deleting damaged data.
 * Returns null if string is empty or invalid JSON.
 */
export function safeJsonParse<T>(raw: string | null): { success: boolean; data: T | null; isCorrupt: boolean } {
  if (raw === null || raw === undefined || raw.trim() === '') {
    return { success: false, data: null, isCorrupt: false };
  }
  try {
    const parsed = JSON.parse(raw);
    return { success: true, data: parsed, isCorrupt: false };
  } catch (err) {
    console.error('[Storage Safety] Corrupt JSON detected. Preserving raw value without deleting:', err);
    return { success: false, data: null, isCorrupt: true };
  }
}

/**
 * Creates an automatic snapshot backup of all farm keys into localStorage.
 */
export function createLocalStorageBackup(): { timestamp: number; keyCount: number } {
  if (typeof window === 'undefined') return { timestamp: Date.now(), keyCount: 0 };
  try {
    const backupData: Record<string, string | null> = {};
    const relevantKeys = [
      STORAGE_KEYS.KHETS_PRIMARY,
      STORAGE_KEYS.RECORDS_PRIMARY,
      STORAGE_KEYS.KHET_CROPS_PRIMARY,
      STORAGE_KEYS.PARTNERS_PRIMARY,
      STORAGE_KEYS.PARTNER_CASH_PRIMARY,
      STORAGE_KEYS.STOCKS_PRIMARY,
      STORAGE_KEYS.LEGACY_FARMS_V2,
      STORAGE_KEYS.LEGACY_RECORDS_V2,
    ];

    let foundCount = 0;
    relevantKeys.forEach((k) => {
      const val = localStorage.getItem(k);
      if (val !== null) {
        backupData[k] = val;
        foundCount++;
      }
    });

    const backupPayload = JSON.stringify({
      timestamp: Date.now(),
      dateStr: new Date().toISOString(),
      keys: backupData,
    });

    localStorage.setItem(STORAGE_KEYS.BACKUP_LATEST, backupPayload);
    return { timestamp: Date.now(), keyCount: foundCount };
  } catch (e) {
    console.warn('[Storage Safety] Could not create snapshot backup:', e);
    return { timestamp: Date.now(), keyCount: 0 };
  }
}

/**
 * Downloads a complete JSON backup file to user device
 */
export function downloadPhysicalBackup() {
  if (typeof window === 'undefined') return;
  try {
    const exportBundle: Record<string, any> = {
      exportDate: new Date().toISOString(),
      version: '2.0.0',
    };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('kisan-') || k.startsWith('sk-') || k.startsWith('sk_'))) {
        try {
          exportBundle[k] = JSON.parse(localStorage.getItem(k) || 'null');
        } catch {
          exportBundle[k] = localStorage.getItem(k);
        }
      }
    }
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kisan-mitra-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download backup failed:', err);
  }
}

/**
 * Load and migrate Khets safely from primary or legacy keys.
 * Automatically synthesizes KhetCrop entries for multi-crop support.
 */
export function loadAndMigrateKhets(): { khets: Khet[]; khetCrops: KhetCrop[] } {
  if (typeof window === 'undefined') {
    return { khets: INITIAL_KHETS, khetCrops: INITIAL_KHET_CROPS };
  }

  // 1. Snapshot backup before doing anything
  createLocalStorageBackup();

  let rawKhets: Khet[] = [];
  let hasFoundKhets = false;

  // Check primary key
  const primaryResult = safeJsonParse<Khet[]>(localStorage.getItem(STORAGE_KEYS.KHETS_PRIMARY));
  if (primaryResult.success && Array.isArray(primaryResult.data) && primaryResult.data.length > 0) {
    rawKhets = primaryResult.data;
    hasFoundKhets = true;
  } else if (!primaryResult.isCorrupt) {
    // Check legacy key sk-farms-v2
    const legacyResult = safeJsonParse<Khet[]>(localStorage.getItem(STORAGE_KEYS.LEGACY_FARMS_V2));
    if (legacyResult.success && Array.isArray(legacyResult.data) && legacyResult.data.length > 0) {
      rawKhets = legacyResult.data;
      hasFoundKhets = true;
    }
  }

  if (!hasFoundKhets) {
    rawKhets = INITIAL_KHETS;
  }

  // Load existing KhetCrops
  let existingCrops: KhetCrop[] = [];
  const cropsResult = safeJsonParse<KhetCrop[]>(localStorage.getItem(STORAGE_KEYS.KHET_CROPS_PRIMARY));
  if (cropsResult.success && Array.isArray(cropsResult.data) && cropsResult.data.length > 0) {
    existingCrops = cropsResult.data;
  } else if (!cropsResult.isCorrupt) {
    const legacyCrops = safeJsonParse<KhetCrop[]>(localStorage.getItem(STORAGE_KEYS.LEGACY_CROPS_V2));
    if (legacyCrops.success && Array.isArray(legacyCrops.data) && legacyCrops.data.length > 0) {
      existingCrops = legacyCrops.data;
    } else {
      existingCrops = INITIAL_KHET_CROPS;
    }
  }

  // 2. Ensure every Khet has proper structure and at least one KhetCrop
  const migratedCrops: KhetCrop[] = [...existingCrops];
  const migratedKhets: Khet[] = rawKhets.map((khet, idx) => {
    const totalArea = Number(khet.totalArea || khet.area || 1);
    const areaUnit = khet.areaUnit || 'बीघा';
    const khetId = khet.id || `khet-${idx + 1}`;

    // Find crops belonging to this khet
    let cropsForKhet = migratedCrops.filter((c) => c.khetId === khetId);

    // If no crops found for this khet, synthesize one from legacy crop
    if (cropsForKhet.length === 0) {
      const cropName = khet.crop || 'Wheat';
      const syntheticCrop: KhetCrop = {
        id: `crop-${khetId}-1`,
        khetId: khetId,
        cropName: cropName,
        cropNameHi: cropName === 'Wheat' ? 'गेहूं' : cropName === 'Soybean' ? 'सोयाबीन' : cropName,
        season: khet.season || 'Rabi 2026',
        sowingDate: khet.sowingDate || new Date().toISOString().slice(0, 10),
        allocatedArea: totalArea,
        areaUnit: areaUnit,
        status: 'growing',
        expectedYield: totalArea * 10,
        notes: 'स्वतः माइग्रेट की गई फसल',
      };
      migratedCrops.push(syntheticCrop);
      cropsForKhet = [syntheticCrop];
    }

    return {
      ...khet,
      id: khetId,
      name: khet.name || `खेत ${idx + 1}`,
      totalArea: totalArea,
      area: totalArea,
      areaUnit: areaUnit,
      soilType: khet.soilType || 'काली मिट्टी (Black Cotton Soil)',
      irrigationSource: khet.irrigationSource || 'नहर (Canal Irrigation)',
      crops: cropsForKhet,
      crop: khet.crop || cropsForKhet[0]?.cropName || 'Wheat',
      season: khet.season || cropsForKhet[0]?.season || 'Rabi 2026',
      sowingDate: khet.sowingDate || cropsForKhet[0]?.sowingDate,
    };
  });

  return { khets: migratedKhets, khetCrops: migratedCrops };
}

/**
 * Load and migrate FarmRecords safely from primary or legacy keys.
 * Links records to corresponding khetId and cropId based on field name and crop name.
 */
export function loadAndMigrateRecords(
  khets: Khet[],
  khetCrops: KhetCrop[]
): FarmRecord[] {
  if (typeof window === 'undefined') return INITIAL_FARM_RECORDS;

  let rawRecords: FarmRecord[] = [];
  let hasFoundRecords = false;

  const primaryResult = safeJsonParse<FarmRecord[]>(localStorage.getItem(STORAGE_KEYS.RECORDS_PRIMARY));
  if (primaryResult.success && Array.isArray(primaryResult.data) && primaryResult.data.length > 0) {
    rawRecords = primaryResult.data;
    hasFoundRecords = true;
  } else if (!primaryResult.isCorrupt) {
    const legacyResult = safeJsonParse<FarmRecord[]>(localStorage.getItem(STORAGE_KEYS.LEGACY_RECORDS_V2));
    if (legacyResult.success && Array.isArray(legacyResult.data) && legacyResult.data.length > 0) {
      rawRecords = legacyResult.data;
      hasFoundRecords = true;
    }
  }

  if (!hasFoundRecords) {
    rawRecords = INITIAL_FARM_RECORDS;
  }

  // Link records to khetId and cropId if missing, preserving original fields
  const migratedRecords: FarmRecord[] = rawRecords.map((rec) => {
    let khetId = rec.khetId;
    let cropId = rec.cropId;

    // Match khet by name if khetId is missing
    if (!khetId && rec.field) {
      const matchedKhet = khets.find(
        (k) => k.name.trim().toLowerCase() === rec.field!.trim().toLowerCase()
      );
      if (matchedKhet) {
        khetId = matchedKhet.id;
      }
    }

    // Match cropId if missing
    if (!cropId && rec.crop) {
      const candidateCrops = khetCrops.filter(
        (c) =>
          (!khetId || c.khetId === khetId) &&
          c.cropName.trim().toLowerCase() === rec.crop.trim().toLowerCase()
      );
      if (candidateCrops.length > 0) {
        cropId = candidateCrops[0].id;
        if (!khetId) khetId = candidateCrops[0].khetId;
      }
    }

    return {
      ...rec,
      khetId: khetId || rec.khetId,
      cropId: cropId || rec.cropId,
      // Retain backward-compatible fields
      field: rec.field || (khetId ? khets.find((k) => k.id === khetId)?.name : ''),
      crop: rec.crop || 'Wheat',
      amount: Number(rec.amount) || 0,
      paidAmount: rec.paidAmount !== undefined ? Number(rec.paidAmount) : undefined,
      remainingAmount: rec.remainingAmount !== undefined ? Number(rec.remainingAmount) : undefined,
    };
  });

  return migratedRecords;
}

/**
 * Save Khets and KhetCrops to both primary and legacy keys safely.
 */
export function persistKhetsAndCrops(khets: Khet[], khetCrops: KhetCrop[]) {
  if (typeof window === 'undefined') return;
  try {
    const khetsPayload = JSON.stringify(khets);
    const cropsPayload = JSON.stringify(khetCrops);

    localStorage.setItem(STORAGE_KEYS.KHETS_PRIMARY, khetsPayload);
    localStorage.setItem(STORAGE_KEYS.KHET_CROPS_PRIMARY, cropsPayload);

    // Keep legacy key synced for external compatibility
    localStorage.setItem(STORAGE_KEYS.LEGACY_FARMS_V2, khetsPayload);
    localStorage.setItem(STORAGE_KEYS.LEGACY_CROPS_V2, cropsPayload);
  } catch (err) {
    console.error('[Storage Persist] Failed to persist khets:', err);
  }
}

/**
 * Save Records safely to both primary and legacy keys.
 */
export function persistRecords(records: FarmRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(records);
    localStorage.setItem(STORAGE_KEYS.RECORDS_PRIMARY, payload);
    localStorage.setItem(STORAGE_KEYS.LEGACY_RECORDS_V2, payload);
  } catch (err) {
    console.error('[Storage Persist] Failed to persist records:', err);
  }
}
