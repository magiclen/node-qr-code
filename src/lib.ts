const QRCode = require("../index.node");

export enum ErrorCorrection {
    Low = 0,
    Medium = 1,
    Quartile,
    High,
}

export const encode = (data: Buffer | string, errorCorrection: ErrorCorrection = ErrorCorrection.Low): Buffer[] => {
    return QRCode.encode(data, errorCorrection);
};
