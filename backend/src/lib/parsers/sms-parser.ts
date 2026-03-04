import { bankPatterns } from './sms-bank-patterns.js';
import type { ParsedTransaction } from '../../types/api.js';

export interface SmsParseResult extends ParsedTransaction {
  bank: string | null;
  cardLast4: string | null;
  rawText: string;
}

/**
 * Parse a Saudi bank SMS message into structured transaction data.
 * Tries each bank's patterns in order, returns the first match.
 */
export function parseBankSms(rawText: string): SmsParseResult | null {
  const text = rawText.trim();
  if (!text) return null;

  for (const bankDef of bankPatterns) {
    for (const pattern of bankDef.patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const extracted = pattern.extract(match);
        // Confidence based on how specific the bank pattern is
        const isGenericBank = bankDef.bank.includes('Generic');
        const baseConfidence = isGenericBank ? 60 : 85;
        const dateBonus = extracted.date ? 5 : 0;
        const cardBonus = extracted.cardLast4 ? 5 : 0;

        return {
          merchant: extracted.merchant,
          amount: extracted.amount,
          date: extracted.date ?? null,
          type: extracted.type,
          currency: 'SAR',
          confidence: Math.min(99, baseConfidence + dateBonus + cardBonus),
          bank: isGenericBank ? null : bankDef.bank,
          cardLast4: extracted.cardLast4 ?? null,
          rawText: text,
        };
      }
    }
  }

  return null;
}
