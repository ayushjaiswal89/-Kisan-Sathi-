/**
 * Farm Accounting Engine
 * Implements rigorous calculation rules for crops, fields (khet), and partnerships:
 * - Crop-level cost separation
 * - Total sales vs Payment received
 * - Pending due = Total Sales - Received Payment
 * - Net Profit = Total Sales - Total Expense
 * - Harvested yield vs Sold quantity vs In-hand remaining stock
 * - Batai (Partnership) calculations
 * - Strictly keeps Partner cash entries separate from agricultural input expenses
 */

import { FarmRecord, Khet, KhetCrop } from './types';

/**
 * Normalizes any weight/quantity unit into standard Quintals (1 Quintal = 100 kg)
 */
export function normalizeToQuintals(quantity: number, unit?: string): number {
  const q = Number(quantity) || 0;
  if (!unit) return q;
  const u = unit.trim().toLowerCase();
  if (u === 'kg' || u.includes('किलो')) return q / 100;
  if (u === 'ton' || u.includes('टन')) return q * 10;
  if (u.includes('बोरी') || u.includes('bag')) return q * 0.5;
  return q;
}

/**
 * Safely resolves the financial monetary amount of a FarmRecord
 */
export function getRecordAmount(record: FarmRecord): number {
  if (record.amount !== undefined && record.amount !== null && !isNaN(Number(record.amount)) && Number(record.amount) > 0) {
    return Number(record.amount);
  }
  const qty = Number(record.quantity || 0);
  const price = Number(record.price || 0);
  if (qty > 0 && price > 0) {
    if (record.type === 'Sale') {
      const qtl = normalizeToQuintals(qty, record.unit);
      return Math.round(qtl * price * 100) / 100;
    }
    return Math.round(qty * price * 100) / 100;
  }
  return 0;
}

export interface CropFinancials {
  cropId: string;
  cropName: string;
  allocatedArea: number;
  season: string;
  status: string;

  // Financials
  totalExpense: number; // कुल खर्च
  totalSales: number; // कुल बिक्री
  paymentReceived: number; // प्राप्त भुगतान
  pendingDue: number; // बकाया भुगतान = कुल बिक्री - प्राप्त भुगतान
  netProfit: number; // शुद्ध लाभ = कुल बिक्री - कुल खर्च
  realizedProfit: number; // नकद आधार पर शुद्ध लाभ = प्राप्त भुगतान - कुल खर्च

  // Quantities
  harvestedYieldQuintal: number; // कटाई की कुल उपज
  soldQuantityQuintal: number; // बिकी हुई मात्रा
  remainingStockQuintal: number; // बचा हुआ स्टॉक = उपज - बिक्री

  // Batai (Partnership)
  partnerSharePercent: number;
  partnerCostShare: number;
  partnerSalesShare: number;
  partnerNetProfitShare: number;

  recordsCount: number;
}

export interface KhetFinancials {
  khetId: string;
  khetName: string;
  totalArea: number;
  areaUnit: string;

  // Aggregate financials of all crops in this khet
  totalExpense: number;
  totalSales: number;
  paymentReceived: number;
  pendingDue: number;
  netProfit: number;
  realizedProfit: number;

  // Aggregate quantities
  totalHarvestYieldQuintal: number;
  totalSoldQuantityQuintal: number;
  totalRemainingStockQuintal: number;

  // Crop-by-crop breakdowns
  cropBreakdowns: CropFinancials[];
  cropsCount: number;
  recordsCount: number;
}

/**
 * Filter records matching a specific crop and khet.
 * Checks both ID-based linking and fallback name-based matching for legacy records.
 */
