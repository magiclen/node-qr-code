declare module "magic-qr-code" {
    /**
     * Encode a string or a buffer to a QR Code.
     * @param {(Buffer|String)!} data
     * @param {number!} [errorCollection] = 0
     * @returns {Array<Buffer> | boolean} If any error happens, it will return false.
     */
    export function encode(data: Buffer | string, errorCollection: number): Array<Buffer> | boolean;
}