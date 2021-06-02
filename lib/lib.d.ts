/// <reference types="node" />
export declare enum ErrorCollection {
    Low = 0,
    Medium = 1,
    Quartile = 2,
    High = 3
}
export declare const encode: (data: Buffer | string, errorCollection?: ErrorCollection) => Buffer[];
