import { describe, it, expect } from 'vitest';
import { parse } from '../src/index.js';

describe('edge cases', () => {
  it('handles empty string', () => {
    const result = parse('');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });

  it('handles single space', () => {
    const result = parse(' ');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });

  it('handles tab character', () => {
    const result = parse('\t');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });

  it('handles newline character', () => {
    const result = parse('\n');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });

  it('handles very long string', () => {
    const veryLong = '0803' + '1'.repeat(1000);
    const result = parse(veryLong);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('TOO_LONG');
    }
  });

  it('handles repeated plus signs', () => {
    const result = parse('++2348031234567');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('TOO_LONG');
    }
  });

  it('handles number with only zeros', () => {
    const result = parse('00000000000');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('INVALID_PREFIX');
    }
  });

  it('handles mixed format with double prefix', () => {
    const result = parse('(+234) 0803-123-4567');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('TOO_LONG');
    }
  });

  it('handles spaces between every digit', () => {
    const result = parse('0 8 0 3 1 2 3 4 5 6 7');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('handles 0809 prefix correctly as 9mobile', () => {
    const result = parse('08091234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.network).toBe('NINE_MOBILE');
      expect(result.prefix).toBe('0809');
    }
  });

  it('handles leading zeros after country code strip', () => {
    const result = parse('+234803123456');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('TOO_SHORT');
    }
  });

  it('rejects alphabetic characters in middle', () => {
    const result = parse('0803ABC4567');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('INVALID_CHARACTERS');
    }
  });

  it('handles multiple parentheses', () => {
    const result = parse('((0803)) 123 4567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('handles plus in middle of number', () => {
    const result = parse('0803+1234567');
    expect(result.valid).toBe(false);
  });
});
