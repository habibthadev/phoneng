import { describe, it, expect } from 'vitest';
import { isValid, isPossible } from '../src/index.js';

describe('validator', () => {
  describe('isValid', () => {
    it('returns true for valid MTN number', () => {
      expect(isValid('08031234567')).toBe(true);
    });

    it('returns true for valid Airtel number', () => {
      expect(isValid('08021234567')).toBe(true);
    });

    it('returns true for valid Glo number', () => {
      expect(isValid('08051234567')).toBe(true);
    });

    it('returns true for valid 9mobile number', () => {
      expect(isValid('08091234567')).toBe(true);
    });

    it('returns false for empty input', () => {
      expect(isValid('')).toBe(false);
    });

    it('returns false for invalid characters', () => {
      expect(isValid('0803abc4567')).toBe(false);
    });

    it('returns false for invalid prefix', () => {
      expect(isValid('01231234567')).toBe(false);
    });

    it('returns false for too short', () => {
      expect(isValid('080312345')).toBe(false);
    });

    it('returns false for too long', () => {
      expect(isValid('080312345678')).toBe(false);
    });
  });

  describe('isPossible', () => {
    it('returns true for correctly formatted number', () => {
      expect(isPossible('08031234567')).toBe(true);
    });

    it('returns true for number with unknown prefix but correct length', () => {
      expect(isPossible('01231234567')).toBe(true);
    });

    it('returns false for wrong length', () => {
      expect(isPossible('080312345')).toBe(false);
    });

    it('returns false for empty input', () => {
      expect(isPossible('')).toBe(false);
    });

    it('returns false for invalid characters', () => {
      expect(isPossible('0803abc4567')).toBe(false);
    });
  });
});
