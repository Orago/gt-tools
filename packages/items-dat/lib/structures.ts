import { $R, BinaryReader } from './binary.js';
import { getUniqueItems } from './util.js';

interface GrowtopiaDatOptions {
	version: number;
	count: number;
}

export class GrowtopiaItemsDat {
	version = -1;
	count = -1;
	date = Date.now();
	items: { [key: string]: ItemData } = {};

	constructor(options: GrowtopiaDatOptions) {
		this.version = options.version;
		this.count = options.count;
	}

	compare(other: GrowtopiaItemsDat) {
		if (other instanceof GrowtopiaItemsDat != true)
			throw 'Invalid items dat to compare';

		const curIDs = Object.keys(this.items);
		const otherIDs = Object.keys(other.items);

		const unique = getUniqueItems(curIDs, otherIDs);

		return { unique };
	}
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

	/* Version 11 */
	punchOptions?: string;

	/* Version 12 */
	flags3?: number,
	bodyparty?: number;

	/* Version 13 */
	light_source_range?: number;

	/* Version 14 */
	unk_7?: number;

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
	ID: number;
	data: Partial<ItemData> & ItemDataRequired = {
		ID: -1,
		name: ''
	};

	constructor(reader: BinaryReader) {
		this.reader = reader;

		this.ID = reader.read_int();
		this.data.ID = this.ID;
	}

	parseRead(object: { [key: string]: $R | number }) {
		const newObj: { [key: string]: string | number } = {};

		for (const [key, value] of Object.entries(object)) {
			let exit = false;

			try {
				newObj[key] = this.reader.readNext(value, this.ID);
			}
			catch (e) {
				exit = true;
				console.log('Failed for', key, this.data, e);
				// process.exit();
			}

			if (exit) throw '';
		}

		return Object.assign(this.data, newObj);
	}
};