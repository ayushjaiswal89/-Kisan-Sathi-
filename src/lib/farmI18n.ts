import { Lang } from './types';

export interface FarmTranslation {
  title: string;
  subtitle: string;
  expense: string;
  yield: string;
  sale: string;
  crop: string;
  field: string;
  date: string;
  type: string;
  amount: string;
  quantity: string;
  rate: string;
  totalExpense: string;
  totalSales: string;
  paymentReceived: string;
  pendingPayment: string;
  realizedProfit: string;
  expectedProfit: string;
  noRecords: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
}

export const FARM_STRINGS: Record<Lang, FarmTranslation> = {
  hi: {
    title: 'खेत बहीखाता',
    subtitle: 'खेत व फसलवार खर्च, पैदावार और बिक्री का डिजिटल हिसाब',
    expense: 'खर्च',
    yield: 'पैदावार / उपज',
    sale: 'फसल बिक्री',
    crop: 'फसल',
    field: 'खेत / चक',
    date: 'तारीख',
    type: 'प्रकार',
    amount: 'रकम (₹)',
    quantity: 'मात्रा',
    rate: 'भाव (₹/इकाई)',
    totalExpense: 'कुल लागत खर्च',
    totalSales: 'कुल फसल बिक्री',
    paymentReceived: 'प्राप्त नकद भुगतान',
    pendingPayment: 'बकाया रकम (लेनी बाकी)',
    realizedProfit: 'शुद्ध मुनाफा (Realized Net)',
    expectedProfit: 'कुल अनुमानित लाभ',
    noRecords: 'कोई रिकॉर्ड दर्ज नहीं है।',
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संशोधित करें',
  },
  en: {
    title: 'Farm Ledger',
    subtitle: 'Field and crop level expenses, yield and harvest sales tracker',
    expense: 'Expense',
    yield: 'Yield',
    sale: 'Crop Sale',
    crop: 'Crop',
    field: 'Field',
    date: 'Date',
    type: 'Type',
    amount: 'Amount (₹)',
    quantity: 'Quantity',
    rate: 'Rate (₹/Unit)',
    totalExpense: 'Total Expense',
    totalSales: 'Total Sales',
    paymentReceived: 'Payment Received',
    pendingPayment: 'Pending Balance',
    realizedProfit: 'Realized Net Profit',
    expectedProfit: 'Expected Net Profit',
    noRecords: 'No records found.',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
  },
};

export const CROP_TRANSLATIONS: Record<string, { hi: string; en: string }> = {
  Wheat: { hi: 'गेहूं', en: 'Wheat' },
  Soybean: { hi: 'सोयाबीन', en: 'Soybean' },
  Gram: { hi: 'चना', en: 'Gram / Chickpea' },
  Mustard: { hi: 'सरसों', en: 'Mustard' },
  Rice: { hi: 'धान / चावल', en: 'Paddy / Rice' },
  Cotton: { hi: 'कपास', en: 'Cotton' },
  Maize: { hi: 'मक्का', en: 'Maize / Corn' },
  Garlic: { hi: 'लहसुन', en: 'Garlic' },
  Groundnut: { hi: 'मूंगफली', en: 'Groundnut' },
  Onion: { hi: 'प्याज', en: 'Onion' },
  Potato: { hi: 'आलू', en: 'Potato' },
  Tomato: { hi: 'टमाटर', en: 'Tomato' },
  Sugarcane: { hi: 'गन्ना', en: 'Sugarcane' },
  Bajra: { hi: 'बाजरा', en: 'Pearl Millet' },
  Jowar: { hi: 'ज्वार', en: 'Sorghum' },
  Peas: { hi: 'मटर', en: 'Green Peas' },
  Moong: { hi: 'मूंग', en: 'Green Gram' },
  Urad: { hi: 'उड़द', en: 'Black Gram' },
  Coriander: { hi: 'धनिया', en: 'Coriander' },
  Other: { hi: 'अन्य', en: 'Other' },
};

export function cropLabel(lang: Lang, cropKey: string): string {
  const match = CROP_TRANSLATIONS[cropKey];
  if (match) {
    return lang === 'hi' ? match.hi : match.en;
  }
  return cropKey;
}

export function unitLabel(lang: Lang, unit: string = 'Quintal'): string {
  if (lang === 'hi') {
    if (unit === 'Quintal') return 'क्विंटल';
    if (unit === 'Kg') return 'किलो';
    if (unit === 'Ton') return 'टन';
    return unit;
  }
  return unit;
}

export function typeLabel(lang: Lang, type: 'Expense' | 'Yield' | 'Sale'): string {
  if (lang === 'hi') {
    if (type === 'Expense') return 'लागत खर्च';
    if (type === 'Yield') return 'उपज / पैदावार';
    return 'फसल बिक्री';
  }
  return type;
}
