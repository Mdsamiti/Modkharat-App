import type { ParsedTransaction } from '../../types/api.js';

// Arabic number words
const arabicNumbers: Record<string, number> = {
  'واحد': 1, 'اثنين': 2, 'ثلاثة': 3, 'أربعة': 4, 'خمسة': 5,
  'ستة': 6, 'سبعة': 7, 'ثمانية': 8, 'تسعة': 9, 'عشرة': 10,
  'عشرين': 20, 'ثلاثين': 30, 'أربعين': 40, 'خمسين': 50,
  'ستين': 60, 'سبعين': 70, 'ثمانين': 80, 'تسعين': 90,
  'مائة': 100, 'مية': 100, 'ميتين': 200, 'مئتين': 200,
  'ثلاثمائة': 300, 'أربعمائة': 400, 'خمسمائة': 500,
  'ألف': 1000, 'ألفين': 2000,
};

/**
 * Parse a voice transcript into structured transaction data.
 * Supports Arabic and English.
 */
export function parseVoiceTranscript(transcript: string): ParsedTransaction | null {
  const text = transcript.trim();
  if (!text) return null;

  // Try Arabic patterns first
  const arabic = parseArabicTranscript(text);
  if (arabic) return arabic;

  // Try English patterns
  const english = parseEnglishTranscript(text);
  if (english) return english;

  return null;
}

function parseArabicTranscript(text: string): ParsedTransaction | null {
  // "صرفت مائة ريال في كارفور" / "دفعت خمسين ريال في ستاربكس"
  const expenseMatch = text.match(
    /(?:صرفت|دفعت|اشتريت|حسبوا علي)\s+(.+?)\s+(?:ريال|ر\.?س\.?)\s+(?:في|من|لدى|عند)\s+(.+)/,
  );
  if (expenseMatch) {
    const amount = parseArabicAmount(expenseMatch[1]);
    if (amount) {
      return {
        merchant: expenseMatch[2].trim(),
        amount,
        date: null,
        type: 'expense',
        currency: 'SAR',
        confidence: 75,
      };
    }
  }

  // "استلمت ألف ريال راتب"
  const incomeMatch = text.match(
    /(?:استلمت|وصلني|حصلت على)\s+(.+?)\s+(?:ريال|ر\.?س\.?)\s*(.+)?/,
  );
  if (incomeMatch) {
    const amount = parseArabicAmount(incomeMatch[1]);
    if (amount) {
      return {
        merchant: incomeMatch[2]?.trim() || 'Income',
        amount,
        date: null,
        type: 'income',
        currency: 'SAR',
        confidence: 70,
      };
    }
  }

  // Fallback: number + ريال + location
  const fallback = text.match(/([\d,]+(?:\.\d+)?)\s*(?:ريال|ر\.?س\.?)\s+(?:في|من)\s+(.+)/);
  if (fallback) {
    return {
      merchant: fallback[2].trim(),
      amount: parseFloat(fallback[1].replace(/,/g, '')),
      date: null,
      type: 'expense',
      currency: 'SAR',
      confidence: 60,
    };
  }

  return null;
}

function parseEnglishTranscript(text: string): ParsedTransaction | null {
  // "I spent 100 riyals at Carrefour" / "paid 50 at Starbucks"
  const expenseMatch = text.match(
    /(?:I\s+)?(?:spent|paid|bought)\s+(\d+(?:\.\d+)?)\s*(?:riyals?|SAR|SR)?\s+(?:at|from|in)\s+(.+)/i,
  );
  if (expenseMatch) {
    return {
      merchant: expenseMatch[2].trim(),
      amount: parseFloat(expenseMatch[1]),
      date: null,
      type: 'expense',
      currency: 'SAR',
      confidence: 75,
    };
  }

  // "received 12000 salary" / "got 5000 from Ahmed"
  const incomeMatch = text.match(
    /(?:received|got)\s+(\d+(?:\.\d+)?)\s*(?:riyals?|SAR|SR)?\s*(.+)?/i,
  );
  if (incomeMatch) {
    return {
      merchant: incomeMatch[2]?.trim() || 'Income',
      amount: parseFloat(incomeMatch[1]),
      date: null,
      type: 'income',
      currency: 'SAR',
      confidence: 70,
    };
  }

  return null;
}

function parseArabicAmount(text: string): number | null {
  // Try parsing as a plain number first
  const numMatch = text.match(/^([\d,]+(?:\.\d+)?)$/);
  if (numMatch) return parseFloat(numMatch[1].replace(/,/g, ''));

  // Parse Arabic number words
  const words = text.split(/\s+و\s+|\s+/);
  let total = 0;

  for (const word of words) {
    const val = arabicNumbers[word];
    if (val !== undefined) {
      total += val;
    }
  }

  return total > 0 ? total : null;
}
