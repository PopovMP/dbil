"use strict";

const { readFileSync, writeFile } = require("fs");

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
    safeWriteFile(filePath, db, {encoding : "utf8"}, callback);
}

/**
 * This function prevents race conditions on multiple write operations for the same filename.
 * It schedules a write operation, if it is requested before the previous one has finished.
 */

/**
 * @typedef { object } QueueJob
 *
 * @property { number } timeoutID
 * @property { string } filePath
 * @property { Object } db
 * @property { WriteFileOptions } options
 * @property { (err: Error|null) => void } callback
 */

const TIMEOUT_INTERVAL = 100;

/** @type { {[filename: string]: QueueJob} } */
const queue = {};

/** @type { {[filename: string]: boolean} } */
const busy = {};

/**
 * Safe writeFile
 *
 * This function prevents race conditions on multiple write operations for the same filename.
 * It schedules a write operation, if it is requested before the previous one has finished.
 *
 * @param { string } filePath
 * @param { Object } db
 * @param { WriteFileOptions } options
 * @param { (err: Error|null) => void } callback
 *
 * @return { void }
 */
function safeWriteFile(filePath, db, options, callback) {
    // Check of there is an ongoing write operation
    if (busy[filePath]) {
        // Clear previously scheduled timeout job
        if (queue[filePath])
            clearTimeout(queue[filePath].timeoutID);

        const prevCallback = queue[filePath] && queue[filePath].callback;

        // Schedule a new write operation
        /** @type { number } */
        const timeoutID = setTimeout(repeatWriteFile, TIMEOUT_INTERVAL, filePath);
        queue[filePath] = { timeoutID, filePath, db, options, callback };

        if (typeof prevCallback === "function")
            prevCallback(new Error("canceled"));

        return;
    }

    // Start write operation
    busy[filePath] = true;

    let dbContent = "";

    try {
        dbContent = JSON.stringify(db);
    } catch (e) {
        delete busy[filePath];
        callback(e);
        return;
    }

    writeFile(filePath, dbContent, {encoding: "utf8"}, (err) => {
        delete busy[filePath];
        callback(err);
    });
}

function repeatWriteFile(filePath) {
    if (!queue[filePath]) return;

    /** @type { QueueJob } */
    const job = queue[filePath];
    safeWriteFile(job.filePath, job.db, job.options, job.callback);
    delete queue[filePath];
}

module.exports = {
    loadDb,
    saveDb,
};
