import { describe, it } from "mocha";
import { expect } from "chai";

import * as QRCode from "..";

describe("Encode QR Code", function () {
    it("should encode a V1 QR code.", function () {
        const result = QRCode.encode("https://magiclen.org".toUpperCase());
        expect(result.length).to.equal(21);
    });

    it("should encode a V2 QR code.", function () {
        const result = QRCode.encode("https://magiclen.org");
        expect(result.length).to.equal(25);
    });
});
