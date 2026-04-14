import { parse } from './parser.js';
import { normalize } from './normalizer.js';
import { MOBILE_LENGTH } from './metadata.js';

export function isValid(input: string): boolean {
  const result = parse(input);
  return result.valid;
}

export function isPossible(input: string): boolean {
  const normalized = normalize(input);

  if (!normalized.success) {
    return false;
  }

  const digits = normalized.digits;

  if (digits.length !== MOBILE_LENGTH) {
    return false;
  }

  return true;
}
