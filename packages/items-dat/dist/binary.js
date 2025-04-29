import { SECRET } from "./util.js";
import { Buffer } from "buffer";
export var $R;
(function ($R) {
    $R["int"] = "i";
    $R["char"] = "c";
    $R["short"] = "s";
    $R["readNextOn"] = "-";
    $R["readNextOff"] = "+";
})($R || ($R = {}));
function xordec(ID, nlen, pos, enc, data) {
    let str = "";
    if (enc == true) {
        for (let i = 0; i < nlen; i++) {
            str += String.fromCharCode(data[pos]);
            pos += 1;
        }
    }
    else {
        for (let i = 0; i < nlen; i++) {
            str += String.fromCharCode(data[pos] ^ SECRET.charCodeAt((ID + i) % SECRET.length));
            pos += 1;
        }
    }
    return str;
}
export class BinaryReader {
    buff;
    index;
    constructor(buf) {
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
    read_xordec(ID, encoded = true) {
        const length = this.read_short();
        const toReturn = xordec(ID, length, this.index, encoded, this.buff);
        this.index += length;
        return toReturn;
    }
    readNext(value, ID) {
        if (typeof value === "number")
            return this.read_int(value);
        else if (value === $R.int)
            return this.read_int();
        else if (value === $R.char)
            return this.read_char();
        else if (value === $R.short)
            return this.read_short();
        else if (value === $R.readNextOn)
            return this.read_xordec(ID, true);
        else if (value === $R.readNextOff)
            return this.read_xordec(ID, false);
        else
            throw `Invalid read ${value}`;
    }
}
export class BinaryWriter {
    buff;
    length;
    constructor() {
        this.buff = [];
        this.length = 0;
    }
    write_short(value) {
        const buf = Buffer.allocUnsafe(2);
        buf.writeUInt16LE(value, 0);
        this.buff.push(buf);
        this.length += 2;
    }
    write_int(value, len = 4) {
        const buf = Buffer.allocUnsafe(len);
        buf.writeInt32LE(value, 2);
        this.buff.push(buf.slice(0, len));
        this.length += len;
    }
    write_char(value) {
        const buf = Buffer.allocUnsafe(1);
        buf[0] = value;
        this.buff.push(buf);
        this.length += 1;
    }
    write_str(str) {
        const strBuf = Buffer.from(str);
        this.write_short(strBuf.length);
        this.buff.push(strBuf);
        this.length += strBuf.length;
    }
    write_xorenc(ID, str) {
        this.write_short(str.length);
        const buf = Buffer.allocUnsafe(str.length);
        for (let i = 0; i < str.length; i++) {
            buf[i] =
                str.charCodeAt(i) ^ SECRET.charCodeAt((ID + i) % SECRET.length);
        }
        this.buff.push(buf);
        this.length += buf.length;
    }
    toBuffer() {
        return Buffer.concat(this.buff, this.length);
    }
}
