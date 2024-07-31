import { SECRET } from './util.js';
export var $R;
(function ($R) {
    $R["int"] = "i";
    $R["char"] = "c";
    $R["short"] = "s";
    $R["readNextOn"] = "-";
    $R["readNextOff"] = "+";
})($R || ($R = {}));
;
function xordec(ID, nlen, pos, enc, data) {
    let str = '';
    if (enc == true)
        for (let i = 0; i < nlen; i++) {
            str += String.fromCharCode(data[pos]);
            pos += 1;
        }
    else
        for (let i = 0; i < nlen; i++) {
            str += String.fromCharCode(data[pos] ^ SECRET.charCodeAt((ID + i) % SECRET.length));
            pos += 1;
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
        if (typeof value === 'number')
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
;
