declare module "magic-qr-code" {
    export function encode(data: Buffer | string, errorCollection: number): Buffer[] | false;
}