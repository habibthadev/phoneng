import type { BatchResult, Network } from './types.js';
import { parse } from './parser.js';

export function parseMany(inputs: string[]): BatchResult {
  const results = inputs.map((input) => parse(input));

  const valid = results.filter((r) => r.valid).length;
  const invalid = results.length - valid;

  const byNetwork: Record<Network, number> = {
    MTN: 0,
    AIRTEL: 0,
    GLO: 0,
    NINE_MOBILE: 0,
    NTEL: 0,
    VISAFONE: 0,
    SMILE: 0,
    MAFAB: 0,
    UNKNOWN: 0,
  };

  for (const result of results) {
    if (result.valid) {
      byNetwork[result.network]++;
    }
  }

  return {
    results,
    summary: {
      total: results.length,
      valid,
      invalid,
      byNetwork,
    },
  };
}
