'use strict';

const {strictEqual} = require('assert');
const {describe, it} = require('../index');

describe('Mocha-tiny API:', function () {

    describe('describe(message, content)', function () {

        it('is a function', function () {
            strictEqual(typeof describe, 'function');
        });

        it('accepts two arguments', function () {
            strictEqual(describe.length, 2);
        });
    });

    describe('it(message, assertion)', function () {

        it('is a function', function () {
            strictEqual(typeof it, 'function');
        });

        it('accepts two arguments', function () {
            strictEqual(it.length, 2);
        });
    });
});
