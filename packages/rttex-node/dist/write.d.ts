import { ImageToRTFile, RTFileToImage } from './rttexParser.js';
export declare function writeImageToRttex(ITRF: ImageToRTFile, path: string): Promise<boolean>;
export declare function writeRttexToImage(RFTI: RTFileToImage, path: string, flipVertical?: boolean): Promise<unknown>;
