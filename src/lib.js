const QRCode = require("bindings")("magic-qr-code");

QRCode.ECC_L = 0;
QRCode.ECC_M = 1;
QRCode.ECC_Q = 2;
QRCode.ECC_H = 3;

module.exports = QRCode;
