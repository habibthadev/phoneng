# phoneng

Zero-dependency TypeScript library for parsing, validating, normalizing, and formatting Nigerian phone numbers. Built with strict types, comprehensive validation, and production-grade error handling.

## Installation

```bash
npm install phoneng
```

## Usage

```typescript
import { parse, isValid, parseMany } from 'phoneng';

const result = parse('08031234567');
if (result.valid) {
  console.log(result.network); // "MTN"
  console.log(result.e164); // "+2348031234567"
  console.log(result.international); // "+234 803 123 4567"
}

isValid('08031234567'); // true
isPossible('08031234567'); // true

const batch = parseMany(['08031234567', '08021234567']);
console.log(batch.summary.byNetwork); // { MTN: 1, AIRTEL: 1, ... }
```

See the [main README](../../README.md) for complete documentation.

## License

MIT
