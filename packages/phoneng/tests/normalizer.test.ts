import { describe, it, expect } from 'vitest';
import { parse } from '../src/index.js';

describe('normalizer', () => {
  it('normalizes local with trunk prefix', () => {
    const result = parse('08031234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('normalizes local without trunk prefix', () => {
    const result = parse('8031234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('normalizes international without plus', () => {
    const result = parse('2348031234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('normalizes E.164 format', () => {
    const result = parse('+2348031234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('normalizes E.164 with spaces', () => {
    const result = parse('+234 803 123 4567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('normalizes with dashes', () => {
    const result = parse('0803-123-4567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('normalizes with spaces', () => {
    const result = parse('0803 123 4567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('normalizes with parentheses', () => {
    const result = parse('(0803) 123 4567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('strips RFC3966 tel: prefix', () => {
    const result = parse('tel:+2348031234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('trims leading and trailing whitespace', () => {
    const result = parse('  +2348031234567  ');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.national).toBe('08031234567');
    }
  });

  it('rejects whitespace-only input', () => {
    const result = parse('   ');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });

  it('rejects embedded letters', () => {
    const result = parse('0803abc4567');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('INVALID_CHARACTERS');
    }
  });

  it('rejects null input', () => {
    const result = parse(null as unknown as string);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });

  it('rejects undefined input', () => {
    const result = parse(undefined as unknown as string);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });

  it('handles tel: prefix with whitespace after', () => {
    const result = parse('tel:  ');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });

  it('handles only special characters', () => {
    const result = parse('---###');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('EMPTY_INPUT');
    }
  });
});
