/*
 * fileTypeId;
 * version;
 * reversed;
 */

export class RTFileHeader {
	// @ts-ignore
	fileTypeId: string;
	// @ts-ignore
	version: number;
	// @ts-ignore
	reversed: number;

	deserialize(buffer: Buffer, pos = 0) {
		this.fileTypeId = buffer.subarray(pos, 6).toString();
		pos += 6;

		this.version = buffer.readInt8(pos);
		pos += 1;

		// reverse : uint8_t
		pos += 1;
		return pos;
	}

	serialize() {
		const buffer = Buffer.alloc(8);
		let pos = buffer.write(this.fileTypeId);
		pos = buffer.writeInt8(this.version, pos);
		buffer.writeInt8(this.reversed, pos);
		return buffer;
	}
}

/*
 * rtFileHeader;
 * compressedSize;
 * decompressedSize;
 * compressionType;
 * reversed;
 */

export class RTPackHeader {
	rtFileHeader: RTFileHeader;
	compressedSize: number = 0;
	decompressedSize: number = 0;
	compressionType: number = 0;
	reversed: number = 0;

	constructor() {
		this.rtFileHeader = new RTFileHeader();
	}

	deserialize(buffer: Buffer, pos = 0) {
		pos = this.rtFileHeader.deserialize(buffer, pos);

		this.compressedSize = buffer.readInt32LE(pos);
		pos += 4;

		this.decompressedSize = buffer.readInt32LE(pos);
		pos += 4;

		this.compressionType = buffer.readInt8(pos);
		pos += 1;

		// reverse : uint8_t[15]
		pos += 15;
		return pos;
	}

	serialize() {
		const buffer = Buffer.alloc(24);
		let pos = buffer.writeInt32LE(this.compressedSize);
		pos = buffer.writeInt32LE(this.decompressedSize, pos);
		pos = buffer.writeInt8(this.compressionType, pos);
		pos = buffer.write('_'.repeat(12), pos);
		buffer.write('ztz', pos);
		return Buffer.concat([this.rtFileHeader.serialize(), buffer]);
	}
}

/*
 * rtFileHeader;
 * height;
 * width;
 * format;
 * originalHeight;
 * originalWidth;
 * usesAlpha;
 * aleardyCompressed;
 * reversedFlags;
 * mipmapCount;
 * reversed;
 */

export class RTTEXHeader {
	rtFileHeader: RTFileHeader;
	// @ts-ignore
	height: number;
	// @ts-ignore
	width: number;
	// @ts-ignore
	format: number;
	// @ts-ignore
	originalHeight: number;
	// @ts-ignore
	originalWidth: number;
	// @ts-ignore
	usesAlpha: number;
	// @ts-ignore
	aleardyCompressed: number;
	// @ts-ignore
	mipmapCount: number;
	// @ts-ignore
	reversedFlags: number;
	// @ts-ignore
	reversed: number;

	constructor() {
		this.rtFileHeader = new RTFileHeader();
	}

	deserialize(buffer: Buffer, pos = 0) {
		pos = this.rtFileHeader.deserialize(buffer, pos);

		this.height = buffer.readInt32LE(pos);
		pos += 4;

		this.width = buffer.readInt32LE(pos);
		pos += 4;

		this.format = buffer.readInt32LE(pos);
		pos += 4;

		this.originalHeight = buffer.readInt32LE(pos);
		pos += 4;

		this.originalWidth = buffer.readInt32LE(pos);
		pos += 4;

		this.usesAlpha = buffer.readInt8(pos);
		pos += 1;

		this.aleardyCompressed = buffer.readInt8(pos);
		pos += 1;

		// reservedFlags : unsigned char
		pos += 2;

		this.mipmapCount = buffer.readInt32LE(pos);
		pos += 4;

		// reserved : int[16]
		pos += 64;
		return pos;
	}

	serialize() {
		const buffer = Buffer.alloc(92);
		let pos = buffer.writeInt32LE(this.height);

		pos = buffer.writeInt32LE(this.width, pos);
		pos = buffer.writeInt32LE(this.format, pos);
		pos = buffer.writeInt32LE(this.originalHeight, pos);
		pos = buffer.writeInt32LE(this.originalWidth, pos);
		pos = buffer.writeInt8(this.usesAlpha, pos);
		pos = buffer.writeInt8(this.aleardyCompressed, pos);
		pos = buffer.writeInt16LE(this.reversedFlags, pos);
		pos = buffer.writeInt32LE(this.mipmapCount, pos);
		pos = buffer.write('_'.repeat(61), pos);

		buffer.write('ztz', pos);

		return Buffer.concat([this.rtFileHeader.serialize(), buffer]);
	}
}

/*
 * height;
 * width;
 * dataSize;
 * mipLevel;
 * reversed;
 */

export class RTTEXMipHeader {
	// @ts-ignore
	width: number;
	// @ts-ignore
	height: number;
	// @ts-ignore
	dataSize: number;
	// @ts-ignore
	mipLevel: number;
	// @ts-ignore
	reversed: number;

	deserialize(buffer: Buffer, pos = 0) {
		this.height = buffer.readInt32LE(pos);
		pos += 4;

		this.width = buffer.readInt32LE(pos);
		pos += 4;

		this.dataSize = buffer.readInt32LE(pos);
		pos += 4;

		this.mipLevel = buffer.readInt32LE(pos);
		pos += 4;

		// reversed : int[2]
		pos += 8;
		return pos;
	}

	serialize() {
		const buffer = Buffer.alloc(28);
		let pos = buffer.writeInt32LE(this.height);

		pos = buffer.writeInt32LE(this.width, pos);
		pos = buffer.writeInt32LE(this.dataSize, pos);
		pos = buffer.writeInt32LE(this.mipLevel, pos);
		pos = buffer.write('_'.repeat(5), pos);

		buffer.write('ztz', pos);

		return buffer;
	}
}