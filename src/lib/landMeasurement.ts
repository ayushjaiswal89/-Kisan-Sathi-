import { Lang } from './types';

export interface LandUnitSettings {
  presetId: string;
  bighaPerAcre: number;
  biswaPerBigha: number;
  regionNameHi: string;
  regionNameEn: string;
  isCustom: boolean;
}

export const REGION_PRESETS: {
  id: string;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn: string;
  bighaPerAcre: number;
  biswaPerBigha: number;
}[] = [
  {
    id: 'mp_standard',
    nameHi: 'मध्य प्रदेश व राजस्थान (मानक बीघा)',
    nameEn: 'Madhya Pradesh & Rajasthan (Standard)',
    descriptionHi: '1 एकड़ = 2.5 बीघा, 1 बीघा = 20 बिस्वा',
    descriptionEn: '1 Acre = 2.5 Bigha, 1 Bigha = 20 Biswa',
    bighaPerAcre: 2.5,
    biswaPerBigha: 20,
  },
  {
    id: 'western_up_haryana',
    nameHi: 'पश्चिमी उत्तर प्रदेश व हरियाणा (कच्चा बीघा)',
    nameEn: 'Western UP & Haryana (Kaccha Bigha)',
    descriptionHi: '1 एकड़ = 5.0 कच्चा बीघा (1 बीघा ≈ 809 वर्गमीटर)',
    descriptionEn: '1 Acre = 5.0 Kaccha Bigha',
    bighaPerAcre: 5.0,
    biswaPerBigha: 20,
  },
  {
    id: 'eastern_up_bihar',
    nameHi: 'पूर्वी उत्तर प्रदेश व बिहार (पक्का बीघा)',
    nameEn: 'Eastern UP & Bihar (Pucca Bigha)',
    descriptionHi: '1 एकड़ = 1.6 पक्का बीघा (1 बीघा ≈ 2529 वर्गमीटर)',
    descriptionEn: '1 Acre = 1.6 Pucca Bigha',
    bighaPerAcre: 1.6,
    biswaPerBigha: 20,
  },
  {
    id: 'punjab_haryana_standard',
    nameHi: 'पंजाब व उत्तरी हरियाणा (मानक बीघा)',
    nameEn: 'Punjab & Haryana (Standard Bigha)',
    descriptionHi: '1 एकड़ = 4.0 बीघा (या 8 कनाल)',
    descriptionEn: '1 Acre = 4.0 Bigha (or 8 Kanal)',
    bighaPerAcre: 4.0,
    biswaPerBigha: 20,
  },
  {
    id: 'gujarat',
    nameHi: 'गुजरात (वीघा)',
    nameEn: 'Gujarat (Vigha)',
    descriptionHi: '1 एकड़ = 2.5 वीघा (1 वीघा = 16 कट्ठा)',
    descriptionEn: '1 Acre = 2.5 Vigha',
    bighaPerAcre: 2.5,
    biswaPerBigha: 16,
  },
  {
    id: 'maharashtra_south',
    nameHi: 'महाराष्ट्र व दक्षिण (एकड़ / गुंठा)',
    nameEn: 'Maharashtra & South (Acre / Guntha)',
    descriptionHi: '1 एकड़ = 40 गुंठा',
    descriptionEn: '1 Acre = 40 Guntha',
    bighaPerAcre: 1.0,
    biswaPerBigha: 40,
  },
];

export const DEFAULT_LAND_SETTINGS: LandUnitSettings = {
  presetId: 'mp_standard',
  bighaPerAcre: 2.5,
  biswaPerBigha: 20,
  regionNameHi: 'मध्य प्रदेश / राजस्थान (1 एकड़ = 2.5 बीघा)',
  regionNameEn: 'MP / Rajasthan (1 Acre = 2.5 Bigha)',
  isCustom: false,
};

export const LAND_SETTINGS_KEY = 'kisan-mitra-land-settings-v1';
export const LAND_SETTINGS_CHANGED_EVENT = 'kisan-mitra-land-settings-changed';

