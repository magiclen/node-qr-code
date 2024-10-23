import { encodeBuffer as eb, encodeString as es } from "../index.cjs";

export enum ErrorCorrection {
    Low = 0,
    Medium = 1,
    Quartile,
    High,
}

export const encodeBuffer = (
    data: Buffer,
    errorCorrection: ErrorCorrection = ErrorCorrection.Low,
): Buffer[] => eb(data, errorCorrection);

export const encodeString = (
    data: string,
    errorCorrection: ErrorCorrection = ErrorCorrection.Low,
): Buffer[] => es(data, errorCorrection);
