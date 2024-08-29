"use strict";

const {logError}   = require("@popovmp/micro-logger");
const {clone, uid} = require("./utils");

/**
 * Inserts a doc in DB
 * Returns the id of the newly inserted document or `undefined`
 *
 * @param {Object} db
 * @param {Object} doc
 *
 * @return {string|undefined}
 */
function dbInsert(db, doc) {
    if (typeof doc !== "object" || Array.isArray(doc) || doc === null) {
        logError(`The document being inserted is not an object. Given: ${doc}`, "dbInsert");
        return;
    }

    return typeof doc._id === "string" && doc._id.length > 0
        ? insertDocWithId(db, doc)
        : insertDoc(db, doc);
}

/**
 * Inserts a doc with an _id
 *
 * @param {Object} db
 * @param {Object} doc
 *
 * @returns {string|undefined}
 */
function insertDocWithId(db, doc) {
    const id = doc._id;

    if (db[id]) {
        logError(`The _id is not unique. Given: ${id}`, "insertDocWithId");
        return;
    }

    db[id] = clone(doc);

    return id;
}

/**
 * Inserts a doc
 *
 * @param {Object} db
 * @param {Object} doc
 *
 * @returns {string}
 */
function insertDoc(db, doc) {
    const id = makeId(db);

    db[id] = clone(doc);
    db[id]._id = id;

    return id;
}

/**
 * Makes a unique doc id.
 *
 * @param {Object} db
 *
 * @return {string}
 */
function makeId(db) {
    const id = uid(16);

    return db[id] === undefined ? id : makeId(db);
}

module.exports = {dbInsert};
