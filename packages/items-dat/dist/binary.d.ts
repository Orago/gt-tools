import { Buffer } from 'buffer';
export declare enum $R {
    int = "i",
    char = "c",
    short = "s",
    readNextOn = "-",
    readNextOff = "+"
}
export declare class BinaryReader {
    buff: Buffer;
    index: number;
    constructor(buf: Buffer);
    read_short(): number;
    read_int(l?: number): number;
    read_char(): number;
    read_str(): string;
    read_xordec(ID: number, encoded?: boolean): string;
    readNext(value: $R | number, ID: number): string | number;
}