export function getRecordsForCrop(
  records: FarmRecord[],
  crop: KhetCrop,
  khet?: Khet
): FarmRecord[] {
  return records.filter((r) => {
    // 1. Exact cropId match
    if (r.cropId && r.cropId === crop.id) return true;

    // 2. Exact khetId match and crop name match
    if (r.khetId && r.khetId === crop.khetId) {
      if (r.crop && r.crop.trim().toLowerCase() === crop.cropName.trim().toLowerCase()) {
        return true;
      }
    }

    // 3. Fallback name-based matching for legacy records
    if (khet && r.field && r.field.trim().toLowerCase() === khet.name.trim().toLowerCase()) {
      if (r.crop && r.crop.trim().toLowerCase() === crop.cropName.trim().toLowerCase()) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Filter all records belonging to a khet across all its crops.
 */
export function getRecordsForKhet(
  records: FarmRecord[],
  khet: Khet,
  khetCrops: KhetCrop[]
): FarmRecord[] {
  const khetCropIds = new Set(khetCrops.filter((c) => c.khetId === khet.id).map((c) => c.id));
  return records.filter((r) => {
    if (r.khetId && r.khetId === khet.id) return true;
    if (r.cropId && khetCropIds.has(r.cropId)) return true;
    if (r.field && r.field.trim().toLowerCase() === khet.name.trim().toLowerCase()) return true;
    return false;
  });
}

/**
 * Calculate accounting metrics for a single crop planting (KhetCrop).
 */
export function calculateCropFinancials(
  records: FarmRecord[],
  crop: KhetCrop,
  khet?: Khet,
  partnerSharePercent = 50
): CropFinancials {
  const cropRecords = getRecordsForCrop(records, crop, khet);

  let totalExpense = 0;
  let totalSales = 0;
  let paymentReceived = 0;
  let harvestedYieldQuintal = 0;
  let soldQuantityQuintal = 0;

  cropRecords.forEach((r) => {
    const amt = Number(r.amount) || 0;
    const qty = Number(r.quantity) || 0;

    // Convert non-quintal units if needed
    let qtyInQuintal = qty;
    if (r.unit === 'Kg' || r.unit === 'किलो') qtyInQuintal = qty / 100;
    else if (r.unit === 'Ton' || r.unit === 'टन') qtyInQuintal = qty * 10;
    else if (r.unit?.includes('बोरी') || r.unit?.includes('Bags')) qtyInQuintal = qty * 0.5; // ~50kg bag

    if (r.type === 'Expense') {
      totalExpense += amt;
    } else if (r.type === 'Yield') {
      harvestedYieldQuintal += qtyInQuintal;
    } else if (r.type === 'Sale') {
      totalSales += amt;
      soldQuantityQuintal += qtyInQuintal;
      const paid = r.paidAmount !== undefined ? Number(r.paidAmount) : amt;
      paymentReceived += paid;
    }
  });

  const pendingDue = Math.max(0, totalSales - paymentReceived);
  const netProfit = totalSales - totalExpense;
  const realizedProfit = paymentReceived - totalExpense;
  const remainingStockQuintal = Math.max(0, harvestedYieldQuintal - soldQuantityQuintal);

  const pct = Math.max(0, Math.min(100, partnerSharePercent));
  const partnerCostShare = Math.round((totalExpense * pct) / 100);
  const partnerSalesShare = Math.round((totalSales * pct) / 100);
  const partnerNetProfitShare = Math.round((netProfit * pct) / 100);

  return {
    cropId: crop.id,
    cropName: crop.cropName,
    allocatedArea: crop.allocatedArea,
    season: crop.season,
    status: crop.status || 'growing',

    totalExpense: Math.round(totalExpense),
    totalSales: Math.round(totalSales),
    paymentReceived: Math.round(paymentReceived),
    pendingDue: Math.round(pendingDue),
    netProfit: Math.round(netProfit),
    realizedProfit: Math.round(realizedProfit),

    harvestedYieldQuintal: parseFloat(harvestedYieldQuintal.toFixed(2)),
    soldQuantityQuintal: parseFloat(soldQuantityQuintal.toFixed(2)),
    remainingStockQuintal: parseFloat(remainingStockQuintal.toFixed(2)),

    partnerSharePercent: pct,
    partnerCostShare,
    partnerSalesShare,
    partnerNetProfitShare,

    recordsCount: cropRecords.length,
  };
}

/**
 * Calculate aggregate accounting for an entire Khet by summing all its crops.
 */
export function calculateKhetFinancials(
  records: FarmRecord[],
  khet: Khet,
  khetCrops: KhetCrop[],
  partnerSharePercent = 50
): KhetFinancials {
  const cropsForKhet = khetCrops.filter((c) => c.khetId === khet.id);

  // If khet has no separate KhetCrop records yet, handle gracefully with a pseudo crop
  const effectiveCrops =
    cropsForKhet.length > 0
      ? cropsForKhet
      : [
          {
            id: `crop-${khet.id}-auto`,
            khetId: khet.id,
            cropName: khet.crop || 'Wheat',
            season: khet.season || 'Rabi 2026',
            sowingDate: khet.sowingDate || new Date().toISOString().slice(0, 10),
            allocatedArea: khet.totalArea || khet.area || 1,
            areaUnit: khet.areaUnit || 'बीघा',
            status: 'growing' as const,
          },
        ];

  const cropBreakdowns = effectiveCrops.map((c) =>
    calculateCropFinancials(records, c, khet, partnerSharePercent)
  );

  let totalExpense = 0;
  let totalSales = 0;
  let paymentReceived = 0;
  let pendingDue = 0;
  let totalHarvestYieldQuintal = 0;
  let totalSoldQuantityQuintal = 0;

  cropBreakdowns.forEach((cb) => {
    totalExpense += cb.totalExpense;
    totalSales += cb.totalSales;
    paymentReceived += cb.paymentReceived;
    pendingDue += cb.pendingDue;
    totalHarvestYieldQuintal += cb.harvestedYieldQuintal;
    totalSoldQuantityQuintal += cb.soldQuantityQuintal;
  });

  const netProfit = totalSales - totalExpense;
  const realizedProfit = paymentReceived - totalExpense;
  const totalRemainingStockQuintal = Math.max(0, totalHarvestYieldQuintal - totalSoldQuantityQuintal);

  const allKhetRecords = getRecordsForKhet(records, khet, effectiveCrops);

  return {
    khetId: khet.id,
    khetName: khet.name,
    totalArea: khet.totalArea || khet.area || 1,
    areaUnit: khet.areaUnit || 'बीघा',

    totalExpense,
    totalSales,
    paymentReceived,
    pendingDue,
    netProfit,
    realizedProfit,

    totalHarvestYieldQuintal: parseFloat(totalHarvestYieldQuintal.toFixed(2)),
    totalSoldQuantityQuintal: parseFloat(totalSoldQuantityQuintal.toFixed(2)),
    totalRemainingStockQuintal: parseFloat(totalRemainingStockQuintal.toFixed(2)),

    cropBreakdowns,
    cropsCount: effectiveCrops.length,
    recordsCount: allKhetRecords.length,
  };
}
