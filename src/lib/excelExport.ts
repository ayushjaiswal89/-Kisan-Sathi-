import * as XLSX from 'xlsx';
import { FarmRecord, Khet, KhetCrop, Lang } from './types';
import { cropLabel } from './farmI18n';
import { calculateCropFinancials, calculateKhetFinancials } from './farmAccounting';

interface ExportExcelOptions {
  filename?: string;
  lang: Lang;
  records: FarmRecord[];
  khets?: Khet[];
  khetCrops?: KhetCrop[];
  title?: string;
}

/**
 * Resolves human-readable field name for a record
 */
function resolveKhetName(record: FarmRecord, khets: Khet[] = []): string {
  if (record.field && record.field.trim()) return record.field;
  if (record.khetId) {
    const khet = khets.find((k) => k.id === record.khetId);
    if (khet) return khet.name;
  }
  return '-';
}

/**
 * Calculates correct monetary amount for a record
 */
function getRecordAmount(record: FarmRecord): number {
  if (record.type === 'Sale' || record.type === 'Expense') {
    const qty = Number(record.quantity || 0);
    const price = Number(record.price || 0);
    const calculated = qty * price;
    if (calculated > 0) return calculated;
  }
  return Number(record.amount || 0);
}

/**
 * Export a complete multi-sheet Excel (.xlsx) workbook
 */
