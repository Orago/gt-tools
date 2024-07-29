'use strict';

const viewport = require('..');
const assert = require('assert').strict;

assert.strictEqual(viewport(), 'Hello from viewport');
console.info('viewport tests passed');
