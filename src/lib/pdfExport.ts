import { Lang } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface FinancialReportData {
  title: string;
  subtitle: string;
  lang: Lang;
  farmerName?: string;
  khetName?: string;
  season?: string;
  summaryCards: {
    label: string;
    value: string;
    color?: string;
  }[];
  tableHeaders: string[];
  tableRows: {
    cells: (string | number)[];
  }[];
  footerNotes?: string;
}

/**
 * Builds a clean, high-resolution, print-ready HTML document for Indian agricultural statements
 */
export function buildPrintableHtml(data: FinancialReportData): string {
  const isHi = data.lang === 'hi';
  const currentDate = new Date().toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const cardsHtml = data.summaryCards
    .map(
      (c) => `
      <div class="kpi-card" style="border-top: 3px solid ${c.color || '#16a34a'};">
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-val" style="color: ${c.color || '#0f172a'};">${c.value}</div>
      </div>`
    )
    .join('');

  const headersHtml = data.tableHeaders
    .map((h) => `<th>${h}</th>`)
    .join('');

  const rowsHtml = data.tableRows
    .map(
      (r, idx) => `
      <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
        ${r.cells.map((cell) => `<td>${cell}</td>`).join('')}
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="${data.lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700&display=swap');

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Mukta', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #0f172a;
      margin: 0;
      padding: 24px;
      font-size: 13px;
      line-height: 1.4;
    }

    .report-container {
      max-width: 900px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      background: #ffffff;
    }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #16a34a;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }

    .logo-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-icon {
      font-size: 26px;
    }

    h1 {
      margin: 0;
      font-size: 20px;
      color: #166534;
      font-weight: 700;
    }

    .subtitle {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #64748b;
    }

    .date-badge {
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      color: #334155;
      font-weight: 600;
      text-align: right;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 20px;
    }

    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
    }

    .kpi-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .kpi-val {
      font-size: 16px;
      font-weight: 700;
      font-family: monospace, sans-serif;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }

    th {
      background: #f1f5f9;
      color: #1e293b;
      padding: 9px 10px;
      font-weight: 600;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
      border-top: 1px solid #e2e8f0;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    tr.even {
      background: #ffffff;
    }

    tr.odd {
      background: #fbfcfe;
    }

    .report-footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #94a3b8;
    }

    .signature-box {
      border-top: 1px solid #94a3b8;
      width: 160px;
      text-align: center;
      padding-top: 4px;
      color: #475569;
      font-size: 11px;
    }

    .print-actions {
      margin-bottom: 16px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity 0.2s;
    }

    .btn-print {
      background: #16a34a;
      color: #ffffff;
    }

    .btn-close {
      background: #e2e8f0;
      color: #334155;
    }

    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .report-container {
        border: none;
        padding: 0;
        max-width: 100%;
      }
      .print-actions {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn btn-print" onclick="window.print()">🖨️ ${isHi ? 'प्रिंट करें / PDF सेव करें' : 'Print / Save PDF'}</button>
    <button class="btn btn-close" onclick="window.close()">✕ ${isHi ? 'बंद करें' : 'Close'}</button>
  </div>

  <div class="report-container">
    <div class="report-header">
      <div>
        <div class="logo-title">
          <span class="brand-icon">🌾</span>
          <h1>${data.title}</h1>
        </div>
        <p class="subtitle">${data.subtitle}</p>
      </div>
      <div class="date-badge">
        <div>${isHi ? 'दिनांक' : 'Date'}: ${currentDate}</div>
        ${data.season ? `<div style="color: #16a34a; margin-top: 2px;">${data.season}</div>` : ''}
      </div>
    </div>

    <div class="kpi-grid">
      ${cardsHtml}
    </div>

    <table>
      <thead>
        <tr>${headersHtml}</tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="report-footer">
      <div>
        <div>${data.footerNotes || (isHi ? 'किसान साथी डिजिटल कृषि बहीखाता द्वारा जनरेट किया गया' : 'Generated by Kisan Sathi Digital Farm Ledger')}</div>
        <div style="font-size: 10px; margin-top: 2px;">www.kisansathi.app | आत्मनिर्भर भारतीय किसान</div>
      </div>
      <div class="signature-box">
        ${isHi ? 'किसान / व्यवस्थापक हस्ताक्षर' : 'Authorized Signature'}
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Exports any DOM element (like an on-screen report modal) directly to a downloadable real .pdf file
 */
export async function exportElementToPdf(element: HTMLElement, filename?: string): Promise<void> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `kisan-sathi-report-${todayStr}.pdf`;

  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  // Render to canvas with 2x scale for sharp, high-res text
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth || 850,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 8; // 8mm margin
  const printWidth = pdfWidth - margin * 2;
  const printHeight = (canvas.height * printWidth) / canvas.width;
  const usablePageHeight = pdfHeight - margin * 2;

  let heightLeft = printHeight;
  let pageIndex = 0;

  while (heightLeft > 0) {
    if (pageIndex > 0) {
      pdf.addPage();
    }
    const position = margin - (pageIndex * usablePageHeight);
    pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight);
    heightLeft -= usablePageHeight;
    pageIndex++;
  }

  pdf.save(finalFilename);
}

/**
 * Downloads a genuine .pdf file from report data by creating a clean offscreen DOM element
 */
export async function downloadPdfReport(data: FinancialReportData, filename?: string): Promise<void> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `kisan-sathi-report-${todayStr}.pdf`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '850px';
  iframe.style.height = '1200px';
  iframe.style.border = '0';
  iframe.style.background = '#ffffff';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) throw new Error('Cannot access iframe document');

    doc.open();
    doc.write(buildPrintableHtml(data));
    doc.close();

    // Allow styles & fonts to render
    await new Promise((r) => setTimeout(r, 350));
    if (iframe.contentWindow?.document?.fonts) {
      try {
        await iframe.contentWindow.document.fonts.ready;
      } catch {}
    }

    const reportEl = (doc.querySelector('.report-container') as HTMLElement) || doc.body;
    await exportElementToPdf(reportEl, finalFilename);
  } catch (err) {
    console.error('PDF generation error, fallback to HTML:', err);
    downloadPrintableHtml(data, finalFilename.replace('.pdf', '.html'));
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

export const downloadFinancialReportPdf = downloadPdfReport;

/**
 * Downloads a standalone printable HTML file as secondary option
 */
export function downloadPrintableHtml(data: FinancialReportData, filename?: string) {
  const html = buildPrintableHtml(data);
  const todayStr = new Date().toISOString().slice(0, 10);
  const finalFilename = filename || `kisan-sathi-report-${todayStr}.html`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Robust print function: triggers isolated printable statement in iframe or downloads real PDF
 */
export async function printFinancialReport(data: FinancialReportData) {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(buildPrintableHtml(data));
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          downloadPdfReport(data);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 4000);
        }
      }, 500);
      return;
    }
  } catch (err) {
    console.warn('Print iframe failed, downloading PDF directly:', err);
  }

  // Fallback: download PDF directly
  await downloadPdfReport(data);
}
