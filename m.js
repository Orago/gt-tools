import { parseItemsDat } from './packages/items-dat/dist/main.js';

import fs from 'fs';

const res = fs.readFileSync('C:\\Users\\moshl\\AppData\\Local\\Growtopia\\cache\\items.dat');

const value = parseItemsDat({
	buffer: res
});
// console.log(value);