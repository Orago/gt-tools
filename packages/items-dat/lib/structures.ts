import { $R, BinaryReader } from "./binary.js";
import { getUniqueItems } from "./util.js";

interface GrowtopiaDatOptions {
	version: number;
	count: number;
}

export class GrowtopiaItemsDat {
	version: number = -1;
	count: number = -1;
	date: number = Date.now();
	items: Record<string, ItemData> = {};

	constructor(options: GrowtopiaDatOptions) {
		this.version = options.version;
		this.count = options.count;
	}

	compare(other: GrowtopiaItemsDat) {
		if (other instanceof GrowtopiaItemsDat != true) {
			throw "Invalid items dat to compare";
		}

		const current_ids = Object.keys(this.items);
		const other_ids = Object.keys(other.items);

		const unique = getUniqueItems(current_ids, other_ids);

		return { unique };
	}
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

	/* Version 11 */
	punch_options?: string;

	/* Version 12 */
	flags_3?: number;
	body_part?: number;

	/* Version 13 */
	light_source_range?: number;

	/* Version 14 */
	flags_5?: number;

	/* Version 15 */
	v15_1?: number;
	chair_texture_file?: string;

	/* Version 16 */
	item_renderer_file?: string;

	/* Version 17 */
	unk_8?: number;

	/* Version 18 */
	renderer_hash?: number;
}

export class GrowtopiaItem {
	reader: BinaryReader;
	id: number;
	data: Partial<ItemData> & ItemDataRequired = {
		id: -1,
		name: "",
	};

	constructor(reader: BinaryReader) {
		this.reader = reader;

		this.id = reader.read_int();
		this.data.id = this.id;
	}

	parseRead(object: Record<string, $R | number>) {
		const new_obj: Record<string, string | number> = {};

		for (const [key, value] of Object.entries(object)) {
			let exit = false;

			try {
				new_obj[key] = this.reader.readNext(value, this.id);
			} catch (e) {
				exit = true;
				console.log("Failed for", key, this.data, e);
				// process.exit();
			}

			if (exit) throw "";
		}

		return Object.assign(this.data, new_obj);
	}
}
