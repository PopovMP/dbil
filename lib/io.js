"use strict";

const {readFileSync, writeFile} = require("fs");

/**
 * Reads a DB from a file
 *
 * @param {string} filePath
 *
 * @return {Object}
 */
function loadDb(filePath) {
    const content = readFileSync(filePath, "utf8");

    return content ? JSON.parse(content) : {};
}

/**
 * Writes DB to a file
 *
 * @param {Object} db
 * @param {string} filePath
 * @param {(err: Error) => void} callback
 *
 * @return {void}
 */
function saveDb(db, filePath, callback) {
    writeFile(filePath, JSON.stringify(db), {encoding: "utf8"}, callback);
}

module.exports = {
    loadDb,
    saveDb,
};
