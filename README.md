QR Code For Node.js
=================================

[![CI](https://github.com/magiclen/node-qr-code/actions/workflows/ci.yml/badge.svg)](https://github.com/magiclen/node-qr-code/actions/workflows/ci.yml)

Encode QR Code by using N-API. The QR code generating library is [QR Code generator library](https://www.nayuki.io/page/qr-code-generator-library "QR Code generator library").

## Usage

### Encode QR Code

You can use `encode` function to encode a string or a buffer into QR Code data which is an array with buffers.

```javascript
const result = QRCode.encode('https://magiclen.org'.toUpperCase());
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

Encoding QR code, you can also set the error correction level by passing `ECC_L`, `ECC_M`, `ECC_Q`, `ECC_H` as the second argument.

```javascript
const result = QRCode.encode('https://magiclen.org'.toUpperCase(), QRCode.ECC_H);
```

## License

[MIT](LICENSE)
