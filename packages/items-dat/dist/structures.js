import { getUniqueItems } from './util.js';
export class GrowtopiaItemsDat {
    version = -1;
    count = -1;
    date = Date.now();
    items = {};
    constructor(options) {
        this.version = options.version;
        this.count = options.count;
    }
    compare(other) {
        if (other instanceof GrowtopiaItemsDat != true)
            throw 'Invalid items dat to compare';
        const curIDs = Object.keys(this.items);
        const otherIDs = Object.keys(other.items);
        const unique = getUniqueItems(curIDs, otherIDs);
        return { unique };
    }
}
export class GrowtopiaItem {
    reader;
    ID;
    data = {
        ID: -1,
        name: ''
    };
    constructor(reader) {
        this.reader = reader;
        this.ID = reader.read_int();
        this.data.ID = this.ID;
    }
    parseRead(object) {
        const newObj = {};
        for (const [key, value] of Object.entries(object)) {
            let exit = false;
            try {
                newObj[key] = this.reader.readNext(value, this.ID);
            }
            catch (e) {
                exit = true;
                console.log('Failed for', key, this.data, e);
            }
            if (exit)
                throw '';
        }
        return Object.assign(this.data, newObj);
    }
}
;
