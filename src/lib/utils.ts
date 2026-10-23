export function fmt(value: number): string {
  const n = Number(value) || 0;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function fmtNumber(value: number): string {
  const n = Number(value) || 0;
  return n.toLocaleString('en-IN');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
