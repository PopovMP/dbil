"use strict";

const {logError} = require("@popovmp/micro-logger");
const {clone}    = require("./utils");

/**
 * Gets a copy of a doc, which includes only the wanted (or excludes the unwanted) properties.
 * The projection is ether inclusive or exclusive.
 *
 * @param {Object} doc
 * @param {Object} projection
 *
 * @return {Object}
 */
function dbProjection(doc, projection) {
    if (typeof projection !== "object" || Array.isArray(projection) || projection === null) {
        logError(`projection is not an object: ${projection}`, "dbProjection");
        return;
    }

    const projKeys = Object.keys(projection);

    if (projKeys.length === 0) {
        return clone(doc);
    }

    const inclusiveKeysCount = Object.values(projection).reduce((sum, val) => sum + (val ? 1 : 0), 0);
    if (inclusiveKeysCount > 0 && inclusiveKeysCount !== projKeys.length) {
        logError(`projection values are mixed: ${JSON.stringify(projection)}`, "dbProjection");
        return;
    }

    const output = {};

    if (inclusiveKeysCount > 0) {
        for (const key of projKeys) {
            output[key] = clone(doc[key]);
        }
    } else {
        for (const key of Object.keys(doc)) {
            if (projection[key] === undefined) {
                output[key] = clone(doc[key]);
            }
        }
    }

    return output;
}

module.exports = {
    dbProjection,
}
