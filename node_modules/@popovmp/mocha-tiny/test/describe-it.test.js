'use strict';

const {describe, it} = require('../index');

it('Bare "it" number 1', () => {});
it('Bare "it" number 2', () => {});

describe('An empty "describe"', () => {});

describe('First level "describe"', () => {
    it('foo', () => {});
});

describe('First level "describe"', () => {
    it('"it" level 1', () => {});
    describe('Second level "describe"', () => {
        it('"it" level 2', () => {});
        it('"it" level 2', () => {});
    });
    it('"it" level 1', () => {});
});

describe('Level 1', () => {
    describe('Level 2', () => {
        describe('Level 3', () => {
            describe('Level 4', () => {
                describe('Level 5', () => {
                    it('"it"', () => {});
                });
            });
        });
    });
});