export function exportToExcel({
  filename,
  lang,
  records,
  khets = [],
  khetCrops = [],
}: ExportExcelOptions) {
  const isHi = lang === 'hi';
  const todayStr = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `kisan-sathi-farm-report-${todayStr}.xlsx`;

  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: ALL TRANSACTIONS (विस्तृत बहीखाता)
  // ==========================================
  const headers = isHi
    ? [
        'क्र.',
        'दिनांक',
        'खेत का नाम',
        'फसल',
        'सीजन',
        'प्रकार',
        'खर्च श्रेणी',
        'विवरण / टिप्पणी',
        'मात्रा',
        'इकाई',
        'दर प्रति इकाई (₹)',
        'कुल रकम (₹)',
        'प्राप्त राशि (₹)',
        'बकाया राशि (₹)',
        'खरीदार / मंडी',
        'श्रमिक / व्यक्ति',
        'मशीनरी',
        'साझेदार / बटाई',
      ]
    : [
        'S.No',
        'Date',
        'Field Name',
        'Crop',
        'Season',
        'Type',
        'Expense Category',
        'Details / Note',
        'Quantity',
        'Unit',
        'Rate (₹)',
        'Total Amount (₹)',
        'Received (₹)',
        'Pending (₹)',
        'Buyer / Mandi',
        'Worker / Person',
        'Machine',
        'Partner / Batai',
      ];

  let totalExp = 0;
  let totalSale = 0;
  let totalRecv = 0;
  let totalPending = 0;

  const rows = records.map((r, idx) => {
    const amt = getRecordAmount(r);
    const isSale = r.type === 'Sale';
    const isExpense = r.type === 'Expense';

    let paid = 0;
    let pending = 0;

    if (isSale) {
      paid = r.paidAmount !== undefined ? Number(r.paidAmount) : amt;
      pending = r.remainingAmount !== undefined ? Number(r.remainingAmount) : Math.max(0, amt - paid);
      totalSale += amt;
      totalRecv += paid;
      totalPending += pending;
    } else if (isExpense) {
      totalExp += amt;
    }

    const typeLabel = isHi
      ? r.type === 'Expense'
        ? 'खर्च'
        : r.type === 'Yield'
        ? 'पैदावार / कटाई'
        : 'फसल बिक्री'
      : r.type;

    const cropNameDisplay = isHi
      ? `${cropLabel('hi', r.crop)}${r.crop ? ` (${r.crop})` : ''}`
      : r.crop;

    return [
      idx + 1,
      r.date || '',
      resolveKhetName(r, khets),
      cropNameDisplay,
      r.season || '',
      typeLabel,
      r.expenseCategory || (isExpense ? 'कृषि खर्च' : ''),
      r.note || '',
      r.quantity !== undefined ? Number(r.quantity) : '',
      r.unit || '',
      r.price !== undefined ? Number(r.price) : '',
      amt,
      isSale ? paid : '',
      isSale ? pending : '',
      r.buyerName || '',
      r.worker || '',
      r.machine || '',
      r.partnerName ? `${r.partnerName} (${r.partnerSharePercent || 50}%)` : '',
    ];
  });

  // Add Summary Total Rows
  const netProfit = totalSale - totalExp;
  const summaryEmpty = new Array(10).fill('');

  const totalRow = [
    '',
    isHi ? '=== कुल योग ===' : '=== TOTALS ===',
    '',
    '',
    '',
    '',
    '',
    isHi ? `कुल रिकॉर्ड: ${records.length}` : `Records: ${records.length}`,
    '',
    '',
    isHi ? 'कुल बिक्री:' : 'Total Sales:',
    totalSale,
    totalRecv,
    totalPending,
    '',
    '',
    '',
    '',
  ];

  const expenseRow = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    isHi ? 'कुल खेती खर्च:' : 'Total Expense:',
    totalExp,
    '',
    '',
    '',
    '',
    '',
    '',
  ];

  const profitRow = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    isHi ? 'शुद्ध लाभ (Net Profit):' : 'Net Profit:',
    netProfit,
    '',
    '',
    '',
    '',
    '',
    '',
  ];

  const allRecordsData = [headers, ...rows, [], totalRow, expenseRow, profitRow];
  const wsRecords = XLSX.utils.aoa_to_sheet(allRecordsData);

  // Set friendly column widths for Sheet 1
  wsRecords['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 12 }, // Date
    { wch: 18 }, // Field
    { wch: 18 }, // Crop
    { wch: 12 }, // Season
    { wch: 14 }, // Type
    { wch: 16 }, // Category
    { wch: 25 }, // Details
    { wch: 10 }, // Quantity
    { wch: 10 }, // Unit
    { wch: 12 }, // Rate
    { wch: 14 }, // Total Amount
    { wch: 14 }, // Received
    { wch: 14 }, // Pending
    { wch: 16 }, // Buyer
    { wch: 16 }, // Worker
    { wch: 14 }, // Machine
    { wch: 16 }, // Partner
  ];

  XLSX.utils.book_append_sheet(wb, wsRecords, isHi ? 'विस्तृत बहीखाता' : 'All Records');

  // ==========================================
  // SHEET 2: KHET & CROP SUMMARY (खेत एवं फसल सारांश)
  // ==========================================
  if (khets.length > 0) {
    const summaryHeaders = isHi
      ? [
          'खेत का नाम',
          'कुल रकबा',
          'फसल का नाम',
          'फसल रकबा',
          'सीजन',
          'स्थिति',
          'कुल उपज (क्विंटल)',
          'बिकी मात्रा (क्विंटल)',
          'बचा हुआ स्टॉक (क्विंटल)',
          'कुल खर्च (₹)',
          'कुल बिक्री (₹)',
          'प्राप्त भुगतान (₹)',
          'बकाया रकम (₹)',
          'शुद्ध लाभ (₹)',
        ]
      : [
          'Field Name',
          'Total Area',
          'Crop Name',
          'Crop Area',
          'Season',
          'Status',
          'Total Yield (Qtl)',
          'Sold Qty (Qtl)',
          'Stock Left (Qtl)',
          'Total Expense (₹)',
          'Total Sales (₹)',
          'Received (₹)',
          'Pending Due (₹)',
          'Net Profit (₹)',
        ];

    const summaryRows: (string | number)[][] = [];

    khets.forEach((khet) => {
      const khetFinancial = calculateKhetFinancials(records, khet, khetCrops);
      const cropsForKhet = khetCrops.filter((c) => c.khetId === khet.id);

      if (cropsForKhet.length === 0) {
        summaryRows.push([
          khet.name,
          `${khet.totalArea || khet.area || 0} ${khet.areaUnit || 'बीघा'}`,
          isHi ? 'कोई फसल दर्ज नहीं' : 'No crop recorded',
          '-',
          '-',
          '-',
          0,
          0,
          0,
          khetFinancial.totalExpense,
          khetFinancial.totalSales,
          khetFinancial.paymentReceived,
          khetFinancial.pendingDue,
          khetFinancial.netProfit,
        ]);
      } else {
        cropsForKhet.forEach((crop) => {
          const cf = calculateCropFinancials(records, crop, khet);
          const cropNameDisplay = isHi
            ? `${cropLabel('hi', crop.cropName)} (${crop.cropName})`
            : crop.cropName;
          const statusText =
            crop.status === 'harvested'
              ? isHi
                ? 'कटाई पूर्ण'
                : 'Harvested'
              : crop.status === 'sown'
              ? isHi
                ? 'बुवाई पूर्ण'
                : 'Sown'
              : isHi
              ? 'बढ़वार पर'
              : 'Growing';

          summaryRows.push([
            khet.name,
            `${khet.totalArea || khet.area || 0} ${khet.areaUnit || 'बीघा'}`,
            cropNameDisplay,
            `${crop.allocatedArea} ${crop.areaUnit || khet.areaUnit || 'बीघा'}`,
            crop.season || '',
            statusText,
            cf.harvestedYieldQuintal,
            cf.soldQuantityQuintal,
            cf.remainingStockQuintal,
            cf.totalExpense,
            cf.totalSales,
            cf.paymentReceived,
            cf.pendingDue,
            cf.netProfit,
          ]);
        });
      }
    });

    const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    wsSummary['!cols'] = [
      { wch: 18 }, // Field
      { wch: 12 }, // Total Area
      { wch: 18 }, // Crop
      { wch: 12 }, // Crop Area
      { wch: 14 }, // Season
      { wch: 12 }, // Status
      { wch: 16 }, // Yield
      { wch: 16 }, // Sold
      { wch: 16 }, // Stock
      { wch: 14 }, // Expense
      { wch: 14 }, // Sales
      { wch: 14 }, // Received
      { wch: 14 }, // Pending
      { wch: 14 }, // Net Profit
    ];

    XLSX.utils.book_append_sheet(wb, wsSummary, isHi ? 'खेत व फसल सारांश' : 'Field & Crop Summary');
  }

  // Write and trigger download in browser
  XLSX.writeFile(wb, finalFilename);
}

