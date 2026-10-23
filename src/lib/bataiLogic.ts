import { FarmRecord, Partner, PartnerCashEntry, Lang } from './types';
import { getRecordAmount, normalizeToQuintals } from './farmAccounting';

export interface BataiSettlementResult {
  partnerId: string;
  partnerName: string;
  relationship: string;
  partnerSharePercent: number;
  mySharePercent: number;
  costSharePercent: number;
  myCostSharePercent: number;
  totalExpense: number;
  myExpensePaid: number;
  partnerExpensePaid: number;
  sharedExpensePaid: number;
  partnerCostShare: number;
  totalSales: number;
  mySalesReceived: number;
  partnerSalesReceived: number;
  partnerSalesShare: number;
  totalYieldQuintal: number;
  myYieldShareQuintal: number;
  partnerYieldShareQuintal: number;
  directCashGave: number;
  directCashReceived: number;
  netCashAdvanceBalance: number;
  partnerOwesMeTotal: number;
  iOwePartnerTotal: number;
  netBalance: number;
  settlementStatus: 'partner_owes_me' | 'i_owe_partner' | 'settled';
  relevantRecords: FarmRecord[];
}

export function getRelationshipLabel(relationship?: string, lang: Lang = 'hi'): string {
  const isHi = lang === 'hi';
  switch (relationship) {
    case 'batai_50_50':
      return isHi ? 'अधिया बटाई (50-50)' : '50-50 Batai';
    case 'batai_third':
      return isHi ? 'तिहाई बटाई (1/3)' : '1/3rd Batai';
    case 'batai_quarter':
      return isHi ? 'चौथाई बटाई (1/4)' : '1/4th Batai';
    case 'batai_custom':
      return isHi ? 'कस्टम साझेदारी' : 'Custom Share';
    case 'lease_theka':
      return isHi ? 'ठेका / लीज' : 'Fixed Lease';
    default:
      return isHi ? 'साझेदारी' : 'Partnership';
  }
}

export function calculateBataiSettlement(
  partner: Partner | null,
  farmRecords: FarmRecord[],
  partnerCash: PartnerCashEntry[]
): BataiSettlementResult {
  if (!partner) {
    return {
      partnerId: '',
      partnerName: 'अज्ञात साझीदार',
      relationship: 'batai_50_50',
      partnerSharePercent: 50,
      mySharePercent: 50,
      costSharePercent: 50,
      myCostSharePercent: 50,
      totalExpense: 0,
      myExpensePaid: 0,
      partnerExpensePaid: 0,
      sharedExpensePaid: 0,
      partnerCostShare: 0,
      totalSales: 0,
      mySalesReceived: 0,
      partnerSalesReceived: 0,
      partnerSalesShare: 0,
      totalYieldQuintal: 0,
      myYieldShareQuintal: 0,
      partnerYieldShareQuintal: 0,
      directCashGave: 0,
      directCashReceived: 0,
      netCashAdvanceBalance: 0,
      partnerOwesMeTotal: 0,
      iOwePartnerTotal: 0,
      netBalance: 0,
      settlementStatus: 'settled',
      relevantRecords: [],
    };
  }

  const partnerSharePercent = partner.sharePercent || 50;
  const mySharePercent = Math.max(0, 100 - partnerSharePercent);
  const costSharePercent = partnerSharePercent;
  const myCostSharePercent = mySharePercent;

  // Filter linked records: by partnerId or by khetId / khetName
  const relevantRecords = farmRecords.filter((r) => {
    if (r.partnerId && r.partnerId === partner.id) return true;
    if (partner.khetId && r.khetId && r.khetId === partner.khetId) return true;
    if (
      partner.khetName &&
      r.field &&
      r.field.trim().toLowerCase() === partner.khetName.trim().toLowerCase()
    ) {
      if (partner.crop && partner.crop !== 'All' && r.crop) {
        return r.crop.trim().toLowerCase() === partner.crop.trim().toLowerCase();
      }
      return true;
    }
    return false;
  });

  let totalExpense = 0;
  let myExpensePaid = 0;
  let partnerExpensePaid = 0;
  let sharedExpensePaid = 0;

  let totalSales = 0;
  let mySalesReceived = 0;
  let partnerSalesReceived = 0;

  let totalYieldQuintal = 0;

  relevantRecords.forEach((r) => {
    const amt = getRecordAmount(r);

    if (r.type === 'Expense') {
      totalExpense += amt;
      if (r.paidBy === 'partner') {
        partnerExpensePaid += amt;
      } else if (r.paidBy === 'shared') {
        sharedExpensePaid += amt;
      } else {
        myExpensePaid += amt;
      }
    } else if (r.type === 'Sale') {
      const saleGross = amt;
      totalSales += saleGross;
      if (r.saleReceivedBy === 'partner') {
        partnerSalesReceived += saleGross;
      } else if (r.saleReceivedBy === 'shared') {
        mySalesReceived += saleGross * (mySharePercent / 100);
        partnerSalesReceived += saleGross * (partnerSharePercent / 100);
      } else {
        mySalesReceived += saleGross;
      }
    } else if (r.type === 'Yield') {
      const qtl = normalizeToQuintals(Number(r.quantity || 0), r.unit);
      totalYieldQuintal += qtl;
    }
  });

  // Partner cash entries
  const partnerCashEntries = partnerCash.filter((c) => c.partnerId === partner.id);
  let directCashGave = 0;
  let directCashReceived = 0;

  partnerCashEntries.forEach((c) => {
    const amt = Number(c.amount || 0);
    if (c.type === 'gave_to_partner') {
      directCashGave += amt;
    } else {
      directCashReceived += amt;
    }
  });

  const partnerCostShare = Math.round(totalExpense * (costSharePercent / 100));
  const partnerSalesShare = Math.round(totalSales * (partnerSharePercent / 100));

  const partnerOwesMeTotal =
    Math.round(myExpensePaid * (costSharePercent / 100)) +
    Math.round(partnerSalesReceived * (mySharePercent / 100)) +
    directCashGave;

  const iOwePartnerTotal =
    Math.round(mySalesReceived * (partnerSharePercent / 100)) +
    Math.round(partnerExpensePaid * (myCostSharePercent / 100)) +
    directCashReceived;

  const netBalance = partnerOwesMeTotal - iOwePartnerTotal;

  let settlementStatus: 'partner_owes_me' | 'i_owe_partner' | 'settled' = 'settled';
  if (netBalance > 0) settlementStatus = 'partner_owes_me';
  else if (netBalance < 0) settlementStatus = 'i_owe_partner';

  const myYieldShareQuintal = Math.round(totalYieldQuintal * (mySharePercent / 100) * 100) / 100;
  const partnerYieldShareQuintal =
    Math.round(totalYieldQuintal * (partnerSharePercent / 100) * 100) / 100;

  return {
    partnerId: partner.id,
    partnerName: partner.name,
    relationship: partner.relationship,
    partnerSharePercent,
    mySharePercent,
    costSharePercent,
    myCostSharePercent,
    totalExpense,
    myExpensePaid,
    partnerExpensePaid,
    sharedExpensePaid,
    partnerCostShare,
    totalSales,
    mySalesReceived,
    partnerSalesReceived,
    partnerSalesShare,
    totalYieldQuintal: Math.round(totalYieldQuintal * 100) / 100,
    myYieldShareQuintal,
    partnerYieldShareQuintal,
    directCashGave,
    directCashReceived,
    netCashAdvanceBalance: directCashGave - directCashReceived,
    partnerOwesMeTotal,
    iOwePartnerTotal,
    netBalance,
    settlementStatus,
    relevantRecords,
  };
}
