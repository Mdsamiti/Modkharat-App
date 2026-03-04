import { describe, it, expect } from 'vitest';
import { parseBankSms } from './sms-parser.js';

describe('SMS Parser — Saudi bank SMS formats', () => {
  describe('Al Rajhi Bank', () => {
    it('parses English purchase SMS', () => {
      const result = parseBankSms('Purchase of SAR 245.50 at Carrefour on 04/03/2026 Card *1234');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(245.50);
      expect(result!.merchant).toBe('Carrefour');
      expect(result!.date).toBe('2026-03-04');
      expect(result!.type).toBe('expense');
      expect(result!.currency).toBe('SAR');
      expect(result!.cardLast4).toBe('1234');
      expect(result!.bank).toBe('Al Rajhi Bank');
      expect(result!.confidence).toBeGreaterThanOrEqual(85);
    });

    it('parses Arabic purchase SMS', () => {
      const result = parseBankSms('عملية شراء بمبلغ 350.00 ريال من جرير');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(350);
      expect(result!.merchant).toBe('جرير');
      expect(result!.type).toBe('expense');
    });

    it('parses English salary credit', () => {
      const result = parseBankSms('Salary credited SAR 12,500.00');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(12500);
      expect(result!.type).toBe('income');
      expect(result!.merchant).toBe('Salary');
    });

    it('parses Arabic deposit', () => {
      const result = parseBankSms('تم إيداع مبلغ 5000 ريال راتب');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(5000);
      expect(result!.type).toBe('income');
    });
  });

  describe('SNB (Saudi National Bank)', () => {
    it('parses SNB purchase SMS', () => {
      const result = parseBankSms('SNB: Purchase SAR 89.00 at STARBUCKS 04/03/2026');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(89);
      expect(result!.merchant).toBe('STARBUCKS');
      expect(result!.date).toBe('2026-03-04');
      expect(result!.bank).toBe('SNB (Saudi National Bank)');
    });

    it('parses Arabic SNB SMS', () => {
      const result = parseBankSms('الأهلي: عملية شراء 150.00 ريال في لولو هايبر');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(150);
      expect(result!.merchant).toBe('لولو هايبر');
    });
  });

  describe('Riyad Bank', () => {
    it('parses Riyad Bank POS purchase', () => {
      const result = parseBankSms('Riyad Bank: POS Purchase SAR 150.00 at JARIR BOOKSTORE');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(150);
      expect(result!.merchant).toBe('JARIR BOOKSTORE');
    });
  });

  describe('Generic / Fallback', () => {
    it('parses generic SAR amount pattern', () => {
      const result = parseBankSms('SAR 500.00 at Tamimi Markets');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(500);
      expect(result!.merchant).toBe('Tamimi Markets');
      expect(result!.bank).toBeNull(); // Generic fallback
      expect(result!.confidence).toBeLessThan(85); // Lower confidence for generic
    });

    it('returns null for non-bank SMS', () => {
      const result = parseBankSms('Hello! Your OTP code is 123456');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseBankSms('')).toBeNull();
    });
  });

  describe('Amount parsing', () => {
    it('handles comma-separated amounts', () => {
      const result = parseBankSms('Purchase of SAR 1,250.75 at Amazon');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(1250.75);
    });

    it('handles whole number amounts', () => {
      const result = parseBankSms('Purchase of SAR 100 at Danube');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(100);
    });
  });
});
