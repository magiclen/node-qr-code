const QRCode = require("../index.node");

export enum ErrorCollection {
    Low = 0,
    Medium = 1,
    Quartile,
    High,
}

export const encode = (data: Buffer | string, errorCollection: ErrorCollection = ErrorCollection.Low): Buffer[] => {
    return QRCode.encode(data, errorCollection);
};
