import { RTPackHeader, RTTEXHeader } from './structures.js';
import { Buffer as Buff } from 'buffer';
export declare class RTFileToImage {
    rttexHeader: RTTEXHeader;
    rtpackHeader: RTPackHeader;
    buffer: Buffer;
    pos: number;
    constructor(buffer: Buffer, pos?: number);
    rawData(): Promise<Buff | null | undefined>;
}
export declare class ImageToRTFile {
    buffer: Buffer;
    constructor(buffer: Buffer);
    getImageSize(): Promise<void>;
    getImageLowestOf2Size(): Promise<void>;
    rawData(): Promise<void>;
}
