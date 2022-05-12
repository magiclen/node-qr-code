"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.ErrorCorrection = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QRCode = require("../index.node");
var ErrorCorrection;
(function (ErrorCorrection) {
    ErrorCorrection[ErrorCorrection["Low"] = 0] = "Low";
    ErrorCorrection[ErrorCorrection["Medium"] = 1] = "Medium";
    ErrorCorrection[ErrorCorrection["Quartile"] = 2] = "Quartile";
    ErrorCorrection[ErrorCorrection["High"] = 3] = "High";
})(ErrorCorrection = exports.ErrorCorrection || (exports.ErrorCorrection = {}));
const encode = (data, errorCorrection = ErrorCorrection.Low) => {
    return QRCode.encode(data, errorCorrection);
};
exports.encode = encode;
