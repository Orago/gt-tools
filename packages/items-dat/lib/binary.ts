import { SECRET } from './util.js';
import { Buffer } from 'buffer';

export enum $R {
	int = 'i',
	char = 'c',
	short = 's',
	readNextOn = '-',
	readNextOff = '+',
}

function xordec(
	ID: number,
	nlen: number,
	pos: number,
	enc: boolean,
	data: any
) {
	let str = '';

	if (enc == true) {
		for (let i = 0; i < nlen; i++) {
			str += String.fromCharCode(data[pos]);
			pos += 1;
		}
	} else {
		for (let i = 0; i < nlen; i++) {
			str += String.fromCharCode(
				data[pos] ^ SECRET.charCodeAt((ID + i) % SECRET.length)
			);
			pos += 1;
		}
	}

	return str;
}

export class BinaryReader {
	buff: Buffer;
	index: number;

	constructor(buf: Buffer) {
		this.buff = buf;
		this.index = 0;
	}

	read_short() {
		this.index += 2;

		return this.buff.readUInt16LE(this.index - 2);
	}

	read_int(l = 4) {
		this.index += l;

		return this.buff.readInt32LE(this.index - l);
	}

	read_char() {
		this.index++;
		return this.buff[this.index - 1];
	}

	read_str() {
		const len = this.buff.readUInt16LE(this.index);
		this.index += 2;

		const strBuf = this.buff.slice(this.index, this.index + len);
		this.index += len;

		return strBuf.toString();
	}

	read_xordec(ID: number, encoded: boolean = true) {
		const length = this.read_short();
		const toReturn = xordec(ID, length, this.index, encoded, this.buff);

		this.index += length;

		return toReturn;
	}

	readNext(value: $R | number, ID: number) {
		if (typeof value === 'number') return this.read_int(value);
		else if (value === $R.int) return this.read_int();
		else if (value === $R.char) return this.read_char();
		else if (value === $R.short) return this.read_short();
		else if (value === $R.readNextOn) return this.read_xordec(ID, true);
		else if (value === $R.readNextOff) return this.read_xordec(ID, false);
		else throw `Invalid read ${value}`;
	}
}
