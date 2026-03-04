import { describe, it, expect } from 'vitest';
import { parseVoiceTranscript } from './voice-parser.js';

describe('Voice Parser — transcript to transaction', () => {
  describe('Arabic transcripts', () => {
    it('parses "صرفت مائة ريال في كارفور"', () => {
      const result = parseVoiceTranscript('صرفت مائة ريال في كارفور');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(100);
      expect(result!.merchant).toBe('كارفور');
      expect(result!.type).toBe('expense');
      expect(result!.currency).toBe('SAR');
    });

    it('parses "دفعت خمسين ريال في ستاربكس"', () => {
      const result = parseVoiceTranscript('دفعت خمسين ريال في ستاربكس');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(50);
      expect(result!.merchant).toBe('ستاربكس');
      expect(result!.type).toBe('expense');
    });

    it('parses Arabic income "استلمت ألف ريال راتب"', () => {
      const result = parseVoiceTranscript('استلمت ألف ريال راتب');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(1000);
      expect(result!.type).toBe('income');
    });

    it('parses numeric amount in Arabic sentence', () => {
      const result = parseVoiceTranscript('250 ريال في المطعم');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(250);
      expect(result!.merchant).toBe('المطعم');
    });
  });

  describe('English transcripts', () => {
    it('parses "I spent 100 at Carrefour"', () => {
      const result = parseVoiceTranscript('I spent 100 at Carrefour');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(100);
      expect(result!.merchant).toBe('Carrefour');
      expect(result!.type).toBe('expense');
    });

    it('parses "paid 50.50 riyals at Starbucks"', () => {
      const result = parseVoiceTranscript('paid 50.50 riyals at Starbucks');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(50.50);
      expect(result!.merchant).toBe('Starbucks');
    });

    it('parses "received 12000 salary"', () => {
      const result = parseVoiceTranscript('received 12000 salary');
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(12000);
      expect(result!.type).toBe('income');
    });
  });

  describe('Edge cases', () => {
    it('returns null for empty transcript', () => {
      expect(parseVoiceTranscript('')).toBeNull();
    });

    it('returns null for unrelated speech', () => {
      expect(parseVoiceTranscript('the weather is nice today')).toBeNull();
    });

    it('returns null for ambiguous text', () => {
      expect(parseVoiceTranscript('hello')).toBeNull();
    });
  });
});
