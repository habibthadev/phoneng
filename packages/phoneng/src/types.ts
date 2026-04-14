export type Network =
  | 'MTN'
  | 'AIRTEL'
  | 'GLO'
  | 'NINE_MOBILE'
  | 'NTEL'
  | 'VISAFONE'
  | 'SMILE'
  | 'MAFAB'
  | 'UNKNOWN';

export type NumberType = 'MOBILE' | 'LANDLINE' | 'TOLL_FREE' | 'SPECIAL' | 'UNKNOWN';

export type ParseErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_CHARACTERS'
  | 'INVALID_LENGTH'
  | 'INVALID_COUNTRY_CODE'
  | 'INVALID_PREFIX'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'NOT_NIGERIAN';

export type ParseSuccess = {
  valid: true;
  e164: string;
  national: string;
  international: string;
  compact: string;
  rfc3966: string;
  prefix: string;
  network: Network;
  type: NumberType;
};

export type ParseFailure = {
  valid: false;
  reason: ParseErrorCode;
  input: string;
};

export type ParseResult = ParseSuccess | ParseFailure;

export type BatchResult = {
  results: ParseResult[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    byNetwork: Record<Network, number>;
  };
};

export type PrefixEntry = {
  network: Network;
  type: NumberType;
};

export type NormalizeResult =
  | { success: true; digits: string }
  | { success: false; reason: ParseErrorCode };
