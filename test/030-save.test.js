"use strict";

const { tmpdir          } = require("node:os");
const { join            } = require("node:path");
const { readFile        } = require("node:fs");
const { deepStrictEqual } = require("node:assert");
const { describe, it    } = require("node:test");

const { uid    } = require("../lib/utils.js");
const { saveDb } = require("../lib/io.js");

describe("safeWriteFile", () => {
    const countOfTests = 100;

    it ("enqueue multiple calls", (_it, done) => {
        const filePath = join(tmpdir(), uid(16) + ".txt");
        const dbMockup = {content: "foo", id: 0};

        for (let i = 0; i < countOfTests; i += 1) {
            dbMockup.id = i;
            saveDb(filePath, dbMockup, saveDb_ready.bind(null, i));
        }

        function saveDb_ready(i, err) {
            if (i === 0 || i === countOfTests - 1) {
                // The first and the last write must be actual
                deepStrictEqual(err, null, "Error must be null: " + i);
                checkContent(i);
                return;
            }

            // Intermediate writes must be enqueued
            deepStrictEqual(err.substring(0, 14), "Write enqueued", `i = ${i}, err: ${err}`);
        }

        function checkContent(index) {
            readFile(filePath, {encoding: "utf8"}, (err, readContent) => {
                deepStrictEqual(err, null, `Error must be null for readFile: ${index}`);

                const parsedContent = JSON.parse(/** @type {string} */ readContent);
                dbMockup.id = index;
                deepStrictEqual(parsedContent, dbMockup, `Content must match: ${index}`);

                if (index === countOfTests - 1)
                    done();
            });
        }
    });
});
