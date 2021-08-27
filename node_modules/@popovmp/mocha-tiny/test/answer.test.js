'use strict';

const { strictEqual  } = require('assert');
const { describe, it } = require('../index');

describe('Test group', () => {
    // Init the test environment.
    const systemUnderTest = {
        theAnswer: 42,
    };

    it('test...', () => {
        strictEqual(systemUnderTest.theAnswer, 42);
    });

    // Clean
    systemUnderTest.theAnswer = 0;
});
