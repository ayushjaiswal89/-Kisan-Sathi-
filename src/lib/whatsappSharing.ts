export function getWhatsAppUrl(text: string, phone?: string): string {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  if (cleanPhone) {
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${finalPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export function shareViaWhatsApp(text: string, phone?: string) {
  const url = getWhatsAppUrl(text, phone);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    window.location.href = url;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

export function generatePartnerWhatsAppSummary({
  partnerName,
  relationshipName,
  khetName,
  cropName,
  sharePercent = 50,
  totalExpense,
  partnerCostShare,
  myExpensePaid,
  partnerExpensePaid,
  totalSales,
  partnerSalesShare,
  totalYieldQuintal,
  partnerYieldShareQuintal,
  directCashGave,
  directCashReceived,
  netBalance,
}: {
  partnerName: string;
  relationshipName?: string;
  khetName?: string;
  cropName?: string;
  sharePercent?: number;
  totalExpense: number;
  partnerCostShare: number;
  myExpensePaid: number;
  partnerExpensePaid: number;
  totalSales: number;
  partnerSalesShare: number;
  totalYieldQuintal?: number;
  partnerYieldShareQuintal?: number;
  directCashGave: number;
  directCashReceived: number;
  netBalance: number;
}): string {
  const dateStr = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const settlementShort =
    netBalance > 0
      ? `👉 आपको साझीदार से लेने हैं: ₹${netBalance.toLocaleString('en-IN')}`
      : netBalance < 0
      ? `👉 आपको साझीदार को देने हैं: ₹${Math.abs(netBalance).toLocaleString('en-IN')}`
      : `👉 हिसाब पूर्ण रूप से चुकता है (₹0)`;

  const summaryHeader = `🌾 *${partnerName} जी का बटाई हिसाब पर्चा*\nखेत: ${khetName || 'साझा खेत'}${cropName ? ` (${cropName})` : ''}\nकुल खर्च: ₹${totalExpense.toLocaleString('en-IN')} (हिस्सा ${sharePercent}%: ₹${partnerCostShare.toLocaleString('en-IN')})\n${settlementShort}`;

  return `${summaryHeader}
-----------------------------------
📅 दिनांक: ${dateStr}
👤 साझीदार: ${partnerName}
🌱 खेत: ${khetName || 'साझा खेत'} ${cropName ? `(${cropName})` : ''}
📊 साझेदारी: ${sharePercent}% (अधिया / बटाई)

*1. कुल खेती खर्च:* ₹${totalExpense.toLocaleString('en-IN')}
• साझीदार का हिस्सा (${sharePercent}%): ₹${partnerCostShare.toLocaleString('en-IN')}
• मेरे द्वारा चुकाया खर्च: ₹${myExpensePaid.toLocaleString('en-IN')}
• साझीदार द्वारा चुकाया खर्च: ₹${partnerExpensePaid.toLocaleString('en-IN')}

*2. कुल फसल बिक्री:* ₹${totalSales.toLocaleString('en-IN')}
• साझीदार का बिक्री हिस्सा (${sharePercent}%): ₹${partnerSalesShare.toLocaleString('en-IN')}

*3. नकद लेनदेन (Advance):*
• साझीदार को दिया गया नकद: ₹${directCashGave.toLocaleString('en-IN')}
• साझीदार से प्राप्त नकद: ₹${directCashReceived.toLocaleString('en-IN')}
-----------------------------------
${settlementShort}

_डिजिटल किसान साथी बहीखाता से प्रेषित_`;
}

export function generateRecordWhatsAppMessage(record: {
  crop: string;
  field?: string;
  type: string;
  amount: number;
  quantity?: number;
  unit?: string;
  price?: number;
  date: string;
  note?: string;
  buyerName?: string;
  worker?: string;
  remainingAmount?: number;
}): string {
  const isSale = record.type === 'Sale';
  if (isSale) {
    return `🌾 *फसल बिक्री पर्ची* 🌾
📅 दिनांक: ${record.date}
🌱 फसल: ${record.crop} ${record.field ? `(${record.field})` : ''}
⚖️ मात्रा: ${record.quantity || 0} ${record.unit || 'क्विंटल'} @ ₹${record.price || 0}/${record.unit || 'क्विंटल'}
-------------------------
💰 कुल बिक्री राशि: ₹${record.amount.toLocaleString('en-IN')}
${record.remainingAmount && record.remainingAmount > 0 ? `⚠️ बकाया रकम: ₹${record.remainingAmount.toLocaleString('en-IN')}` : '✅ पूर्ण भुगतान प्राप्त'}
${record.buyerName ? `🏪 खरीदार/व्यापारी: ${record.buyerName}\n` : ''}${record.note ? `📝 विवरण: ${record.note}\n` : ''}
_(किसान साथी बहीखाता)_`;
  }

  return `🌱 *खेती खर्च प्रविष्टि* 🌱
📅 दिनांक: ${record.date}
🌾 फसल: ${record.crop} ${record.field ? `(${record.field})` : ''}
📋 खर्च विवरण: ${record.note || 'कृषि इनपुट खर्च'}
${record.worker ? `👤 श्रमिक/दुकान: ${record.worker}\n` : ''}-------------------------
💵 कुल खर्च राशि: ₹${record.amount.toLocaleString('en-IN')}

_(किसान साथी बहीखाता)_`;
}
