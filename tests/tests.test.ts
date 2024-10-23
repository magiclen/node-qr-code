import { encodeBuffer, encodeString } from "../src/lib.js";

describe("Encode QR Code", () => {
    it("should encode a V1 QR code.", () => {
        const data = "https://magiclen.org".toUpperCase();

        const result1 = encodeString(data);
        const result2 = encodeBuffer(Buffer.from(data, "utf-8"));

        expect(result1.length).toBe(21);
        expect(result2.length).toBe(21);
    });

    it("should encode a V2 QR code.", () => {
        const data = "https://magiclen.org";

        const result1 = encodeString(data);
        const result2 = encodeBuffer(Buffer.from(data, "utf-8"));

        expect(result1.length).toBe(25);
        expect(result2.length).toBe(25);
    });
});
