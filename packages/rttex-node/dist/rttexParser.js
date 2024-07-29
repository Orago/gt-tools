import pako from 'pako';
import { RTPackHeader, RTTEXHeader, RTTEXMipHeader } from './structures.js';
import { Buffer as Buff } from 'buffer';
import { eCompressionType, C_RTFILE, RT_FORMAT_EMBEDDED_FILE } from './config.js';
function getLowestPowerOf2(n) {
    let lowest = 1;
    while (lowest < n)
        lowest <<= 1;
    return lowest;
}
const { C_COMPRESSION_NONE, C_COMPRESSION_ZLIB } = eCompressionType;
function inflateSync(buffer) {
    let inflatedData = '';
    for (let i = 0; i < buffer.length; i++) {
        inflatedData += String.fromCharCode(buffer[i]);
    }
    return inflatedData;
}
export class RTFileToImage {
    rttexHeader;
    rtpackHeader;
    buffer;
    pos;
    constructor(buffer, pos = 0) {
        this.rttexHeader = new RTTEXHeader();
        this.rtpackHeader = new RTPackHeader();
        this.buffer = buffer;
        this.pos = 0;
        if (this.buffer.subarray(pos, C_RTFILE.PACKAGE.HEADER_BYTE_SIZE).toString() == C_RTFILE.PACKAGE.HEADER) {
            const tempPos = this.rtpackHeader.deserialize(this.buffer, pos);
            if (this.rtpackHeader.compressionType == C_COMPRESSION_NONE)
                this.buffer = this.buffer.subarray(tempPos, this.buffer.length);
            else if (this.rtpackHeader.compressionType == C_COMPRESSION_ZLIB)
                this.buffer = Buff.from(pako.inflate(this.buffer.subarray(tempPos, this.buffer.length)));
        }
        if (this.buffer.subarray(pos, C_RTFILE.PACKAGE.HEADER_BYTE_SIZE).toString() ==
            C_RTFILE.TEXTURE_HEADER)
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
    buffer;
    constructor(buffer) {
        this.buffer = buffer;
    }
    async getImageSize() {
    }
    async getImageLowestOf2Size() {
    }
    async rawData() {
    }
}
