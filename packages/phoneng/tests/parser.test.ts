import { describe, it, expect } from 'vitest';
import { parse } from '../src/index.js';

describe('parser', () => {
  it('parses valid MTN number', () => {
    const result = parse('08031234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.network).toBe('MTN');
      expect(result.type).toBe('MOBILE');
      expect(result.prefix).toBe('0803');
    }
  });

  it('parses valid Airtel number', () => {
    const result = parse('08021234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.network).toBe('AIRTEL');
      expect(result.type).toBe('MOBILE');
    }
  });

  it('parses valid Glo number', () => {
    const result = parse('08051234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.network).toBe('GLO');
      expect(result.type).toBe('MOBILE');
    }
  });

  it('parses valid 9mobile number', () => {
    const result = parse('08091234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.network).toBe('NINE_MOBILE');
      expect(result.type).toBe('MOBILE');
    }
  });

  it('returns all output formats correctly', () => {
    const result = parse('08031234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.e164).toBe('+2348031234567');
      expect(result.national).toBe('08031234567');
      expect(result.international).toBe('+234 803 123 4567');
      expect(result.compact).toBe('2348031234567');
    }
  });

  it('rejects invalid prefix', () => {
    const result = parse('01231234567');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('INVALID_PREFIX');
    }
  });

  it('rejects 9-digit input', () => {
    const result = parse('080312345');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('TOO_SHORT');
    }
  });

  it('rejects 12-digit input', () => {
    const result = parse('080312345678');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('TOO_LONG');
    }
  });

  it('parses all input format variants to same result', () => {
    const inputs = [
      '08031234567',
      '8031234567',
      '2348031234567',
      '+2348031234567',
      '+234 803 123 4567',
      '0803-123-4567',
      '0803 123 4567',
      '(0803) 123 4567',
    ];

    const results = inputs.map((input) => parse(input));

    for (const result of results) {
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.e164).toBe('+2348031234567');
        expect(result.national).toBe('08031234567');
        expect(result.network).toBe('MTN');
      }
    }
  });

  it('parses valid Ntel number', () => {
    const result = parse('08041234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.network).toBe('NTEL');
    }
  });

  it('parses valid Smile number', () => {
    const result = parse('07021234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.network).toBe('SMILE');
    }
  });

  it('parses valid MAFAB number', () => {
    const result = parse('08011234567');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.network).toBe('MAFAB');
    }
  });
});
