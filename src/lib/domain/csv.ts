/**
 * Escapes a single CSV value to prevent formula injection (CWE-1236 / CSV Injection)
 * and properly quote fields containing commas, double quotes, or newlines.
 * 
 * If a string begins with dangerous spreadsheet execution triggers (=, +, -, @, tab, CR),
 * we prepend a single quote (') to force spreadsheet processors (Excel, Calc, Sheets)
 * to interpret the content purely as text.
 */
export function sanitizeCsvValue(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }

  let str = String(val);

  // Guard against spreadsheet formula injection
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];
  if (str.length > 0 && formulaTriggers.includes(str.charAt(0))) {
    str = `'${str}`;
  }

  // If contains double quotes, commas, or line breaks, enclose in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => unknown;
}

/**
 * Converts an array of objects to a safe, well-formatted CSV string.
 */
export function generateCsv<T>(data: T[], columns: CsvColumn<T>[]): string {
  const headerRow = columns.map((col) => sanitizeCsvValue(col.header)).join(',');
  const dataRows = data.map((item) =>
    columns.map((col) => sanitizeCsvValue(col.accessor(item))).join(',')
  );

  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Initiates a browser download for CSV data.
 */
export function downloadCsvFile(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
