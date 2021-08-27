'use strict';

const { strictEqual  } = require('assert');
const { describe, it } = require('../index');

function sum(m, n) {
    return m + n;
}

describe('Test math', () => {

    describe('sum(m, n)', () => {

        it('is a function', () => {
           strictEqual(typeof sum, 'function');
        });

        it('accepts two args', () => {
            strictEqual(sum.length, 2);
        });

        it('sums numbers', () => {
            const actual   = sum(2, 3);
            const expected = 5;
            strictEqual(actual, expected);
        });
    });
});
