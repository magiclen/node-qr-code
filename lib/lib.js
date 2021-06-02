"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.ErrorCollection = void 0;
const QRCode = require("../index.node");
var ErrorCollection;
(function (ErrorCollection) {
    ErrorCollection[ErrorCollection["Low"] = 0] = "Low";
    ErrorCollection[ErrorCollection["Medium"] = 1] = "Medium";
    ErrorCollection[ErrorCollection["Quartile"] = 2] = "Quartile";
    ErrorCollection[ErrorCollection["High"] = 3] = "High";
})(ErrorCollection = exports.ErrorCollection || (exports.ErrorCollection = {}));
const encode = (data, errorCollection = ErrorCollection.Low) => {
    return QRCode.encode(data, errorCollection);
};
exports.encode = encode;