export function getLandSettings(): LandUnitSettings {
  if (typeof window === 'undefined') return DEFAULT_LAND_SETTINGS;
  try {
    const val = localStorage.getItem(LAND_SETTINGS_KEY);
    if (val) {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed.bighaPerAcre === 'number' && parsed.bighaPerAcre > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_LAND_SETTINGS;
}

export function saveLandSettings(settings: LandUnitSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAND_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(LAND_SETTINGS_CHANGED_EVENT, { detail: settings }));
  } catch (e) {
    // ignore
  }
}

export function toBigha(area: number, unit: string, settings: LandUnitSettings): number {
  if (!area || isNaN(area)) return 0;
  const bighaPerAcre = settings.bighaPerAcre || 2.5;
  if (unit === 'बीघा' || unit === 'Bigha') return area;
  if (unit === 'एकड़' || unit === 'Acre') return area * bighaPerAcre;
  if (unit === 'हेक्टेयर' || unit === 'Hectare') return area * 2.47105 * bighaPerAcre;
  return area;
}

export function toAcre(area: number, unit: string, settings: LandUnitSettings): number {
  if (!area || isNaN(area)) return 0;
  const bighaPerAcre = settings.bighaPerAcre || 2.5;
  if (unit === 'एकड़' || unit === 'Acre') return area;
  if (unit === 'बीघा' || unit === 'Bigha') return area / bighaPerAcre;
  if (unit === 'हेक्टेयर' || unit === 'Hectare') return area * 2.47105;
  return area;
}

export function formatDualArea(
  area: number,
  unit: string,
  settings: LandUnitSettings,
  lang: Lang
): { primary: string; secondary: string; label: string } {
  const isHi = lang === 'hi';
  const cleanArea = Math.round(area * 100) / 100;
  const bighaVal = Math.round(toBigha(area, unit, settings) * 100) / 100;
  const acreVal = Math.round(toAcre(area, unit, settings) * 100) / 100;

  if (unit === 'बीघा' || unit === 'Bigha') {
    const primary = `${cleanArea} ${isHi ? 'बीघा' : 'Bigha'}`;
    const secondary = `≈ ${acreVal} ${isHi ? 'एकड़' : 'Acre'}`;
    return { primary, secondary, label: `${primary} (${secondary})` };
  }
  if (unit === 'एकड़' || unit === 'Acre') {
    const primary = `${cleanArea} ${isHi ? 'एकड़' : 'Acre'}`;
    const secondary = `≈ ${bighaVal} ${isHi ? 'बीघा' : 'Bigha'}`;
    return { primary, secondary, label: `${primary} (${secondary})` };
  }
  const primary = `${cleanArea} ${unit}`;
  const secondary = `≈ ${bighaVal} बीघा / ${acreVal} एकड़`;
  return { primary, secondary, label: `${primary} (${secondary})` };
}

export function calculatePerLandMetrics(
  cost: number,
  sales: number,
  netProfit: number,
  yieldKg: number,
  area: number,
  unit: string,
  settings: LandUnitSettings
) {
  const bighas = toBigha(area, unit, settings);
  const acres = toAcre(area, unit, settings);
  const safeBighas = bighas > 0 ? bighas : 1;
  const safeAcres = acres > 0 ? acres : 1;

  return {
    costPerBigha: Math.round(cost / safeBighas),
    costPerAcre: Math.round(cost / safeAcres),
    salesPerBigha: Math.round(sales / safeBighas),
    salesPerAcre: Math.round(sales / safeAcres),
    realizedProfitPerBigha: Math.round(netProfit / safeBighas),
    realizedProfitPerAcre: Math.round(netProfit / safeAcres),
    yieldKgPerBigha: Math.round(yieldKg / safeBighas),
    yieldKgPerAcre: Math.round(yieldKg / safeAcres),
  };
}
