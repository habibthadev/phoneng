import { describe, it, expect } from 'vitest';
import { parse } from '../src/index.js';
import {
  toE164,
  toNational,
  toInternational,
  toCompact,
  toRFC3966,
} from '../src/formatter.js';

describe('formatter', () => {
  describe('via parse', () => {
    it('formats to E.164 correctly', () => {
      const result = parse('08031234567');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.e164).toBe('+2348031234567');
      }
    });

    it('formats to national with leading zero', () => {
      const result = parse('8031234567');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.national).toBe('08031234567');
      }
    });

    it('formats to international with spacing', () => {
      const result = parse('08031234567');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.international).toBe('+234 803 123 4567');
      }
    });

    it('formats to compact without plus', () => {
      const result = parse('08031234567');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.compact).toBe('2348031234567');
      }
    });

    it('formats consistently across networks', () => {
      const numbers = [
        { input: '08031234567', network: 'MTN' },
        { input: '08021234567', network: 'AIRTEL' },
        { input: '08051234567', network: 'GLO' },
        { input: '08091234567', network: 'NINE_MOBILE' },
      ];

      for (const { input, network } of numbers) {
        const result = parse(input);
        expect(result.valid).toBe(true);
        if (result.valid) {
          expect(result.network).toBe(network);
          expect(result.e164).toMatch(/^\+234/);
          expect(result.national).toMatch(/^0/);
          expect(result.international).toMatch(/^\+234 /);
          expect(result.compact).toMatch(/^234/);
        }
      }
    });
  });

  describe('direct formatter functions', () => {
    const testDigits = '8031234567';

    it('toE164 adds country code with plus', () => {
      expect(toE164(testDigits)).toBe('+2348031234567');
    });

    it('toNational adds trunk prefix', () => {
      expect(toNational(testDigits)).toBe('08031234567');
    });

    it('toInternational adds country code and spacing', () => {
      expect(toInternational(testDigits)).toBe('+234 803 123 4567');
    });

    it('toCompact adds country code without plus', () => {
      expect(toCompact(testDigits)).toBe('2348031234567');
    });

    it('toRFC3966 formats as tel URI', () => {
      expect(toRFC3966(testDigits)).toBe('tel:+2348031234567');
    });
  });
});
