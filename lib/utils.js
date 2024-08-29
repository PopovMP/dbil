"use strict";

const {randomBytes} = require("crypto");

/**
 * Generates a random uid
 *
 * @param {number} len
 *
 * @return {string}
 */
function uid(len) {
    return randomBytes(len * 2)
        .toString("base64")
        .replace(/[+\/]/g, "")
        .slice(0, len);
}

/**
 * Clones an object
 *
 * @param {any} obj
 *
 * @return {any}
 */
function clone(obj) {
    return typeof obj === "object"
        ? JSON.parse(JSON.stringify(obj))
        : obj;
}

module.exports = {
    uid,
    clone,
};
