'use strict';

const expect = require('chai').expect;
const QRCode = require('../index');

describe('Encode QR Code', function () {
  it('should encode a V1 QR code.', function () {
    let result = QRCode.encode('https://magiclen.org'.toUpperCase());
    expect(result.length).to.equal(21);
  });
  it('should encode a V2 QR code.', function () {
    let result = QRCode.encode('https://magiclen.org');
    expect(result.length).to.equal(25);
  });
});