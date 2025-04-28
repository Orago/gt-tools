import { $R, BinaryReader } from './binary.js';
interface GrowtopiaDatOptions {
    version: number;
    count: number;
}
export declare class GrowtopiaItemsDat {
    version: number;
    count: number;
    date: number;
    items: {
        [key: string]: ItemData;
    };
    constructor(options: GrowtopiaDatOptions);
    compare(other: GrowtopiaItemsDat): {
        unique: any[];
    };
}
interface ItemDataRequired {
    ID: number;
    name: string;
}
export interface ItemData extends ItemDataRequired {
    editableType: number;
    itemCategory: number;
    actionType: number;
    hitsoundType: number;
    textureName: string;
    textureHash: number;
    itemKind: number;
    val1: number;
    textureX: number;
    textureY: number;
    spreadType: number;
    isStripeyWallpaper: number;
    collisionType: number;
    breakHits: number;
    dropChance: number;
    clothingType: number;
    rarity: number;
    maxAmount: number;
    extraFile: string;
    extraFileHash: number;
    audioVolume: number;
    petName: string;
    petPrefix: string;
    petSuffix: string;
    petAbility: string;
    seedBase: number;
    seedOverlay: number;
    treeBase: number;
    treeLeaves: number;
    seedColor: number;
    seedOverlayColor: number;
    unkval1: number;
    growTime: number;
    flags2: number;
    isRayman: number;
    extraOptions: string;
    texture2: string;
    extraOptions2: string;
    punchOptions?: string;
    flags3?: number;
    bodyparty?: number;
    light_source_range?: number;
    unk_7?: number;
    v15_1?: number;
    chair_texture_file?: string;
    item_renderer_file?: string;
    unk_8?: number;
    renderer_hash?: number;
}
export declare class GrowtopiaItem {
    reader: BinaryReader;
    ID: number;
    data: Partial<ItemData> & ItemDataRequired;
    constructor(reader: BinaryReader);
    parseRead(object: {
        [key: string]: $R | number;
    }): Partial<ItemData> & ItemDataRequired & {
        [key: string]: string | number;
    };
}
export {};
