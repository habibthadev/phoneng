# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-07

### Added

- Initial release of phoneng
- Parse Nigerian phone numbers with comprehensive validation
- Support for mobile (MTN, Airtel, Glo, 9mobile, Ntel, Smile, MAFAB) and landline numbers
- Multiple output formats: E.164, national, international, compact
- RFC 3966 telephone URI format support
- Network detection for all Nigerian mobile operators
- Batch processing with statistics
- Zero runtime dependencies
- Full TypeScript support with strict mode
- 67 tests with 98.5% code coverage
- Ultra-thin bundle size: 950B ESM / 962B CJS (brotli compressed)
- Based on official NCC (Nigerian Communications Commission) numbering plan

[1.0.0]: https://github.com/habibthadev/phoneng/releases/tag/v1.0.0
