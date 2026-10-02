import type { Buffer } from "node:buffer";

import {
    encodeMicroQrBytes,
    encodeMicroQrText,
    encodeQrBytes,
    encodeQrText,
    encodeRmqrBytes,
    encodeRmqrText,
} from "../native/index.cjs";
import type { NativeSymbol } from "../native/index.cjs";

/**
 * Error correction levels for QR Code.
 *
 * A higher level is easier to scan when the symbol is damaged, but it holds less data.
 */
export const ErrorCorrection = {
    Low: 0,
    Medium: 1,
    Quartile: 2,
    High: 3,
} as const;

export type ErrorCorrection = (typeof ErrorCorrection)[keyof typeof ErrorCorrection];

/**
 * Error correction levels for Micro QR Code.
 *
 * `DetectionOnly` finds errors without correcting them and is only used by version M1.
 */
export const MicroErrorCorrection = {
    DetectionOnly: 4,
    Low: 0,
    Medium: 1,
    Quartile: 2,
} as const;

export type MicroErrorCorrection = (typeof MicroErrorCorrection)[keyof typeof MicroErrorCorrection];

/** Error correction levels for rMQR (Rectangular Micro QR Code). */
export const RmqrErrorCorrection = {
    Medium: 1,
    High: 3,
} as const;

export type RmqrErrorCorrection = (typeof RmqrErrorCorrection)[keyof typeof RmqrErrorCorrection];

export interface SvgOptions {
    /**
     * The text of the `<desc>` element, or an empty string to leave the element out.
     *
     * It defaults to the name and version of the Rust library that draws the image.
     *
     * The text must only contain characters that XML 1.0 allows.
     */
    description?: string;
    /**
     * The minimum quiet zone (the plain margin around the symbol) in modules.
     *
     * It defaults to 4 for QR Code and 2 for Micro QR Code and rMQR.
     */
    quietZone?: number;
    /**
     * Whether the SVG starts with an XML declaration, which defaults to `true`.
     *
     * Set it to `false` when the SVG is put directly into an HTML page.
     */
    xmlDeclaration?: boolean;
}

/** An encoded QR Code, Micro QR Code or rMQR symbol. */
export interface QrSymbol {
    /** The symbol width in modules. */
    readonly width: number;
    /** The symbol height in modules, which differs from `width` only for rMQR. */
    readonly height: number;
    /**
     * The version of the symbol.
     *
     * It is a number (1 to 40) for QR Code, or a name such as `M2` or `R7x43` for the others.
     */
    readonly version: number | string;
    /**
     * The error correction level written to the symbol.
     *
     * It can be higher than requested, because spare room in the symbol is used to raise it.
     */
    readonly errorCorrection: ErrorCorrection | MicroErrorCorrection | RmqrErrorCorrection;
    /**
     * One buffer for each row, where `1` is a dark module and `0` is a light module.
     *
     * The rows are views of one shared buffer.
     */
    readonly rows: Buffer[];

    /**
     * Renders the symbol as a square SVG image.
     *
     * @param size The width and height of the image in pixels.
     */
    toSvg(size: number, options?: SvgOptions): string;
    /**
     * Renders the symbol as an SVG image.
     *
     * @param width The width of the image in pixels.
     * @param height The height of the image in pixels.
     */
    toSvg(width: number, height: number, options?: SvgOptions): string;
}

const QR_ERROR_CORRECTION_LEVELS: readonly number[] = Object.values(ErrorCorrection);
const MICRO_ERROR_CORRECTION_LEVELS: readonly number[] = Object.values(MicroErrorCorrection);
const RMQR_ERROR_CORRECTION_LEVELS: readonly number[] = Object.values(RmqrErrorCorrection);

// The checks below run before N-API converts a number to an integer, which would silently truncate it.

const assertErrorCorrection = (
    errorCorrection: number,
    levels: readonly number[],
    family: string,
): void => {
    if (!levels.includes(errorCorrection)) {
        throw new RangeError(`The error correction level is not supported by ${family}!`);
    }
};

const assertUint32 = (value: number, name: string): void => {
    if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) {
        throw new RangeError(`The ${name} must be an integer from 0 to 4294967295!`);
    }
};

