"use strict";

/*
<update> = {
    $inc   : {field: delta,   ...}, // Increments the field with delta or creates a field equal to delta
    $push  : {field: value,   ...}, // Pushes a value to an array field
    $rename: {field: newName, ...}, // Renames a field
    $set   : {field: value,   ...}, // Sets a new value to a field or creates a new field
    $unset : {field: bool,    ...}, // Deletes a field
}
*/

const { logError } = require("@popovmp/micro-logger");
const { clone    } = require("./utils");

/**
 * Updates a document
 *
 * @param {Object} doc
 * @param {Object} update
 *
 * @return {number} numUpdated: 0 - doc is not updated, 1 - doc is updated,
 */
function dbUpdate(doc, update) {
    if (typeof update !== "object" || Array.isArray(update) || update === null) {
        logError(`update is not an object: ${update}`, "dbUpdate");
        return 0;
    }

    let numUpdated = 0;

    for (const operator of Object.keys(update)) {
        const operand = update[operator];

        switch (operator) {
            case "$inc":
                for (const field of Object.keys(operand)) {
                    const delta = operand[field];

                    if (typeof delta !== "number") {
                        logError(`cannot $inc with a non-numeric delta: ${delta}`, "dbUpdate");
                        continue;
                    }

                    switch (typeof doc[field]) {
                        case "number":
                            doc[field] += delta;
                            numUpdated = 1;
                            break;
                        case "undefined":
                            doc[field] = delta;
                            numUpdated = 1;
                            break;
                        default:
                            logError(`cannot $inc field "${field}" of type: ${typeof doc[field]}`, "dbUpdate");
                    }
                }
                break;

            case "$push":
                for (const field of Object.keys(operand)) {
                    if (doc[field] === undefined) {
                        doc[field] = [clone(operand[field])];
                        numUpdated = 1;
                        continue;
                    }

                    if (!Array.isArray(doc[field])) {
                        logError(`cannot $push to field "${field}" of type: ${typeof doc[field]}`, "dbUpdate");
                        continue;
                    }

                    doc[field].push(clone(operand[field]));
                    numUpdated = 1;
                }
                break;

            case "$rename":
                for (const field of Object.keys(operand)) {
                    const newName = operand[field];

                    if (field === "_id") {
                        logError(`cannot $rename _id`, "dbUpdate");
                        continue;
                    }

                    if (typeof newName !== "string") {
                        logError(`cannot $rename to a non-string name: ${newName}`, "dbUpdate");
                        continue;
                    }

                    if (doc[newName] !== undefined) {
                        logError(`cannot $rename to an existing name: ${newName}`, "dbUpdate");
                        continue;
                    }

                    if (doc[field] !== undefined) {
                        doc[newName] = clone(doc[field]);
                        delete doc[field];
                        numUpdated = 1;
                    }
                }
                break;

            case "$set":
                for (const field of Object.keys(operand)) {
                    if (field === "_id") {
                        logError("cannot $set _id", "dbUpdate");
                        continue;
                    }

                    doc[field] = clone(operand[field]);
                    numUpdated = 1;
                }
                break;

            case "$unset":
                for (const field of Object.keys(operand)) {
                    if (field === "_id") {
                        logError("cannot $unset _id", "dbUpdate");
                        continue;
                    }

                    if (doc[field] !== undefined && operand[field]) {
                        delete doc[field];
                        numUpdated = 1;
                    }
                }
                break;

            default:
                logError(`wrong \`update\` operator: ${operator}`, "dbUpdate");
        }
    }

    return numUpdated;
}

module.exports = { dbUpdate };
