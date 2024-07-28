import fs from 'node:fs';
import zlib from 'node:zlib';
import sharp from 'sharp';

import { RTFileHeader, RTPackHeader, RTTEXHeader, RTTEXMipHeader } from './structures';


import {
	eCompressionType,
	C_RTFILE,
	RT_FORMAT_EMBEDDED_FILE
} from './config';

function getLowestPowerOf2(n: number) {
	let lowest = 1;

	while (lowest < n) lowest <<= 1;

	return lowest;
}

const { C_COMPRESSION_NONE, C_COMPRESSION_ZLIB } = eCompressionType;

class RTFileToImage {
	rttexHeader: RTTEXHeader;
	rtpackHeader: RTPackHeader;
	buffer: Buffer;
	pos: number;

	constructor(path: string, pos = 0) {
		this.rttexHeader = new RTTEXHeader();
		this.rtpackHeader = new RTPackHeader();
		this.buffer = fs.readFileSync(path);
		this.pos = 0;

		if (this.buffer.subarray(pos, C_RTFILE.PACKAGE.HEADER_BYTE_SIZE).toString() == C_RTFILE.PACKAGE.HEADER) {
			const tempPos = this.rtpackHeader.deserialize(this.buffer, pos);

			if (this.rtpackHeader.compressionType == C_COMPRESSION_NONE) {
				this.buffer = this.buffer.subarray(tempPos, this.buffer.length);
			} else if (this.rtpackHeader.compressionType == C_COMPRESSION_ZLIB) {
				this.buffer = zlib.inflateSync(this.buffer.subarray(tempPos, this.buffer.length));
			}
		}

		if (this.buffer.subarray(pos, C_RTFILE.PACKAGE.HEADER_BYTE_SIZE).toString() == C_RTFILE.TEXTURE_HEADER) {
			this.pos = this.rttexHeader.deserialize(this.buffer, pos);
		}
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

	async write(path, flipVertical = true) {
		return new Promise(async (resolve) => {
			let rawData = await this.rawData();
			if (rawData == null) {
				resolve(false);
				return;
			}

			sharp(rawData, {
				raw: {
					width: this.rttexHeader.width,
					height: this.rttexHeader.height,
					channels: this.rttexHeader.usesAlpha ? 4 : 3,
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
}

export { RTFileToImage };

class ImageToRTFile {
	buffer: Buffer;

	constructor(path: string) {
		this.buffer = fs.readFileSync(path);
	}

	async getImageSize() {
		const image = await sharp(this.buffer);
		const metadata = await image.metadata();

		return {
			width: metadata.width ?? 0,
			height: metadata.height ?? 0
		};
	}

	async getImageLowestOf2Size() {


		const { width, height } = await this.getImageSize();
		return {
			width: getLowestPowerOf2(width),
			height: getLowestPowerOf2(height)
		};
	}

	async rawData() {
		const imageSize = await this.getImageSize();
		const imageLowestOf2Size = await this.getImageLowestOf2Size();

		const { data, info } = await sharp(this.buffer)
			.flip(true)
			.ensureAlpha()
			.extend({
				top: imageLowestOf2Size.height - imageSize.height,
				bottom: 0,
				left: 0,
				right: imageLowestOf2Size.width - imageSize.width,
				background: {
					r: 0,
					g: 0,
					b: 0,
					alpha: 0
				}
			})
			.raw()
			.toBuffer({ resolveWithObject: true });

		const bitmap = {
			data,
			width: info.width,
			height: info.height,
		};

		return bitmap;
	}

	async write(path: string) {
		const imageSize = await this.getImageSize();
		const imageLowestOf2Size = await this.getImageLowestOf2Size();
		const rawData = await this.rawData();

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

		const hashString = (buffer) => {
			let hash = 0x55555555;

			if (buffer)
				for (let i = 0; i < buffer.length; i++)
					hash = (hash >>> 27) + (hash << 5) + buffer[i];

			return hash;
		};

		console.log(`Hash: ${hashString(theData)}`);
		return true;
	}
}

export { ImageToRTFile };