export interface ParsedVoiceResult {
  rawTranscript: string;
  type?: 'Expense' | 'Yield' | 'Sale';
  crop?: string;
  expenseCategory?: string;
  amount?: number;
  quantity?: number;
  unit?: string;
  price?: number;
  note?: string;
  confidenceReason?: string;
}

const HINDI_NUMBER_WORDS: Record<string, number> = {
  एक: 1,
  दो: 2,
  तीन: 3,
  चार: 4,
  पांच: 5,
  पाँच: 5,
  छह: 6,
  सात: 7,
  आठ: 8,
  नौ: 9,
  दस: 10,
  पंद्रह: 15,
  बीस: 20,
  पच्चीस: 25,
  तीस: 30,
  चालीस: 40,
  पचास: 50,
  सौ: 100,
  हजार: 1000,
};

export function parseVoiceInput(text: string): ParsedVoiceResult {
  if (!text) {
    return { rawTranscript: '' };
  }
  let clean = text.toLowerCase().trim();
  const res: ParsedVoiceResult = {
    rawTranscript: text,
    note: text,
  };

  // Convert common spoken Hindi number words before units
  for (const [word, num] of Object.entries(HINDI_NUMBER_WORDS)) {
    const regex = new RegExp(`\\b${word}\\s*(बोरी|क्विंटल|किलो|कट्टे|लीटर)\\b`, 'gi');
    clean = clean.replace(regex, `${num} $1`);
  }

  // 1. Detect Crop
  if (clean.includes('गेहूं') || clean.includes('gehu') || clean.includes('wheat') || clean.includes('गेहू')) {
    res.crop = 'Wheat';
  } else if (clean.includes('सोयाबीन') || clean.includes('soyabean') || clean.includes('soybean')) {
    res.crop = 'Soybean';
  } else if (clean.includes('चना') || clean.includes('chana') || clean.includes('gram')) {
    res.crop = 'Gram';
  } else if (clean.includes('सरसों') || clean.includes('sarso') || clean.includes('mustard')) {
    res.crop = 'Mustard';
  } else if (clean.includes('लहसुन') || clean.includes('lahsun') || clean.includes('garlic')) {
    res.crop = 'Garlic';
  } else if (clean.includes('मूंगफली') || clean.includes('mungfali') || clean.includes('groundnut')) {
    res.crop = 'Groundnut';
  } else if (clean.includes('प्याज') || clean.includes('pyaj') || clean.includes('onion')) {
    res.crop = 'Onion';
  } else if (clean.includes('आलू') || clean.includes('aalu') || clean.includes('potato')) {
    res.crop = 'Potato';
  } else if (clean.includes('धान') || clean.includes('चावल') || clean.includes('dhan') || clean.includes('rice')) {
    res.crop = 'Rice';
  } else if (clean.includes('मक्का') || clean.includes('makka') || clean.includes('maize')) {
    res.crop = 'Maize';
  } else if (clean.includes('कपास') || clean.includes('cotton')) {
    res.crop = 'Cotton';
  }

  // 2. Detect Type & Expense Category
  if (
    clean.includes('बेचा') ||
    clean.includes('बिक्री') ||
    clean.includes('sale') ||
    clean.includes('भाव') ||
    clean.includes('मंडी में दिया')
  ) {
    res.type = 'Sale';
  } else if (
    clean.includes('पैदावार') ||
    clean.includes('उपज') ||
    clean.includes('निकला') ||
    clean.includes('आया') ||
    clean.includes('yield')
  ) {
    res.type = 'Yield';
  } else {
    res.type = 'Expense';
    if (
      clean.includes('डीजल') ||
      clean.includes('ट्रैक्टर') ||
      clean.includes('जुताई') ||
      clean.includes('diesel') ||
      clean.includes('रोटावेटर')
    ) {
      res.expenseCategory = 'डीजल/ट्रैक्टर';
    } else if (
      clean.includes('खाद') ||
      clean.includes('dap') ||
      clean.includes('यूरिया') ||
      clean.includes('पोटाश') ||
      clean.includes('उर्वरक') ||
      clean.includes('fertilizer')
    ) {
      res.expenseCategory = 'खाद';
    } else if (clean.includes('बीज') || clean.includes('seed') || clean.includes('बुवाई')) {
      res.expenseCategory = 'बीज';
    } else if (
      clean.includes('कीटनाशक') ||
      clean.includes('दवाई') ||
      clean.includes('spray') ||
      clean.includes('स्प्रे') ||
      clean.includes('फफूंदनाशक')
    ) {
      res.expenseCategory = 'कीटनाशक';
    } else if (
      clean.includes('मजदूरी') ||
      clean.includes('लेबर') ||
      clean.includes('श्रमिक') ||
      clean.includes('निंदाई') ||
      clean.includes('कटाई मजदूर') ||
      clean.includes('labor')
    ) {
      res.expenseCategory = 'मजदूरी';
    } else if (
      clean.includes('पानी') ||
      clean.includes('सिंचाई') ||
      clean.includes('पिलाई') ||
      clean.includes('irrigation')
    ) {
      res.expenseCategory = 'सिंचाई';
    } else if (
      clean.includes('बिजली') ||
      clean.includes('बिल') ||
      clean.includes('मोटर बिल')
    ) {
      res.expenseCategory = 'बिजली';
    } else if (
      clean.includes('भाड़ा') ||
      clean.includes('ढुलाई') ||
      clean.includes('ट्रॉली') ||
      clean.includes('किराया') ||
      clean.includes('हमाली') ||
      clean.includes('transport')
    ) {
      res.expenseCategory = 'ढुलाई';
    } else {
      res.expenseCategory = 'अन्य';
    }
  }

  // 3. Detect Units and Quantities
  const bagMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:बोरी|कट्टे|bag|bags)/);
  if (bagMatch) {
    res.quantity = parseFloat(bagMatch[1]);
    res.unit = 'बोरी (Bags)';
  }
  const qtlMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:क्विंटल|quintal|qtl)/);
  if (qtlMatch) {
    res.quantity = parseFloat(qtlMatch[1]);
    res.unit = 'Quintal';
  }
  const kgMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:किलो|kg)/);
  if (kgMatch) {
    res.quantity = parseFloat(kgMatch[1]);
    res.unit = 'Kg';
  }
  const literMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:लीटर|liter|litres)/);
  if (literMatch) {
    res.quantity = parseFloat(literMatch[1]);
    res.unit = 'लीटर (Liters)';
  }

  // 4. Look for currency amounts
  const rupeeMatch =
    clean.match(/(?:रुपये|रु|rs|inr|₹)\s*(\d+(?:\.\d+)?)/) ||
    clean.match(/(\d+(?:\.\d+)?)\s*(?:रुपये|रु|rs)/);

  if (rupeeMatch) {
    res.amount = parseFloat(rupeeMatch[1]);
  } else {
    const allNumbers = clean.match(/\b\d+(?:\.\d+)?\b/g);
    if (allNumbers && allNumbers.length > 0) {
      const parsedNums = allNumbers.map((n) => parseFloat(n)).filter((n) => !isNaN(n));
      if (res.quantity !== undefined) {
        const otherNums = parsedNums.filter((n) => n !== res.quantity);
        if (otherNums.length > 0) {
          res.amount = Math.max(...otherNums);
        }
      } else {
        if (parsedNums.length === 1) {
          if (parsedNums[0] >= 100) {
            res.amount = parsedNums[0];
          } else {
            res.quantity = parsedNums[0];
          }
        } else if (parsedNums.length >= 2) {
          const sorted = [...parsedNums].sort((a, b) => a - b);
          res.quantity = sorted[0];
          res.amount = sorted[sorted.length - 1];
        }
      }
    }
  }

  if (res.amount && res.quantity && res.quantity > 0) {
    res.price = Math.round((res.amount / res.quantity) * 100) / 100;
  }

  const parts: string[] = [];
  if (res.type) parts.push(res.type === 'Expense' ? 'लागत' : res.type === 'Sale' ? 'बिक्री' : 'उपज');
  if (res.expenseCategory) parts.push(`श्रेणी: ${res.expenseCategory}`);
  if (res.crop) parts.push(`फसल: ${res.crop}`);
  if (res.quantity) parts.push(`मात्रा: ${res.quantity} ${res.unit || ''}`);
  if (res.amount) parts.push(`रकम: ₹${res.amount.toLocaleString('en-IN')}`);
  res.confidenceReason = parts.join(' | ');

  return res;
}
