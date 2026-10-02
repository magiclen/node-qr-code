import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { describe, it } from "node:test";

import {
    ErrorCorrection,
    MicroErrorCorrection,
    encodeBuffer,
    encodeMicroQr,
    encodeQr,
    encodeRmqr,
    encodeString,
} from "../src/index.ts";

describe("Encode QR Code", () => {
    it("encodes a V1 QR code", () => {
        const data = "https://magiclen.org".toUpperCase();

        assert.equal(encodeString(data).length, 21);
        assert.equal(encodeBuffer(Buffer.from(data, "utf8")).length, 21);
    });

    it("encodes a V2 QR code", () => {
        const data = "https://magiclen.org";

        assert.equal(encodeString(data).length, 25);
        assert.equal(encodeBuffer(Buffer.from(data, "utf8")).length, 25);
    });

    it("returns one buffer of 0 and 1 for each row", () => {
        const rows = encodeString("https://magiclen.org");

        for (const row of rows) {
            assert.ok(Buffer.isBuffer(row));
            assert.equal(row.length, rows.length);
            assert.ok(row.every((module) => module === 0 || module === 1));
        }
    });

    it("accepts a plain Uint8Array, not only a Buffer", () => {
        const data = "https://magiclen.org";

        assert.deepEqual(encodeBuffer(new TextEncoder().encode(data)), encodeString(data));
    });

    it("uses a larger symbol for a higher error correction level", () => {
        const data = "https://magiclen.org".toUpperCase();

        assert.ok(encodeString(data, ErrorCorrection.High).length > encodeString(data).length);
    });

    it("rejects an unsupported error correction level", () => {
        // The assertion is deliberate: this checks the runtime guard that protects JavaScript callers.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const errorCorrection = 1.5 as unknown as ErrorCorrection;

        assert.throws(() => encodeString("magiclen", errorCorrection), RangeError);
    });
});

describe("Symbol", () => {
    it("exposes the size, the version and the rows of a QR code", () => {
        const symbol = encodeQr("https://magiclen.org");

        assert.equal(symbol.width, 25);
        assert.equal(symbol.height, 25);
        assert.equal(symbol.version, 2);
        assert.deepEqual(symbol.rows, encodeString("https://magiclen.org"));
    });
});

describe("Encode Micro QR Code", () => {
    it("encodes short data into a Micro QR code", () => {
        const symbol = encodeMicroQr("12345");

        assert.equal(symbol.version, "M2");
        assert.equal(symbol.width, 13);
        assert.equal(symbol.rows.length, 13);
    });

    it("uses version M1 for the detection-only level", () => {
        const symbol = encodeMicroQr("12345", MicroErrorCorrection.DetectionOnly);

        assert.equal(symbol.version, "M1");
        assert.equal(symbol.errorCorrection, MicroErrorCorrection.DetectionOnly);
    });
});

describe("Encode rMQR", () => {
    it("encodes data into a rectangular symbol", () => {
        const symbol = encodeRmqr("https://magiclen.org");

        assert.equal(symbol.version, "R9x59");
        assert.equal(symbol.width, 59);
        assert.equal(symbol.height, 9);
        assert.equal(symbol.rows.length, 9);
        assert.ok(symbol.rows.every((row) => row.length === 59));
    });
});

describe("Render SVG", () => {
    it("renders a square SVG image with an XML declaration", () => {
        const svg = encodeQr("https://magiclen.org").toSvg(512);

        assert.match(svg, /^<\?xml /);
        assert.match(svg, /<svg width="512" height="512" /);
    });

    it("renders an SVG image with the given dimensions and options", () => {
        const svg = encodeRmqr("https://magiclen.org").toSvg(860, 140, {
            description: "",
            xmlDeclaration: false,
        });

        assert.match(svg, /^<svg width="860" height="140" /);
        assert.doesNotMatch(svg, /<desc>/);
    });
});
