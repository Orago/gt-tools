export { rttexToImage } from "./rttexToImage.js";
import { Buffer } from "buffer";
import { GrowtopiaItemsDat, ItemData } from "./structures.js";
interface ParseOptions {
    buffer: Buffer;
    filter?: (param0: any, param1: any) => boolean;
    with_item?: (param0: ItemData) => any;
}
export declare function parseItemsDat(options: ParseOptions): GrowtopiaItemsDat;
