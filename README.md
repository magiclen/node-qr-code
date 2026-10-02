magic-qr-code
=================================

[![CI](https://github.com/magiclen/node-qr-code/actions/workflows/ci.yml/badge.svg)](https://github.com/magiclen/node-qr-code/actions/workflows/ci.yml)

Encode QR Code, Micro QR Code and rMQR (Rectangular Micro QR Code) symbols, and render them as SVG images, by using N-API. The encoding is done by the Rust crate [qrcode-generator](https://crates.io/crates/qrcode-generator), which automatically chooses the shortest mix of Numeric, Alphanumeric and Byte segments for your data.

## Requirements and Installation

Node.js 24 or later and Rust 1.89 or later are required. Install Rust with [rustup](https://rustup.rs/) and the native linker for your platform (a C compiler on Linux/macOS or the MSVC build tools on Windows).

```sh
npm install magic-qr-code
```

Installation compiles the native module from source using the included `Cargo.lock`. There are no prebuilt platform packages. Package managers that block dependency build scripts must allow the `magic-qr-code` install script; for pnpm, approve `magic-qr-code` with `pnpm approve-builds` and rebuild it with `pnpm rebuild magic-qr-code`. If npm requires script approval, use `npm install-scripts approve magic-qr-code` followed by `npm rebuild magic-qr-code`.

## Usage

### Encode QR Code

You can use the `encodeString` function to encode a string or use the `encodeBuffer` function to encode a `Buffer` or a `Uint8Array` into QR Code data, which is an array of buffers (`Buffer[]`). Each buffer is one row of the symbol, where `1` is a dark module and `0` is a light module.

```typescript
import { encodeString } from "magic-qr-code";

const result = encodeString("https://magiclen.org".toUpperCase());
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

The rows are views of one shared buffer, so the module data is created only once.

### Error Correction

A higher error correction level makes a symbol easier to scan when it is dirty or damaged, but leaves less room for data. You can set the level by passing an `ErrorCorrection` value (`Low`, `Medium`, `Quartile` or `High`) to the second argument. It defaults to `Low`.

```typescript
import { encodeString, ErrorCorrection } from "magic-qr-code";

const result = encodeString("https://magiclen.org".toUpperCase(), ErrorCorrection.High);
```

When the chosen symbol has spare room, the level is raised automatically for free, so the level written to the symbol can be higher than the requested one. A level that is not supported throws a `RangeError`.

### Text and Bytes

A string is encoded as text. Characters in ISO-8859-1, the default character set of QR Code, are stored as ISO-8859-1 bytes, except the C1 control characters (U+0080 to U+009F). Other characters, such as Chinese or emoji, are stored as UTF-8 behind an ECI (Extended Channel Interpretation) header that tells the scanner the character set.

A `Buffer` or a `Uint8Array` is stored as the exact bytes, without any ECI header. For example, `encodeBuffer(Buffer.from(text, "utf8"))` stores UTF-8 bytes and leaves the scanner to guess their character set.

Data that is too long for the largest symbol throws an error.

### Symbols

The `encodeQr` function accepts a string or a `Uint8Array` and returns a symbol object, which gives you more information about the result and can be rendered as an SVG image.

```typescript
import { encodeQr, ErrorCorrection } from "magic-qr-code";

const symbol = encodeQr("https://magiclen.org", ErrorCorrection.Low);

console.log(symbol.width); // 25
console.log(symbol.height); // 25
console.log(symbol.version); // 2
console.log(symbol.errorCorrection === ErrorCorrection.Quartile); // true, raised automatically

const rows = symbol.rows; // the same as the result of `encodeString`
```

### Micro QR Code

Micro QR Code is smaller than QR Code and suits short data. It has four versions, from M1 (11 × 11 modules) to M4 (17 × 17 modules). Use the `encodeMicroQr` function with a `MicroErrorCorrection` value (`DetectionOnly`, `Low`, `Medium` or `Quartile`), which defaults to `Low`.

```typescript
import { encodeMicroQr } from "magic-qr-code";

const symbol = encodeMicroQr("12345");

console.log(symbol.version); // "M2"
console.log(symbol.width); // 13
```

`DetectionOnly` finds errors without correcting them, and only version M1 uses it. Micro QR Code has no ECI, so a string can only contain ISO-8859-1 characters, except the C1 control characters (U+0080 to U+009F).

### rMQR

rMQR (Rectangular Micro QR Code) has 32 rectangular versions, such as R7x43 and R17x139, and suits long and narrow spaces. Use the `encodeRmqr` function with an `RmqrErrorCorrection` value (`Medium` or `High`), which defaults to `Medium`. The version with the smallest area that fits the data is chosen.

```typescript
import { encodeRmqr } from "magic-qr-code";

const symbol = encodeRmqr("https://magiclen.org");

console.log(symbol.version); // "R9x59"
console.log(symbol.width); // 59
console.log(symbol.height); // 9
```

### Render SVG

Call the `toSvg` method of a symbol with the image size in pixels. Pass one number for a square image, or the width and the height for a rectangular one. The modules are scaled by the largest whole number that fits, and any pixels left over widen the quiet zone (the plain margin around the symbol) evenly.

```typescript
import { encodeQr, encodeRmqr } from "magic-qr-code";

const svg = encodeQr("https://magiclen.org").toSvg(512);

const rmqrSvg = encodeRmqr("https://magiclen.org").toSvg(630, 130);
```

The last argument is an optional object.

- `description`: the text of the `<desc>` element. An empty string leaves the element out.
- `quietZone`: the minimum quiet zone in modules. It defaults to 4 for QR Code and 2 for Micro QR Code and rMQR.
- `xmlDeclaration`: whether the SVG starts with an XML declaration. It defaults to `true`. Set it to `false` when the SVG is put directly into an HTML page.

```typescript
import { encodeQr } from "magic-qr-code";

const svg = encodeQr("https://magiclen.org").toSvg(256, {
    description: "",
    xmlDeclaration: false,
});
/*
<svg width="256" height="256" shape-rendering="crispEdges" version="1.1" xmlns="http://www.w3.org/2000/svg">
	<rect width="256" height="256" fill="#FFF"/>
	<path d="M40 40h49v7H40V40M96 40h14v7H96V40 ... "/>
</svg>
*/
```

An image that is too small to draw the whole symbol with its quiet zone throws an error.

## License

[MIT](LICENSE)
