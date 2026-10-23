export type Lang = 'hi' | 'en';

export const SOIL_TYPES = [
  'काली मिट्टी (Black Cotton Soil)',
  'दोमट मिट्टी (Loamy Soil)',
  'बलुई / रेतीली (Sandy Loam)',
  'लाल मिट्टी (Red Soil)',
  'पीली मिट्टी (Yellow Soil)',
  'चिकनी मिट्टी (Clay Soil)',
  'अन्य मिट्टी (Other)',
] as const;

export const IRRIGATION_SOURCES = [
  'नलकूप / बोरवेल (Tube Well / Borewell)',
  'नहर (Canal Irrigation)',
  'कुआं (Open Well)',
  'वर्षा आधारित (Rainfed / Barani)',
  'ड्रिप / स्प्रिंकलर (Drip / Sprinkler)',
  'तालाब / नदी (Pond / River)',
  'अन्य साधन (Other)',
] as const;

export interface Khet {
  id: string; // unique khetId
  name: string; // खेत का नाम (e.g. "खेत 1 (नहर वाला)")
  totalArea: number; // कुल रकबा
  area: number; // alias for totalArea for backward compatibility
  areaUnit: string; // 'बीघा' | 'एकड़' | 'हेक्टेयर'
  soilType?: string; // मिट्टी की किस्म
  irrigationSource?: string; // सिंचाई का साधन
  notes?: string;
  crops?: KhetCrop[]; // एक खेत में 1, 2, 3 या अधिक फसलें

  // Backward-compatibility optional fields
  crop?: string;
  sowingDate?: string;
  expectedHarvestDate?: string;
  season?: string;
}

export interface KhetCrop {
  id: string; // cropId (unique ID for this crop planting in this khet)
  khetId: string; // connected to Khet.id
  cropName: string; // e.g. 'Wheat', 'Soybean', 'Gram', 'Mustard', 'Garlic'
  cropNameHi?: string;
  season: string; // e.g. 'Rabi 2026', 'Kharif 2026', 'Zaid 2026'
  sowingDate: string; // बुवाई की तारीख (YYYY-MM-DD)
  harvestDate?: string; // कटाई की तारीख / अनुमानित
  allocatedArea: number; // रकबा (कितने बीघा/एकड़ में बोई गई)
  areaUnit?: string; // e.g. 'बीघा'
  status?: 'sown' | 'growing' | 'harvested'; // स्थिति
  expectedYield?: number; // अनुमानित पैदावार (क्विंटल)
  notes?: string;
}

export interface FarmRecord {
  id: string;
  date: string;
  type: 'Expense' | 'Yield' | 'Sale';
  crop: string;
  khetId?: string; // जुड़ा हुआ खेत ID
  cropId?: string; // जुड़ी हुई फसल ID (KhetCrop.id)
  expenseCategory?: string; // 'बीज' | 'खाद' | 'कीटनाशक' | 'डीजल/ट्रैक्टर' | 'मजदूरी' | 'सिंचाई' | 'बिजली' | 'ढुलाई' | 'अन्य'
  amount: number;
  quantity?: number;
  unit?: string; // 'Quintal' | 'Kg' | 'Ton' | 'बोरी (Bags)' | 'लीटर (Liters)' | 'घंटे (Hours)' | 'दिन (Days)'
  price?: number; // rate per unit
  note?: string;
  field?: string; // Khet name for human display
  area?: number;
  areaUnit?: string;
  worker?: string;
  machine?: string;
  season?: string;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: 'Received' | 'Pending' | 'Partial';
  buyerName?: string;
  ratePerQuintal?: number;
  // बटाई (Partnership) tracking
  partnerId?: string;
  partnerName?: string;
  paidBy?: 'me' | 'partner' | 'shared';
  saleReceivedBy?: 'me' | 'partner' | 'shared';
  partnerSharePercent?: number; // e.g. 50% for 50-50
}

export interface Partner {
  id: string;
  name: string;
  phone?: string;
  relationship: 'batai_50_50' | 'batai_third' | 'batai_quarter' | 'batai_custom' | 'lease_theka'; // अधिया (50-50), तिहाई (1/3), चौथाई (1/4), कस्टम %, ठेका
  sharePercent: number; // default 50%
  costShareType?: 'same_as_share' | 'custom';
  khetId?: string; // जुड़ा हुआ खेत ID
  cropId?: string; // जुड़ी हुई फसल ID
  khetName?: string;
  crop?: string;
  season?: string;
  startDate?: string;
  notes?: string;
}

export interface PartnerCashEntry {
  id: string;
  partnerId: string;
  khetId?: string; // जुड़ा हुआ खेत ID
  cropId?: string; // जुड़ी हुई फसल ID
  date: string;
  type: 'gave_to_partner' | 'received_from_partner'; // दिया (advance/payment) vs लिया
  purpose?: 'advance' | 'settlement' | 'loan';
  amount: number;
  mode?: 'cash' | 'online' | 'bank';
  note?: string;
}

export interface CropStock {
  id: string;
  crop: string;
  khetId?: string; // जुड़ा हुआ खेत ID
  cropId?: string; // जुड़ी हुई फसल ID
  quantity: number; // in Quintal
  unit: string; // Quintal / क्विंटल / Kg
  bagCount?: number; // बोरियां (e.g. 40 कट्टे)
  location?: string; // e.g. "घर का गोदाम", "मंडी वेयरहाउस", "कोल्ड स्टोरेज"
  harvestSeason?: string; // e.g. "Rabi 2026"
  storedDate?: string;
  quality?: 'A-Grade' | 'Standard' | 'Medium';
  notes?: string;
}

export interface MandiPrice {
  id: string;
  commodity: string;
  commodityHi: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string; // e.g. "₹/क्विंटल"
  arrivalDate: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface CropGuide {
  id: string;
  nameHi: string;
  nameEn: string;
  category: 'Rabi' | 'Kharif' | 'Zaid' | 'CashCrop' | 'Horticulture';
  sowingMonths: string;
  harvestMonths: string;
  seedRatePerBigha: string;
  recommendedFertilizers: {
    stage: string;
    items: string;
  }[];
  waterRequirement: string;
  majorPestsAndDiseases: {
    name: string;
    remedy: string;
  }[];
  avgYieldPerBigha: string;
  currentMandiEstimate: string;
}

export interface MandiAlert {
  id: string;
  crop: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  isActive: boolean;
}
