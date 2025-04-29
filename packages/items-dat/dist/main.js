"use strict";
export { rttexToImage } from "./rttexToImage.js";
import { BinaryReader } from "./binary.js";
import { GrowtopiaItem, GrowtopiaItemsDat } from "./structures.js";
function handleItem(item, itemsDat) {
    const { version } = itemsDat;
    item.data.editable_type = item.reader.read_char();
    item.data.item_category = item.reader.read_char();
    item.data.action_type = item.reader.read_char();
    item.data.hitsound_type = item.reader.read_char();
    item.data.name = item.reader.read_xordec(item.data.id, false);
    item.data.texture_name = item.reader.read_xordec(item.data.id, true);
    item.data.texture_hash = item.reader.read_int();
    item.data.item_kind = item.reader.read_char();
    item.data.val1 = item.reader.read_int();
    item.data.texture_x = item.reader.read_char();
    item.data.texture_y = item.reader.read_char();
    item.data.spread_type = item.reader.read_char();
    item.data.is_stripey_wallpaper = item.reader.read_char();
    item.data.collision_type = item.reader.read_char();
    item.data.break_hits = item.reader.read_char();
    item.data.drop_chance = item.reader.read_int();
    item.data.clothing_type = item.reader.read_char();
    item.data.rarity = item.reader.read_short();
    item.data.max_amount = item.reader.read_char();
    item.data.extra_file = item.reader.read_xordec(item.data.id, true);
    item.data.extra_file_hash = item.reader.read_int();
    item.data.audio_volume = item.reader.read_int();
    item.data.pet_name = item.reader.read_xordec(item.data.id, true);
    item.data.pet_prefix = item.reader.read_xordec(item.data.id, true);
    item.data.pet_suffix = item.reader.read_xordec(item.data.id, true);
    item.data.pet_ability = item.reader.read_xordec(item.data.id, true);
    item.data.seed_base = item.reader.read_char();
    item.data.seed_overlay = item.reader.read_char();
    item.data.tree_base = item.reader.read_char();
    item.data.tree_leaves = item.reader.read_char();
    item.data.seed_color = item.reader.read_int();
    item.data.seed_overlay_color = item.reader.read_int();
    item.data.unkval_1 = item.reader.read_int();
    item.data.grow_time = item.reader.read_int();
    item.data.flags_2 = item.reader.read_short();
    item.data.is_rayman = item.reader.read_short();
    item.data.extra_options = item.reader.read_xordec(item.data.id, true);
    item.data.texture_2 = item.reader.read_xordec(item.data.id, true);
    item.data.extra_options_2 = item.reader.read_xordec(item.data.id, true);
    item.reader.index += 80;
    if (version >= 11) {
        item.data.punch_options = item.reader.read_xordec(item.data.id, true);
    }
    if (version >= 12) {
        item.data.flags_3 = item.reader.read_int();
        item.data.body_part = item.reader.read_int(9);
    }
    if (version >= 13) {
        item.data.light_source_range = item.reader.read_int();
    }
    if (version >= 14) {
        item.data.flags_5 = item.reader.read_int();
    }
    if (version >= 15) {
        item.data.v15_1 = item.reader.read_int(25);
        item.data.chair_texture_file = item.reader.read_str();
    }
    if (version >= 16) {
        item.data.item_renderer_file = item.reader.read_str();
    }
    if (version >= 17) {
        item.data.unk_8 = item.reader.read_int();
    }
    if (version >= 18) {
        item.data.renderer_hash = item.reader.read_int();
    }
    if (version >= 19) {
        item.data.v15_1 = item.reader.read_int(9);
    }
    if (version >= 21) {
        item.data.v15_1 = item.reader.read_int(2);
    }
    return item.data;
}
export function parseItemsDat(options) {
    const { filter = () => true, buffer } = options;
    try {
        const reader = new BinaryReader(buffer);
        const dat = new GrowtopiaItemsDat({
            version: reader.read_short(),
            count: reader.read_int(),
        });
        k: for (let i = 0; i < dat.count; i++) {
            try {
                const item_instance = new GrowtopiaItem(reader);
                const item_data = handleItem(item_instance, dat);
                if (!filter(item_data, dat)) {
                    continue;
                }
                dat.items[item_data.name] = item_data;
            }
            catch (e) {
                console.log("Couldn't parsed at " + i);
                break k;
            }
        }
        return dat;
    }
    catch (e) {
        console.log("[Error]:", e.stack);
        return new GrowtopiaItemsDat({
            version: -1,
            count: -1,
        });
    }
}
