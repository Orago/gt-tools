import { getUniqueItems } from "./util.js";
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
        if (other instanceof GrowtopiaItemsDat != true) {
            throw "Invalid items dat to compare";
        }
        const current_ids = Object.keys(this.items);
        const other_ids = Object.keys(other.items);
        const unique = getUniqueItems(current_ids, other_ids);
        return { unique };
    }
}
export class GrowtopiaItem {
    reader;
    id;
    data = {
        id: -1,
        name: "",
    };
    constructor(reader) {
        this.reader = reader;
        this.id = reader.read_int();
        this.data.id = this.id;
    }
    parseRead(object) {
        const new_obj = {};
        for (const [key, value] of Object.entries(object)) {
            let exit = false;
            try {
                new_obj[key] = this.reader.readNext(value, this.id);
            }
            catch (e) {
                exit = true;
                console.log("Failed for", key, this.data, e);
            }
            if (exit)
                throw "";
        }
        return Object.assign(this.data, new_obj);
    }
}
