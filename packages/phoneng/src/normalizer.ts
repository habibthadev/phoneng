import type { NormalizeResult } from './types.js';
import { COUNTRY_CODE, TRUNK_PREFIX } from './metadata.js';

const LETTER_REGEX = /[a-zA-Z]/;
const NON_DIGIT_PLUS_REGEX = /[^\d+]/g;

export function normalize(input: unknown): NormalizeResult {
  if (input === null || input === undefined || typeof input !== 'string') {
    return { success: false, reason: 'EMPTY_INPUT' };
  }

  let cleaned = input.trim();

  if (cleaned === '') {
    return { success: false, reason: 'EMPTY_INPUT' };
  }

  if (cleaned.startsWith('tel:')) {
    cleaned = cleaned.slice(4);
    if (cleaned === '') {
      return { success: false, reason: 'EMPTY_INPUT' };
    }
  }

  if (LETTER_REGEX.test(cleaned)) {
    return { success: false, reason: 'INVALID_CHARACTERS' };
  }

  const digitsOnly = cleaned.replace(NON_DIGIT_PLUS_REGEX, '');

  if (digitsOnly === '') {
    return { success: false, reason: 'EMPTY_INPUT' };
  }

  let working = digitsOnly;

  if (working.startsWith('+')) {
    working = working.slice(1);
  }

  if (working.startsWith(COUNTRY_CODE)) {
    working = working.slice(COUNTRY_CODE.length);
  } else if (working.startsWith(TRUNK_PREFIX)) {
    working = working.slice(TRUNK_PREFIX.length);
  }

  if (working.length === 0) {
    return { success: false, reason: 'EMPTY_INPUT' };
  }

  return { success: true, digits: working };
}
