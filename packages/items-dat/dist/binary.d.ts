import { Buffer } from "buffer";
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
export declare class BinaryWriter {
    buff: Buffer[];
    length: number;
    constructor();
    write_short(value: number): void;
    write_int(value: number, len?: number): void;
    write_char(value: number): void;
    write_str(str: string): void;
    write_xorenc(ID: number, str: string): void;
    toBuffer(): Buffer;
}
