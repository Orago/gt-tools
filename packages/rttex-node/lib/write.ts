import fs from 'fs';
import zlib from 'node:zlib';

import {
	C_RTFILE,
	eCompressionType
} from './config.js';
import { ImageToRTFile, RTFileToImage } from './rttexParser.js';
import {
	RTFileHeader,
	RTPackHeader,
	RTTEXHeader,
	RTTEXMipHeader
} from './structures.js';
import sharp from 'sharp';

const { C_COMPRESSION_ZLIB } = eCompressionType;

function hashString(buffer: Buffer) {
	let hash = 0x55555555;

	if (buffer)
		for (let i = 0; i < buffer.length; i++)
			hash = (hash >>> 27) + (hash << 5) + buffer[i];

	return hash;
}

export async function writeImageToRttex(ITRF: ImageToRTFile, path: string) {
	const imageSize = await ITRF.getImageSize();
	const imageLowestOf2Size = await ITRF.getImageLowestOf2Size();
	const rawData = await ITRF.rawData();

	const rtFileHeader = new RTFileHeader();
	rtFileHeader.fileTypeId = C_RTFILE.TEXTURE_HEADER;
	rtFileHeader.version = C_RTFILE.PACKAGE.LATEST_VERSION;
	rtFileHeader.reversed = 0;

	const rttexHeader = new RTTEXHeader();
	rttexHeader.rtFileHeader = rtFileHeader;
	rttexHeader.height = imageLowestOf2Size.height;
	rttexHeader.width = imageLowestOf2Size.width;
	rttexHeader.format = 5121;
	rttexHeader.originalHeight = imageSize.height;
	rttexHeader.originalWidth = imageSize.width;
	rttexHeader.usesAlpha = 1;
	rttexHeader.aleardyCompressed = 0;
	rttexHeader.reversedFlags = 0;
	rttexHeader.mipmapCount = 1;
	rttexHeader.reversed = 1;

	const rttexMipHeader = new RTTEXMipHeader();
	rttexMipHeader.height = imageLowestOf2Size.height;
	rttexMipHeader.width = imageLowestOf2Size.width;
	rttexMipHeader.dataSize = rawData.data.length;
	rttexMipHeader.mipLevel = 0;
	rttexMipHeader.reversed = 0;

	const header = Buffer.concat([rttexHeader.serialize(), rttexMipHeader.serialize()]);
	const data = Buffer.concat([header, rawData.data]);
	const deflated = await zlib.deflateSync(data);

	rtFileHeader.fileTypeId = C_RTFILE.PACKAGE.HEADER;

	const rtPackHeader = new RTPackHeader();
	rtPackHeader.rtFileHeader = rtFileHeader;
	rtPackHeader.compressedSize = deflated.length;
	rtPackHeader.decompressedSize = data.length;
	rtPackHeader.compressionType = C_COMPRESSION_ZLIB;

	let theData = Buffer.concat([rtPackHeader.serialize(), deflated]);
	fs.writeFileSync(path, theData);



	console.log(`Hash: ${hashString(theData)}`);
	return true;
}

export async function writeRttexToImage(RFTI: RTFileToImage, path: string, flipVertical = true) {
	return new Promise(async (resolve) => {
		let rawData = await RFTI.rawData();

		if (rawData == null) {
			resolve(false);
			return;
		}

		sharp(rawData, {
			raw: {
				width: RFTI.rttexHeader.width,
				height: RFTI.rttexHeader.height,
				channels: RFTI.rttexHeader.usesAlpha ? 4 : 3,
			},
		})
			.flip(flipVertical)
			.toFile(path, (err, info) => {
				if (err) {
					console.log(err);
					resolve(false);
				}

				// console.log(info);
				resolve(true);
			});
	});
}