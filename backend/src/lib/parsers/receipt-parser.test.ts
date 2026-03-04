import { describe, it, expect } from 'vitest';
import { parseReceiptText } from './receipt-parser.js';

describe('Receipt Parser — OCR text extraction', () => {
  it('extracts merchant and total from a standard receipt', () => {
    const ocrText = `
      Carrefour Saudi
      Branch: Riyadh Park
      Date: 04/03/2026

      Milk               SAR 8.50
      Bread              SAR 3.00
      Chicken            SAR 25.00

      TOTAL: SAR 36.50
    `;
    const result = parseReceiptText(ocrText);
    expect(result).not.toBeNull();
    expect(result!.merchant).toBe('Carrefour Saudi');
    expect(result!.amount).toBe(36.50);
    expect(result!.date).toBe('2026-03-04');
    expect(result!.type).toBe('expense');
    expect(result!.currency).toBe('SAR');
  });

  it('extracts from Arabic receipt', () => {
    const ocrText = `
      هايبر بنده
      المجموع: 125.00
      التاريخ: 15/02/2026
    `;
    const result = parseReceiptText(ocrText);
    expect(result).not.toBeNull();
    expect(result!.amount).toBe(125);
    expect(result!.date).toBe('2026-02-15');
  });

  it('falls back to largest amount when no TOTAL label found', () => {
    const ocrText = `
      Store XYZ
      Item A    45.00
      Item B    12.50
      Item C    89.99
    `;
    const result = parseReceiptText(ocrText);
    expect(result).not.toBeNull();
    expect(result!.amount).toBe(89.99);
  });

  it('detects SAR currency', () => {
    const result = parseReceiptText('Some Store\nTOTAL SAR 50.00');
    expect(result!.currency).toBe('SAR');
  });

  it('returns null for empty text', () => {
    expect(parseReceiptText('')).toBeNull();
  });

  it('returns null for text with no detectable amount', () => {
    expect(parseReceiptText('Thank you for shopping!')).toBeNull();
  });

  it('confidence is higher when merchant + amount + date are all found', () => {
    const full = parseReceiptText('My Store\nTOTAL 100.00\n04/03/2026');
    const partial = parseReceiptText('100.00');
    expect(full!.confidence).toBeGreaterThan(partial!.confidence);
  });
});
