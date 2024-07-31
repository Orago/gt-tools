'use strict';

export { rttexToImage } from './rttexToImage.js';
import { Buffer } from 'buffer';
import { BinaryReader, $R } from './binary.js';
import { GrowtopiaItem, GrowtopiaItemsDat, ItemData } from './structures.js';


function handleItem(item: GrowtopiaItem, itemsDat: GrowtopiaItemsDat) {
	const { version } = itemsDat;

	item.parseRead({
		editableType: $R.char,
		itemCategory: $R.char,
		actionType: $R.char,
		hitsoundType: $R.char,

		name: $R.readNextOff,
		textureName: $R.readNextOn,
		textureHash: $R.int,
		itemKind: $R.char,
		val1: $R.int,
		textureX: $R.char,
		textureY: $R.char,
		spreadType: $R.char,
		isStripeyWallpaper: $R.char,
		collisionType: $R.char,
		breakHits: $R.char,
		dropChance: $R.int,
		clothingType: $R.char,
		rarity: $R.short,
		maxAmount: $R.char,
		extraFile: $R.readNextOn,
		extraFileHash: $R.int,
		audioVolume: $R.int,

		petName: $R.readNextOn,
		petPrefix: $R.readNextOn,
		petSuffix: $R.readNextOn,
		petAbility: $R.readNextOn,

		seedBase: $R.char,
		seedOverlay: $R.char,
		treeBase: $R.char,
		treeLeaves: $R.char,

		seedColor: $R.int,
		seedOverlayColor: $R.int,
		unkval1: $R.int,
		growTime: $R.int,
		flags2: $R.short,
		isRayman: $R.short,

		extraOptions: $R.readNextOn,
		texture2: $R.readNextOn,
		extraOptions2: $R.readNextOn,
	});

	item.reader.index += 80; //skiped many data

	if (version >= 11)
		item.parseRead({ punchOptions: $R.readNextOn });

	if (version >= 12)
		item.parseRead({
			flags3: $R.int,
			bodyPart: 9
		});

	if (version >= 13)
		item.parseRead({ flags4: $R.int });

	if (version >= 14)
		item.parseRead({ flags5: $R.int });

	if (version >= 15) {
		item.data.v15_1 = item.reader.read_int(25);
		item.data.v15_2 = item.reader.read_str();
	}

	if (version >= 16)
		item.data.v16 = item.reader.read_str();

	if (version >= 17)
		item.data.v17 = item.reader.read_int();

	if (version >= 18)
		item.data.v18 = item.reader.read_int();

	return item.data;
}

interface ParseOptions {
	buffer: Buffer;
	filter?: (param0: any, param1: any) => boolean;
	withItem?: (param0: ItemData) => any;
}

export function parseItemsDat(options: ParseOptions): GrowtopiaItemsDat {
	const {
		filter = () => true,
		buffer
	} = options;

	try {
		const reader = new BinaryReader(buffer);
		const dat = new GrowtopiaItemsDat({
			version: reader.read_short(),
			count: reader.read_int(),
		});

		k: for (let i = 0; i < dat.count; i++) {
			try {
				const Item = new GrowtopiaItem(reader);
				const itemData = handleItem(Item, dat);

				if (!filter(itemData, dat)) continue;

				dat.items[itemData.name] = itemData as ItemData;
			} catch (e) {
				console.log('Couldn\'t parsed at ' + i)
				// process.exit();
				break k;
			}
		}

		return dat;
	}

	catch (e: any) {
		console.log('[Error]:', e.stack);
		
		return new GrowtopiaItemsDat({
			version: -1,
			count: -1,
		});
	}
}