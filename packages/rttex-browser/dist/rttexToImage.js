import pako from 'pako';
let rt_disable_img_render = false;
export function rttexToImage(result, name = 'ass') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let benchRP = Date.now();
    let padding = false;
    let ch = String.fromCharCode;
    let pk = false;
    if (ch(result[0x00]) + ch(result[0x01]) + ch(result[0x02]) + ch(result[0x03]) + ch(result[0x04]) + ch(result[0x05]) !== "RTTXTR") {
        if (ch(result[0x00]) + ch(result[0x01]) + ch(result[0x02]) + ch(result[0x03]) + ch(result[0x04]) + ch(result[0x05]) === "RTPACK") {
            result = pako.inflate(result.slice(32));
            pk = true;
        }
        else
            throw new Error("Not a valid RTTEX.");
    }
    if (pk) {
        let header = "";
        for (let j = 0x00; j <= 0x05; j++) {
            header += String.fromCharCode(result[j]);
        }
        if (header !== "RTTXTR")
            throw new Error("Not a valid RTTEX.");
    }
    function str2hex(st) {
        if (st.length % 2 == 1)
            return "0" + st;
        return st;
    }
    let startHeight = "";
    let startPackedHeight = "";
    for (let b = 0x0B; b >= 0x08; b--) {
        startPackedHeight += str2hex(result[b].toString(16));
    }
    for (let b2 = 0x17; b2 >= 0x14; b2--) {
        startHeight += str2hex(result[b2].toString(16));
    }
    let packedHeight = parseInt(startPackedHeight, 16);
    let height = parseInt(startHeight, 16);
    let startWidth = "";
    let startPackedWidth = "";
    for (let b = 0x0F; b >= 0x0C; b--)
        startPackedWidth += str2hex(result[b].toString(16));
    for (let b2 = 0x1B; b2 >= 0x18; b2--)
        startWidth += str2hex(result[b2].toString(16));
    let packedWidth = parseInt(startPackedWidth, 16);
    let width = parseInt(startWidth, 16);
    let usesAlpha = result[0x1C];
    console.log("-- Header Data for " + name + " --\n\nWidth - " + width + "px\nHeight - " + height + "px\nAlpha - " + usesAlpha + "\nCompression - " + pk);
    if (rt_disable_img_render == false) {
        canvas.width = (padding ? packedWidth : width);
        canvas.height = (padding ? packedHeight : height);
    }
    var pointer = 0x7C;
    var arr = [];
    for (var h = packedHeight - 1; h >= 0; h--) {
        for (var w = 0; w < packedWidth; w++) {
            if (usesAlpha && w < width) {
                arr.push(result[pointer++]);
                arr.push(result[pointer++]);
                arr.push(result[pointer++]);
                arr.push(result[pointer++]);
            }
            else if (w < width) {
                arr.push(result[pointer++]);
                arr.push(result[pointer++]);
                arr.push(result[pointer++]);
                arr.push(255);
            }
            else {
                if (usesAlpha) {
                    if (padding) {
                        arr.push(0);
                        arr.push(0);
                        arr.push(0);
                        arr.push(255);
                    }
                    pointer += 4;
                }
                else {
                    if (padding) {
                        arr.push(0);
                        arr.push(0);
                        arr.push(0);
                    }
                    pointer += 3;
                }
            }
        }
    }
    console.log("[BENCHMARK] Backend RTTEX to PNG OG: " + width + "x" + height + " POW: " + packedWidth + "x" + packedHeight + " concluded with " + (Date.now() - benchRP) + "ms.");
    if (rt_disable_img_render == false) {
        var iData = ctx.getImageData(0, 0, padding ? packedWidth : width, packedHeight);
        iData.data.set(new Uint8ClampedArray(padding ? arr : arr.slice(0, width * packedHeight * 4)));
        ctx.putImageData(iData, 0, (padding ? 0 : -(packedHeight - height)));
        ctx.transform(1, 0, 0, -1, 0, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.globalCompositeOperation = "copy";
        ctx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
    }
    return canvas;
}
