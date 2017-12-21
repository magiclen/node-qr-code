QR Code For Node.js
=================================

## Introduction

Encode QR Code by using N-API. The QR code generating library is [QR Code generator library](https://www.nayuki.io/page/qr-code-generator-library "QR Code generator library").

NOTICE: N-API is a new experimental feature in Node.js 8.

## Installation

Run `npm i` or `npm install` to install.

```bash
npm install magic-qr-code
```

If you want to save this module to package.json, please add `--save` option.

```bash
npm install magic-qr-code --save
```

## Initialization

Import this module by using `require` function.

```javascript
const QRCode = require('magic-qr-code');
```

## Usage

### Encode QR Code

You can use `encode` function to encode a string or a buffer into QR Code data which is an array with buffers.

```javascript
var result = QRCode.encode('https://magiclen.org'.toUpperCase());
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
var result = QRCode.encode('https://magiclen.org'.toUpperCase(), QRCode.ECC_H);
```

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
npm test
```

## License

[MIT](LICENSE)
