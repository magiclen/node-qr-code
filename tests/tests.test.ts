import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { describe, it } from "node:test";

import { ErrorCorrection, encodeBuffer, encodeString } from "../src/index.ts";

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
