#!/usr/bin/env node

const fs   = require('fs');
const path = require('path');

const testDir = path.join(process.cwd(), 'test');

fs.stat(testDir,
    fs_stat_ready);

/**
 * @param { Error } err
 * @param { Stats } stats
 */
function fs_stat_ready(err, stats) {
    if (err) {
        console.error(err.message);
        return;
    }

    if (!stats.isDirectory()) {
        console.error('Cannot find test directory at: ' + testDir);
        return;
    }

    fs.readdir(testDir,
        fs_readdir_ready);
}

/**
 * @param { Error    } err
 * @param { string[] } files
 */
function fs_readdir_ready(err, files) {
    if (err) {
        console.error(err.message);
        return;
    }

    // Accepted test files are: testName.test.js
    const testFiles = files.filter(file => file.match(/\.test\.js$/));

    runTests(testFiles);
}

/**
 * Requires all test files one by one
 *
 * @param { string[] } files
 */
function runTests(files) {
    console.log('Found: ' + files.length + ' test files in: ' + testDir);

    files.forEach((file, index) => {
        console.log(`\n${index + 1}) Run test file: ${file}`);

        require(path.join(testDir, file));
    });
}
