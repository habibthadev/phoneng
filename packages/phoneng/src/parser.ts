import type { ParseResult } from './types.js';
import { normalize } from './normalizer.js';
import {
  PREFIX_MAP,
  MOBILE_LENGTH,
  TRUNK_PREFIX,
  COUNTRY_CODE,
  E164_PREFIX,
  INTL_PREFIX,
} from './metadata.js';

export function parse(input: string): ParseResult {
  const normalized = normalize(input);

  if (!normalized.success) {
    return {
      valid: false,
      reason: normalized.reason,
      input,
    };
  }

  const digits = normalized.digits;
  const len = digits.length;

  if (len !== MOBILE_LENGTH) {
    return {
      valid: false,
      reason: len < MOBILE_LENGTH ? 'TOO_SHORT' : 'TOO_LONG',
      input,
    };
  }

  const prefix3 = digits.slice(0, 3);
  const prefixKey = `${TRUNK_PREFIX}${prefix3}`;
  const prefixEntry = PREFIX_MAP[prefixKey];

  if (!prefixEntry) {
    return {
      valid: false,
      reason: 'INVALID_PREFIX',
      input,
    };
  }

  return {
    valid: true,
    e164: `${E164_PREFIX}${digits}`,
    national: `${TRUNK_PREFIX}${digits}`,
    international: `${INTL_PREFIX}${prefix3} ${digits.slice(3, 6)} ${digits.slice(6)}`,
    compact: `${COUNTRY_CODE}${digits}`,
    rfc3966: `tel:${E164_PREFIX}${digits}`,
    prefix: prefixKey,
    network: prefixEntry.network,
    type: prefixEntry.type,
  };
}
