import { describe, it, expect } from 'vitest';
import { parseMany } from '../src/index.js';

describe('batch', () => {
  it('handles empty array', () => {
    const result = parseMany([]);
    expect(result.results).toHaveLength(0);
    expect(result.summary.total).toBe(0);
    expect(result.summary.valid).toBe(0);
    expect(result.summary.invalid).toBe(0);
  });

  it('processes mixed valid and invalid numbers', () => {
    const inputs = ['08031234567', 'invalid', '08021234567', '123', '08051234567'];

    const result = parseMany(inputs);

    expect(result.results).toHaveLength(5);
    expect(result.summary.total).toBe(5);
    expect(result.summary.valid).toBe(3);
    expect(result.summary.invalid).toBe(2);
  });

  it('counts by network correctly', () => {
    const inputs = [
      '08031234567',
      '08032234567',
      '08021234567',
      '08022234567',
      '08051234567',
      '08091234567',
    ];

    const result = parseMany(inputs);

    expect(result.summary.byNetwork.MTN).toBe(2);
    expect(result.summary.byNetwork.AIRTEL).toBe(2);
    expect(result.summary.byNetwork.GLO).toBe(1);
    expect(result.summary.byNetwork.NINE_MOBILE).toBe(1);
  });

  it('does not mutate input array', () => {
    const inputs = ['08031234567', '08021234567'];
    const inputsCopy = [...inputs];

    parseMany(inputs);

    expect(inputs).toEqual(inputsCopy);
  });

  it('handles all invalid inputs', () => {
    const inputs = ['invalid1', 'invalid2', '123'];

    const result = parseMany(inputs);

    expect(result.summary.valid).toBe(0);
    expect(result.summary.invalid).toBe(3);
    expect(Object.values(result.summary.byNetwork).every((count) => count === 0)).toBe(
      true,
    );
  });

  it('handles all valid inputs across networks', () => {
    const inputs = [
      '08031234567',
      '08021234567',
      '08051234567',
      '08091234567',
      '08041234567',
      '07021234567',
      '08011234567',
    ];

    const result = parseMany(inputs);

    expect(result.summary.valid).toBe(7);
    expect(result.summary.invalid).toBe(0);
    expect(result.summary.byNetwork.MTN).toBe(1);
    expect(result.summary.byNetwork.AIRTEL).toBe(1);
    expect(result.summary.byNetwork.GLO).toBe(1);
    expect(result.summary.byNetwork.NINE_MOBILE).toBe(1);
    expect(result.summary.byNetwork.NTEL).toBe(1);
    expect(result.summary.byNetwork.SMILE).toBe(1);
    expect(result.summary.byNetwork.MAFAB).toBe(1);
  });
});
