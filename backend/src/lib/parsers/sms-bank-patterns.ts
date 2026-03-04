/**
 * Saudi bank SMS patterns for transaction parsing.
 * Each pattern extracts: amount, merchant, date (optional), card last-4 (optional).
 */

export interface BankPattern {
  bank: string;
  patterns: {
    regex: RegExp;
    extract: (match: RegExpMatchArray) => {
      amount: number;
      merchant: string;
      date?: string;
      cardLast4?: string;
      type: 'expense' | 'income';
    };
  }[];
}

export const bankPatterns: BankPattern[] = [
  {
    bank: 'Al Rajhi Bank',
    patterns: [
      {
        // English: "Purchase of SAR 245.50 at Carrefour on 04/03/2026 Card *1234"
        regex: /Purchase of SAR\s*([\d,]+\.?\d*)\s+at\s+(.+?)(?:\s+on\s+(\d{2}\/\d{2}\/\d{4}))?\s*(?:Card\s*\*(\d{4}))?\s*$/i,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: m[2].trim(),
          date: m[3] ? formatDate(m[3]) : undefined,
          cardLast4: m[4],
          type: 'expense',
        }),
      },
      {
        // Arabic: "عملية شراء بمبلغ 245.50 ريال من كارفور"
        regex: /(?:عملية شراء|مشتريات)\s*(?:بمبلغ)?\s*([\d,]+\.?\d*)\s*(?:ريال|ر\.?س\.?)\s*(?:من|في|لدى)\s+(.+?)(?:\s+بتاريخ\s+(\d{2}\/\d{2}\/\d{4}))?/,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: m[2].trim(),
          date: m[3] ? formatDate(m[3]) : undefined,
          type: 'expense',
        }),
      },
      {
        // Salary / Transfer credit: "Salary credited SAR 12,500.00"
        regex: /(?:Salary|Transfer)\s+(?:credited|received)\s+SAR\s*([\d,]+\.?\d*)/i,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: 'Salary',
          type: 'income',
        }),
      },
      {
        // Arabic income: "تم إيداع مبلغ 12500 ريال راتب"
        regex: /(?:تم إيداع|إيداع)\s*(?:مبلغ)?\s*([\d,]+\.?\d*)\s*(?:ريال|ر\.?س\.?)\s*(.+)?/,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: m[2]?.trim() || 'Deposit',
          type: 'income',
        }),
      },
    ],
  },
  {
    bank: 'SNB (Saudi National Bank)',
    patterns: [
      {
        // "SNB: Purchase SAR 89.00 at STARBUCKS 04/03/2026"
        regex: /SNB:\s*Purchase\s+SAR\s*([\d,]+\.?\d*)\s+at\s+(.+?)(?:\s+(\d{2}\/\d{2}\/\d{4}))?/i,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: m[2].trim(),
          date: m[3] ? formatDate(m[3]) : undefined,
          type: 'expense',
        }),
      },
      {
        // "الأهلي: عملية شراء 89.00 ريال في ستاربكس"
        regex: /الأهلي:\s*(?:عملية شراء|شراء)\s*([\d,]+\.?\d*)\s*(?:ريال|ر\.?س\.?)\s*(?:في|من|لدى)\s+(.+)/,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: m[2].trim(),
          type: 'expense',
        }),
      },
    ],
  },
  {
    bank: 'Riyad Bank',
    patterns: [
      {
        // "Riyad Bank: POS Purchase SAR 150.00 at JARIR BOOKSTORE"
        regex: /Riyad Bank:\s*(?:POS )?Purchase\s+SAR\s*([\d,]+\.?\d*)\s+at\s+(.+)/i,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: m[2].trim(),
          type: 'expense',
        }),
      },
    ],
  },
  {
    bank: 'Generic / Fallback',
    patterns: [
      {
        // Generic: any "SAR <amount>" pattern
        regex: /SAR\s*([\d,]+\.?\d*)\s+(?:at|from|to)\s+(.+)/i,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: m[2].trim().split(/\s+on\s+/i)[0],
          type: 'expense',
        }),
      },
      {
        // Generic Arabic: any "مبلغ X ريال"
        regex: /(?:مبلغ)\s*([\d,]+\.?\d*)\s*(?:ريال|ر\.?س\.?)\s*(?:من|في|لدى)\s+(.+)/,
        extract: (m) => ({
          amount: parseFloat(m[1].replace(/,/g, '')),
          merchant: m[2].trim(),
          type: 'expense',
        }),
      },
    ],
  },
];

function formatDate(dateStr: string): string {
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const [dd, mm, yyyy] = dateStr.split('/');
  return `${yyyy}-${mm}-${dd}`;
}
