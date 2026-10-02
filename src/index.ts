import type { Buffer } from "node:buffer";

import { encodeBytes, encodeText } from "../native/index.cjs";
import type { NativeSymbol } from "../native/index.cjs";

export const ErrorCorrection = {
    Low: 0,
    Medium: 1,
    Quartile: 2,
    High: 3,
} as const;

export type ErrorCorrection = (typeof ErrorCorrection)[keyof typeof ErrorCorrection];

const ERROR_CORRECTION_LEVELS: readonly number[] = Object.values(ErrorCorrection);

const assertErrorCorrection = (errorCorrection: ErrorCorrection): void => {
    // Validate before N-API converts the number to an integer.
    if (!ERROR_CORRECTION_LEVELS.includes(errorCorrection)) {
        throw new RangeError("The error correction level must be 0, 1, 2 or 3!");
    }
};

// Every row is a view of the same native buffer, so no module data is copied.
const toRows = ({ size, modules }: NativeSymbol): Buffer[] =>
    Array.from({ length: size }, (_, y) => modules.subarray(y * size, (y + 1) * size));

/**
 * Encodes text into a QR Code.
 *
 * @returns One buffer for each row, where `1` is a dark module and `0` is a light module.
 */
export const encodeString = (
    data: string,
    errorCorrection: ErrorCorrection = ErrorCorrection.Low,
): Buffer[] => {
    assertErrorCorrection(errorCorrection);

    return toRows(encodeText(data, errorCorrection));
};

/**
 * Encodes bytes into a QR Code without changing them.
 *
 * @returns One buffer for each row, where `1` is a dark module and `0` is a light module.
 */
export const encodeBuffer = (
    data: Uint8Array,
    errorCorrection: ErrorCorrection = ErrorCorrection.Low,
): Buffer[] => {
    assertErrorCorrection(errorCorrection);

    return toRows(encodeBytes(data, errorCorrection));
};
