magic-qr-code
=================================

[![CI](https://github.com/magiclen/node-qr-code/actions/workflows/ci.yml/badge.svg)](https://github.com/magiclen/node-qr-code/actions/workflows/ci.yml)

Encode QR Code by using N-API. The QR code generating library is [QR Code generator library](https://www.nayuki.io/page/qr-code-generator-library "QR Code generator library")

You need to set up the Rust development environment: [rustup](https://rustup.rs/)

## Usage

### Encode QR Code

You can use the `encode_string` function to encode a string or use the `encode_buffer` function to encode a buffer into QR Code data which is an array of buffers (`Buffer[]`).

```typescript
import { encode_string } from "magic-qr-code";

const result = encode_string('https://magiclen.org'.toUpperCase());
/*
 [
  <Buffer 01 01 01 01 01 01 01 00 01 01 00 00 01 00 01 01 01 01 01 01 01>,
  <Buffer 01 00 00 00 00 00 01 00 01 01 01 00 00 00 01 00 00 00 00 00 01>,
  <Buffer 01 00 01 01 01 00 01 00 01 01 01 00 00 00 01 00 01 01 01 00 01>,
  <Buffer 01 00 01 01 01 00 01 00 00 01 01 01 00 00 01 00 01 01 01 00 01>,
  <Buffer 01 00 01 01 01 00 01 00 01 00 00 01 01 00 01 00 01 01 01 00 01>,
  <Buffer 01 00 00 00 00 00 01 00 00 01 00 01 01 00 01 00 00 00 00 00 01>,
  <Buffer 01 01 01 01 01 01 01 00 01 00 01 00 01 00 01 01 01 01 01 01 01>,
  <Buffer 00 00 00 00 00 00 00 00 00 01 01 00 00 00 00 00 00 00 00 00 00>,
  <Buffer 01 00 00 01 01 01 01 01 01 00 00 01 00 01 00 00 01 00 01 01 01>,
  <Buffer 01 00 01 00 01 01 00 01 01 01 01 01 01 01 00 01 01 00 00 00 00>,
  <Buffer 00 00 01 00 01 00 01 00 01 01 01 01 00 00 01 00 00 01 00 00 00>,
  <Buffer 00 01 01 01 01 00 00 01 01 01 01 00 01 01 00 00 01 00 01 01 00>,
  <Buffer 00 01 00 01 00 01 01 00 01 01 01 01 00 01 01 01 00 01 00 01 01>,
  <Buffer 00 00 00 00 00 00 00 00 01 01 00 00 00 01 00 00 01 01 01 00 00>,
  <Buffer 01 01 01 01 01 01 01 00 01 00 01 00 00 01 00 00 00 01 01 01 00>,
  <Buffer 01 00 00 00 00 00 01 00 01 00 01 01 00 01 00 01 00 01 01 00 00>,
  <Buffer 01 00 01 01 01 00 01 00 01 01 01 00 01 00 01 01 00 01 01 00 00>,
  <Buffer 01 00 01 01 01 00 01 00 01 00 00 00 00 01 00 01 01 00 01 00 00>,
  <Buffer 01 00 01 01 01 00 01 00 00 01 00 00 00 00 01 00 00 01 00 01 01>,
  <Buffer 01 00 00 00 00 00 01 00 00 00 00 00 00 00 01 01 00 00 01 01 00>,
  <Buffer 01 01 01 01 01 01 01 00 01 01 00 01 01 01 00 00 00 01 00 01 00>
 ]
*/
```

Encoding QR code, you can also set the error correction level by passing a `ErrorCorrection` number to the second argument.

```typescript
import { encode_string, ErrorCorrection } from "magic-qr-code";

const result = encode_string('https://magiclen.org'.toUpperCase(), ErrorCorrection.High);
```

## License

[MIT](LICENSE)