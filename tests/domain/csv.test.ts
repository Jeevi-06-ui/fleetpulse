import { describe, it, expect } from 'vitest';
import { sanitizeCsvValue, generateCsv, CsvColumn } from '@/lib/domain/csv';

describe('Domain: Secure CSV Export & Formula Injection Prevention', () => {
  it('neutralizes spreadsheet formula execution triggers with a leading quote', () => {
    // Testing formula injection characters: =, +, -, @, tab, return
    expect(sanitizeCsvValue('=CMD("calc")')).toBe(`"'=CMD(""calc"")"`);
    expect(sanitizeCsvValue('+12345')).toBe(`'+12345`);
    expect(sanitizeCsvValue('-500')).toBe(`'-500`);
    expect(sanitizeCsvValue('@SUM(A1:A10)')).toBe(`'@SUM(A1:A10)`);
  });

  it('escapes double quotes and encloses in quotation marks when commas or quotes are present', () => {
    expect(sanitizeCsvValue('Chennai Port, Terminal 1')).toBe('"Chennai Port, Terminal 1"');
    expect(sanitizeCsvValue('Tata "Signa" 4825')).toBe('"Tata ""Signa"" 4825"');
  });

  it('handles null, undefined, and standard numbers safely', () => {
    expect(sanitizeCsvValue(null)).toBe('');
    expect(sanitizeCsvValue(undefined)).toBe('');
    expect(sanitizeCsvValue(42)).toBe('42');
  });

  it('generates well-formed CSV across rows and columns', () => {
    const data = [
      { id: 'FP-1', location: 'Bengaluru, Hub', formulaAttempt: '=1+1' },
      { id: 'FP-2', location: 'Chennai', formulaAttempt: 'Normal' },
    ];

    const columns: CsvColumn<typeof data[0]>[] = [
      { header: 'ID', accessor: (d) => d.id },
      { header: 'Location', accessor: (d) => d.location },
      { header: 'Note', accessor: (d) => d.formulaAttempt },
    ];

    const csv = generateCsv(data, columns);
    const lines = csv.split('\r\n');

    expect(lines[0]).toBe('ID,Location,Note');
    expect(lines[1]).toBe('FP-1,"Bengaluru, Hub",\'=1+1');
    expect(lines[2]).toBe('FP-2,Chennai,Normal');
  });
});