class NativeQrSymbol implements QrSymbol {
    readonly width: number;
    readonly height: number;
    readonly version: number | string;
    readonly errorCorrection: ErrorCorrection | MicroErrorCorrection | RmqrErrorCorrection;

    readonly #native: NativeSymbol;
    #modules: Buffer | undefined;

    constructor(native: NativeSymbol) {
        this.#native = native;

        this.width = native.width;
        this.height = native.height;
        this.version = native.version;
        this.errorCorrection = native.errorCorrection;
    }

    get rows(): Buffer[] {
        // The modules are copied from Rust only once, and every row is a view of them.
        this.#modules ??= this.#native.modules();

        const modules = this.#modules;
        const width = this.width;

        return Array.from({ length: this.height }, (_, y) =>
            modules.subarray(y * width, (y + 1) * width),
        );
    }

    toSvg(size: number, options?: SvgOptions): string;
    toSvg(width: number, height: number, options?: SvgOptions): string;
    toSvg(width: number, heightOrOptions?: number | SvgOptions, options?: SvgOptions): string {
        const [height, svgOptions] =
            typeof heightOrOptions === "number"
                ? [heightOrOptions, options ?? {}]
                : [width, heightOrOptions ?? {}];
        const { description, quietZone, xmlDeclaration = true } = svgOptions;

        assertUint32(width, "width");
        assertUint32(height, "height");

        if (quietZone !== undefined) {
            assertUint32(quietZone, "quiet zone");
        }

        return this.#native.toSvg(width, height, quietZone, xmlDeclaration, description);
    }
}

/**
 * Encodes data into a QR Code.
 *
 * A string is encoded as text, and a `Uint8Array` (or a `Buffer`) is stored as the exact bytes.
 */
export const encodeQr = (
    data: string | Uint8Array,
    errorCorrection: ErrorCorrection = ErrorCorrection.Low,
): QrSymbol => {
    assertErrorCorrection(errorCorrection, QR_ERROR_CORRECTION_LEVELS, "QR Code");

    const native =
        typeof data === "string"
            ? encodeQrText(data, errorCorrection)
            : encodeQrBytes(data, errorCorrection);

    return new NativeQrSymbol(native);
};

/**
 * Encodes data into a Micro QR Code, which is smaller than QR Code and suits short data.
 *
 * A string must only use ISO-8859-1 characters, and a `Uint8Array` is stored as the exact bytes.
 */
export const encodeMicroQr = (
    data: string | Uint8Array,
    errorCorrection: MicroErrorCorrection = MicroErrorCorrection.Low,
): QrSymbol => {
    assertErrorCorrection(errorCorrection, MICRO_ERROR_CORRECTION_LEVELS, "Micro QR Code");

    const native =
        typeof data === "string"
            ? encodeMicroQrText(data, errorCorrection)
            : encodeMicroQrBytes(data, errorCorrection);

    return new NativeQrSymbol(native);
};

/**
 * Encodes data into an rMQR (Rectangular Micro QR Code) symbol, which suits narrow spaces.
 *
 * A string is encoded as text, and a `Uint8Array` (or a `Buffer`) is stored as the exact bytes.
 */
export const encodeRmqr = (
    data: string | Uint8Array,
    errorCorrection: RmqrErrorCorrection = RmqrErrorCorrection.Medium,
): QrSymbol => {
    assertErrorCorrection(errorCorrection, RMQR_ERROR_CORRECTION_LEVELS, "rMQR");

    const native =
        typeof data === "string"
            ? encodeRmqrText(data, errorCorrection)
            : encodeRmqrBytes(data, errorCorrection);

    return new NativeQrSymbol(native);
};

/**
 * Encodes text into a QR Code.
 *
 * @returns One buffer for each row, where `1` is a dark module and `0` is a light module.
 */
export const encodeString = (
    data: string,
    errorCorrection: ErrorCorrection = ErrorCorrection.Low,
): Buffer[] => encodeQr(data, errorCorrection).rows;

/**
 * Encodes bytes into a QR Code without changing them.
 *
 * @returns One buffer for each row, where `1` is a dark module and `0` is a light module.
 */
export const encodeBuffer = (
    data: Uint8Array,
    errorCorrection: ErrorCorrection = ErrorCorrection.Low,
): Buffer[] => encodeQr(data, errorCorrection).rows;
