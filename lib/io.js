"use strict";

const {readFileSync, writeFile} = require("fs");

/**
 * Reads a DB from a file
 *
 * @param { string } filePath
 *
 * @return { Object }
 */
function loadDb(filePath) {
    const content = readFileSync(filePath, "utf8");

    return content ? JSON.parse(content) : {};
}

/**
 * Writes DB to a file
 *
 * @param { string } filePath
 * @param { Object } db
 * @param { (err: Error|null) => void } callback
 *
 * @return { void }
 */
function saveDb(filePath, db, callback) {
    let content = "";

    try {
        content = JSON.stringify(db);
    } catch (/** @type {any} */ typeError) {
        setTimeout(callback, 0, typeError);
        return;
    }

    safeWriteFile(filePath, content, callback);
}

/**
 * @typedef { object } QueueJob
 *
 * @property { number } timeoutID
 * @property { string } filePath
 * @property { string } content
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
 * @param { string } content
 * @param { (err: Error|null) => void } callback
 *
 * @return { void }
 */
function safeWriteFile(filePath, content, callback) {
    // Check is there an ongoing write operation
    if (busy[filePath]) {
        // Clear previously scheduled timeout job
        if (queue[filePath] && queue[filePath].timeoutID) {
            clearTimeout(queue[filePath].timeoutID);
        }

        /** @type { (err: Error|null) => void } */
        const prevCallback = queue[filePath] && queue[filePath].callback;
        if (typeof prevCallback === "function") {
            setTimeout(prevCallback, 0, "Write enqueued for " + filePath);
        }

        // Schedule a new write operation
        /** @type { number } */
        const timeoutID = setTimeout(repeatWriteFile, TIMEOUT_INTERVAL, filePath);
        queue[filePath] = {timeoutID, filePath, content, callback};
        return;
    }

    // Mark filePath busy
    busy[filePath] = true;

    // Start write operation
    writeFile(filePath, content, {encoding: "utf8"}, (err) => {
        setTimeout(callback, 0, err);

        // Release busy
        delete busy[filePath];
    });

    /**
     * @param { string } filePath
     * @return { void }
     */
    function repeatWriteFile(filePath) {
        /** @type { QueueJob } */
        const job = queue[filePath];
        delete queue[filePath];

        safeWriteFile(job.filePath, job.content, job.callback);
    }
}

module.exports = {loadDb, saveDb};
