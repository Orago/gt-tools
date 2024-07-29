// import fs from 'node:fs';
// import zlib from 'node:zlib';
// import sharp from 'sharp';
import pako from 'pako';

import { RTPackHeader, RTTEXHeader, RTTEXMipHeader } from './structures.js';

import { Buffer as Buff } from 'buffer';

import {
	eCompressionType,
	C_RTFILE,
	RT_FORMAT_EMBEDDED_FILE
} from './config.js';

function getLowestPowerOf2(n: number) {
	let lowest = 1;

	while (lowest < n) lowest <<= 1;

	return lowest;
}

const { C_COMPRESSION_NONE, C_COMPRESSION_ZLIB } = eCompressionType;

function inflateSync(buffer: Buffer) {
	// Placeholder function: Replace this with actual inflation logic
	// This function assumes the buffer is in a simple format that we can convert to a string
	let inflatedData = '';
	for (let i = 0; i < buffer.length; i++) {
		inflatedData += String.fromCharCode(buffer[i]);
	}
	return inflatedData;
}

export class RTFileToImage {
	rttexHeader: RTTEXHeader;
	rtpackHeader: RTPackHeader;
	buffer: Buffer;
	pos: number;

	constructor(buffer: Buffer, pos = 0) {
		this.rttexHeader = new RTTEXHeader();
		this.rtpackHeader = new RTPackHeader();
		this.buffer = buffer
		this.pos = 0;

		if (this.buffer.subarray(pos, C_RTFILE.PACKAGE.HEADER_BYTE_SIZE).toString() == C_RTFILE.PACKAGE.HEADER) {
			const tempPos = this.rtpackHeader.deserialize(this.buffer, pos);

			if (this.rtpackHeader.compressionType == C_COMPRESSION_NONE)
				this.buffer = this.buffer.subarray(tempPos, this.buffer.length);


			else if (this.rtpackHeader.compressionType == C_COMPRESSION_ZLIB)
				this.buffer = Buff.from(
					pako.inflate(this.buffer.subarray(tempPos, this.buffer.length))
				) as unknown as Buffer;
		}

		if (
			this.buffer.subarray(pos, C_RTFILE.PACKAGE.HEADER_BYTE_SIZE).toString() ==
			C_RTFILE.TEXTURE_HEADER
		)
			this.pos = this.rttexHeader.deserialize(this.buffer, pos);
	}

	async rawData() {
		if (this.rttexHeader.format != 5121 && this.rttexHeader.format != RT_FORMAT_EMBEDDED_FILE) {
			console.log("this.rttexHeader.format != 5121 && this.rttexHeader.format != RT_FORMAT_EMBEDDED_FILE");
			return null;
		}

		if (this.rttexHeader.rtFileHeader.version > C_RTFILE.PACKAGE.LATEST_VERSION) {
			console.log("this.rttexHeader.rtFileHeader.version > 0");
			return null;
		}

		let posBefore = this.pos;
		for (let i = 0; i < this.rttexHeader.mipmapCount; i++) {
			let mipHeader = new RTTEXMipHeader();
			this.pos = mipHeader.deserialize(this.buffer, this.pos);
			let mipData = this.buffer.subarray(this.pos, this.pos + mipHeader.dataSize);

			this.pos = posBefore;

			if (mipData == null) {
				console.log("mipData == null");
				return null;
			}

			return mipData;
		}
	}
}

export class ImageToRTFile {
	buffer: Buffer;

	constructor(buffer: Buffer) {
		this.buffer = buffer;
	}

	async getImageSize() {
		// const image = sharp(this.buffer);
		// const metadata = await image.metadata();

		// return {
		// 	width: metadata.width ?? 0,
		// 	height: metadata.height ?? 0
		// };
	}

	async getImageLowestOf2Size() {
		// const { width, height } = await this.getImageSize();
		// return {
		// 	width: getLowestPowerOf2(width),
		// 	height: getLowestPowerOf2(height)
		// };
	}

	async rawData() {
		// const imageSize = await this.getImageSize();
		// const imageLowestOf2Size = await this.getImageLowestOf2Size();

		// const { data, info } = await sharp(this.buffer)
		// 	.flip(true)
		// 	.ensureAlpha()
		// 	.extend({
		// 		top: imageLowestOf2Size.height - imageSize.height,
		// 		bottom: 0,
		// 		left: 0,
		// 		right: imageLowestOf2Size.width - imageSize.width,
		// 		background: {
		// 			r: 0,
		// 			g: 0,
		// 			b: 0,
		// 			alpha: 0
		// 		}
		// 	})
		// 	.raw()
		// 	.toBuffer({ resolveWithObject: true });

		// const bitmap = {
		// 	data,
		// 	width: info.width,
		// 	height: info.height,
		// };

		// return bitmap;
	}
}