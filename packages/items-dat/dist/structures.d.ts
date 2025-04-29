import { $R, BinaryReader } from "./binary.js";
interface GrowtopiaDatOptions {
    version: number;
    count: number;
}
export declare class GrowtopiaItemsDat {
    version: number;
    count: number;
    date: number;
    items: Record<string, ItemData>;
    constructor(options: GrowtopiaDatOptions);
    compare(other: GrowtopiaItemsDat): {
        unique: any[];
    };
}
interface ItemDataRequired {
    id: number;
    name: string;
}
export interface ItemData extends ItemDataRequired {
    editable_type: number;
    item_category: number;
    action_type: number;
    hitsound_type: number;
    texture_name: string;
    texture_hash: number;
    item_kind: number;
    val1: number;
    texture_x: number;
    texture_y: number;
    spread_type: number;
    is_stripey_wallpaper: number;
    collision_type: number;
    break_hits: number;
    drop_chance: number;
    clothing_type: number;
    rarity: number;
    max_amount: number;
    extra_file: string;
    extra_file_hash: number;
    audio_volume: number;
    pet_name: string;
    pet_prefix: string;
    pet_suffix: string;
    pet_ability: string;
    seed_base: number;
    seed_overlay: number;
    tree_base: number;
    tree_leaves: number;
    seed_color: number;
    seed_overlay_color: number;
    unkval_1: number;
    grow_time: number;
    flags_2: number;
    is_rayman: number;
    extra_options: string;
    texture_2: string;
    extra_options_2: string;
    punch_options?: string;
    flags_3?: number;
    body_part?: number;
    light_source_range?: number;
    flags_5?: number;
    v15_1?: number;
    chair_texture_file?: string;
    item_renderer_file?: string;
    unk_8?: number;
    renderer_hash?: number;
}
export declare class GrowtopiaItem {
    reader: BinaryReader;
    id: number;
    data: Partial<ItemData> & ItemDataRequired;
    constructor(reader: BinaryReader);
    parseRead(object: Record<string, $R | number>): Partial<ItemData> & ItemDataRequired & Record<string, string | number>;
}
export {};
