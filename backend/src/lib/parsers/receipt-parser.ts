import type { ParsedTransaction } from '../../types/api.js';

/**
 * Parse OCR text from a receipt into structured transaction data.
 * Extracts merchant name, total amount, date, and currency.
 */
export function parseReceiptText(ocrText: string): ParsedTransaction | null {
  const text = ocrText.trim();
  if (!text) return null;

  const merchant = extractMerchant(text);
  const amount = extractAmount(text);
  const date = extractDate(text);

  if (!amount) return null;

  return {
    merchant: merchant ?? 'Unknown Merchant',
    amount,
    date,
    type: 'expense',
    currency: detectCurrency(text),
    confidence: calculateConfidence(merchant, amount, date),
  };
}

function extractMerchant(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  // The merchant name is usually in the first 1-3 lines of a receipt
  // Skip very short lines (likely just numbers or codes)
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '').trim();
    if (cleaned.length >= 3 && !/^\d+$/.test(line)) {
      return cleaned;
    }
  }
  return null;
}

function extractAmount(text: string): number | null {
  // Look for "TOTAL", "المجموع", "Grand Total", etc. followed by a number
  const totalPatterns = [
    /(?:GRAND\s*)?TOTAL[:\s]*(?:SAR|SR|ر\.?س\.?)?\s*([\d,]+\.?\d{0,2})/i,
    /المجموع[:\s]*([\d,]+\.?\d{0,2})/,
    /الإجمالي[:\s]*([\d,]+\.?\d{0,2})/,
    /(?:AMOUNT\s*(?:DUE)?|NET\s*AMOUNT)[:\s]*(?:SAR|SR)?\s*([\d,]+\.?\d{0,2})/i,
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (val > 0 && val < 1_000_000) return val;
    }
  }

  // Fallback: find the largest number that looks like a monetary amount
  const amounts = [...text.matchAll(/([\d,]+\.\d{2})/g)]
    .map((m) => parseFloat(m[1].replace(/,/g, '')))
    .filter((v) => v > 0 && v < 1_000_000)
    .sort((a, b) => b - a);

  return amounts[0] ?? null;
}

function extractDate(text: string): string | null {
  // DD/MM/YYYY or DD-MM-YYYY
  const dateMatch = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (dateMatch) {
    return `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
  }

  // YYYY-MM-DD
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return isoMatch[0];
  }

  return null;
}

function detectCurrency(text: string): string {
  if (/SAR|SR|ريال|ر\.?س\.?/i.test(text)) return 'SAR';
  if (/USD|\$/i.test(text)) return 'USD';
  if (/AED|درهم/i.test(text)) return 'AED';
  return 'SAR'; // Default to SAR for Saudi context
}

function calculateConfidence(
  merchant: string | null,
  amount: number | null,
  date: string | null,
): number {
  let confidence = 30; // base
  if (merchant) confidence += 25;
  if (amount) confidence += 30;
  if (date) confidence += 15;
  return confidence;
}
