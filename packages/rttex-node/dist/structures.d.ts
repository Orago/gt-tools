export declare class RTFileHeader {
    fileTypeId: string;
    version: number;
    reversed: number;
    deserialize(buffer: Buffer, pos?: number): number;
    serialize(): Buffer;
}
export declare class RTPackHeader {
    rtFileHeader: RTFileHeader;
    compressedSize: number;
    decompressedSize: number;
    compressionType: number;
    reversed: number;
    constructor();
    deserialize(buffer: Buffer, pos?: number): number;
    serialize(): Buffer;
}
export declare class RTTEXHeader {
    rtFileHeader: RTFileHeader;
    height: number;
    width: number;
    format: number;
    originalHeight: number;
    originalWidth: number;
    usesAlpha: number;
    aleardyCompressed: number;
    mipmapCount: number;
    reversedFlags: number;
    reversed: number;
    constructor();
    deserialize(buffer: Buffer, pos?: number): number;
    serialize(): Buffer;
}
export declare class RTTEXMipHeader {
    width: number;
    height: number;
    dataSize: number;
    mipLevel: number;
    reversed: number;
    deserialize(buffer: Buffer, pos?: number): number;
    serialize(): Buffer;
}
