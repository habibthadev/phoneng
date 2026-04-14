# phoneng

Zero-dependency TypeScript library for parsing, validating, normalizing, and formatting Nigerian phone numbers. Built with strict types, comprehensive validation, and production-grade error handling.

## Installation

```bash
npm install phoneng
```

```bash
pnpm add phoneng
```

```bash
yarn add phoneng
```

## Features

- Zero runtime dependencies
- Full TypeScript support with strict types
- Supports all Nigerian mobile networks (MTN, Airtel, Glo, 9mobile, Ntel, Smile, MAFAB)
- Handles 10+ input format variants
- Comprehensive error codes
- Batch processing
- E.164, national, international, and compact output formats
- Ultra-thin bundle (< 10KB minified + gzipped)

## Usage

### Parse a phone number

```typescript
import { parse } from "phoneng";

const result = parse("08031234567");

if (result.valid) {
  console.log(result.e164); // "+2348031234567"
  console.log(result.national); // "08031234567"
  console.log(result.international); // "+234 803 123 4567"
  console.log(result.compact); // "2348031234567"
  console.log(result.network); // "MTN"
  console.log(result.type); // "MOBILE"
  console.log(result.prefix); // "0803"
} else {
  console.log(result.reason); // ParseErrorCode
  console.log(result.input); // Original input
}
```

### Validate a phone number

```typescript
import { isValid, isPossible } from "phoneng";

isValid("08031234567"); // true
isValid("invalid"); // false

isPossible("08031234567"); // true - fast check (format + length only)
```

### Batch processing

```typescript
import { parseMany } from "phoneng";

const result = parseMany(["08031234567", "08021234567", "invalid"]);

console.log(result.summary.total); // 3
console.log(result.summary.valid); // 2
console.log(result.summary.invalid); // 1
console.log(result.summary.byNetwork); // { MTN: 1, AIRTEL: 1, ... }
```

## API Reference

### `parse(input: string): ParseResult`

Parses and validates a Nigerian phone number.

**Returns:** `ParseSuccess | ParseFailure`

```typescript
type ParseSuccess = {
  valid: true;
  e164: string;
  national: string;
  international: string;
  compact: string;
  prefix: string;
  network: Network;
  type: NumberType;
};

type ParseFailure = {
  valid: false;
  reason: ParseErrorCode;
  input: string;
};
```

### `isValid(input: string): boolean`

Fast validation using full parsing pipeline.

### `isPossible(input: string): boolean`

Faster validation checking only format and length (skips prefix lookup).

### `parseMany(inputs: string[]): BatchResult`

Batch parse multiple phone numbers.

```typescript
type BatchResult = {
  results: ParseResult[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    byNetwork: Record<Network, number>;
  };
};
```

## Input Formats

All of these formats are supported:

| Format                     | Example              |
| -------------------------- | -------------------- |
| Local with trunk prefix    | `08031234567`        |
| Local without trunk prefix | `8031234567`         |
| International without plus | `2348031234567`      |
| E.164                      | `+2348031234567`     |
| E.164 with spaces          | `+234 803 123 4567`  |
| With dashes                | `0803-123-4567`      |
| With spaces                | `0803 123 4567`      |
| With parentheses           | `(0803) 123 4567`    |
| RFC3966                    | `tel:+2348031234567` |

## Output Formats

| Format          | Description                       | Example             |
| --------------- | --------------------------------- | ------------------- |
| `e164`          | E.164 international format        | `+2348031234567`    |
| `national`      | National format with trunk prefix | `08031234567`       |
| `international` | Formatted international           | `+234 803 123 4567` |
| `compact`       | Compact international (no plus)   | `2348031234567`     |

## Network Coverage

| Network | Prefixes                                                                           |
| ------- | ---------------------------------------------------------------------------------- |
| MTN     | 0703, 0704, 0706, 0707, 0803, 0806, 0810, 0813, 0814, 0816, 0903, 0906, 0913, 0916 |
| Airtel  | 0701, 0708, 0802, 0808, 0812, 0901, 0902, 0904, 0907, 0911, 0912                   |
| Glo     | 0705, 0805, 0807, 0811, 0815, 0905, 0915                                           |
| 9mobile | 0809, 0817, 0818, 0908, 0909                                                       |
| Ntel    | 0804                                                                               |
| Smile   | 0702                                                                               |
| MAFAB   | 0801                                                                               |

## Error Codes

| Code                 | Description                    | Example Input    |
| -------------------- | ------------------------------ | ---------------- |
| `EMPTY_INPUT`        | Empty or whitespace-only input | `""`, `"   "`    |
| `INVALID_CHARACTERS` | Contains non-digit characters  | `"0803abc4567"`  |
| `INVALID_LENGTH`     | Wrong number of digits         | -                |
| `INVALID_PREFIX`     | Prefix not in NCC registry     | `"01231234567"`  |
| `TOO_SHORT`          | Fewer than 10 digits           | `"080312345"`    |
| `TOO_LONG`           | More than 10 digits            | `"080312345678"` |
| `NOT_NIGERIAN`       | Non-Nigerian country code      | `"+14155551234"` |

## Bundle Size

Target: < 10KB minified + gzipped

## Development

### Run tests

```bash
pnpm test
```

### Run tests with coverage

```bash
pnpm test:coverage
```

### Run benchmarks

```bash
pnpm bench
```

### Type check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

### Build

```bash
pnpm build
```

## Contributing

Contributions are welcome. Please ensure:

1. All tests pass (`pnpm test`)
2. Coverage thresholds are met (95% lines, 90% branches)
3. Type checking passes (`pnpm typecheck`)
4. Linting passes (`pnpm lint`)
5. Code follows existing patterns

## License

MIT
