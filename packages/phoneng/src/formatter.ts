import { COUNTRY_CODE, TRUNK_PREFIX } from './metadata.js';

export function toE164(national10: string): string {
  return `+${COUNTRY_CODE}${national10}`;
}

export function toNational(national10: string): string {
  return `${TRUNK_PREFIX}${national10}`;
}

export function toInternational(national10: string): string {
  const part1 = national10.slice(0, 3);
  const part2 = national10.slice(3, 6);
  const part3 = national10.slice(6);
  return `+${COUNTRY_CODE} ${part1} ${part2} ${part3}`;
}

export function toCompact(national10: string): string {
  return `${COUNTRY_CODE}${national10}`;
}

export function toRFC3966(national10: string): string {
  return `tel:+${COUNTRY_CODE}${national10}`;
}