/**
 * Clean CSV export with UTF-8 BOM for flawless Excel and Google Sheets opening
 */
export function exportToCsv({
  filename,
  lang,
  records,
  khets = [],
}: ExportExcelOptions) {
  const isHi = lang === 'hi';
  const todayStr = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `kisan-sathi-farm-report-${todayStr}.csv`;

  const headers = isHi
    ? [
        'क्र.',
        'दिनांक',
        'खेत का नाम',
        'फसल',
        'सीजन',
        'प्रकार',
        'खर्च श्रेणी',
        'विवरण / टिप्पणी',
        'मात्रा',
        'इकाई',
        'दर प्रति इकाई (₹)',
        'कुल रकम (₹)',
        'प्राप्त राशि (₹)',
        'बकाया राशि (₹)',
        'खरीदार / मंडी',
        'श्रमिक / व्यक्ति',
        'मशीनरी',
        'साझेदार / बटाई',
      ]
    : [
        'S.No',
        'Date',
        'Field Name',
        'Crop',
        'Season',
        'Type',
        'Expense Category',
        'Details / Note',
        'Quantity',
        'Unit',
        'Rate (₹)',
        'Total Amount (₹)',
        'Received (₹)',
        'Pending (₹)',
        'Buyer / Mandi',
        'Worker / Person',
        'Machine',
        'Partner / Batai',
      ];

  let totalExp = 0;
  let totalSale = 0;
  let totalRecv = 0;
  let totalPending = 0;

  const rows = records.map((r, idx) => {
    const amt = getRecordAmount(r);
    const isSale = r.type === 'Sale';
    const isExpense = r.type === 'Expense';

    let paid = 0;
    let pending = 0;

    if (isSale) {
      paid = r.paidAmount !== undefined ? Number(r.paidAmount) : amt;
      pending = r.remainingAmount !== undefined ? Number(r.remainingAmount) : Math.max(0, amt - paid);
      totalSale += amt;
      totalRecv += paid;
      totalPending += pending;
    } else if (isExpense) {
      totalExp += amt;
    }

    const typeLabel = isHi
      ? r.type === 'Expense'
        ? 'खर्च'
        : r.type === 'Yield'
        ? 'पैदावार'
        : 'बिक्री'
      : r.type;

    const cropNameDisplay = isHi
      ? `${cropLabel('hi', r.crop)} (${r.crop})`
      : r.crop;

    return [
      idx + 1,
      r.date || '',
      resolveKhetName(r, khets),
      cropNameDisplay,
      r.season || '',
      typeLabel,
      r.expenseCategory || (isExpense ? 'कृषि खर्च' : ''),
      r.note || '',
      r.quantity !== undefined ? Number(r.quantity) : '',
      r.unit || '',
      r.price !== undefined ? Number(r.price) : '',
      amt,
      isSale ? paid : '',
      isSale ? pending : '',
      r.buyerName || '',
      r.worker || '',
      r.machine || '',
      r.partnerName ? `${r.partnerName} (${r.partnerSharePercent || 50}%)` : '',
    ];
  });

  // Total summary row
  const netProfit = totalSale - totalExp;
  const summaryRow = [
    '',
    isHi ? 'कुल योग' : 'TOTALS',
    '',
    '',
    '',
    '',
    '',
    isHi ? `कुल रिकॉर्ड: ${records.length}` : `Records: ${records.length}`,
    '',
    '',
    '',
    totalSale,
    totalRecv,
    totalPending,
    isHi ? `खर्च: ₹${totalExp}` : `Exp: ₹${totalExp}`,
    isHi ? `लाभ: ₹${netProfit}` : `Profit: ₹${netProfit}`,
    '',
    '',
  ];

  const allData = [headers, ...rows, summaryRow];

  // Build CSV string with proper quotes escaping
  const csvContent = allData
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\r\n');

  // Prefix UTF-8 BOM so Excel opens Devanagari characters perfectly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
