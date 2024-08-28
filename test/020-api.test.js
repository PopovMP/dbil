"use strict";

const {strictEqual}    = require("assert");
const {describe, it}   = require("node:test");
const {getDb, initApi} = require("../index.js");

/** @typedef {import("../lib/api.js").Req} Req */
/** @typedef {import("../lib/api.js").Res} Res */

const dbFilename = /** @type {string} */ (/** @type {unknown} */ (true)); // hack to make an in-memory db with a tag
const dbTagName  = "my-memory-db";
const apiSecret  = "mu-api-secret";

getDb(dbFilename, dbTagName);
const router =  /** @type {ExpressRouterMoq} */ (initApi(makeRouter(), apiSecret));

describe("API", () => {

    describe("when inserts a doc, it responds", () => {
        insert({"foo": 13}, {multi: 0, skipSave: 1}, (err, _id) => {
            it("err = null", () => {
                strictEqual(err, null);
            });

            it("_id is string ", () => {
                strictEqual(typeof _id, "string");
            });

            it("_id is 16 chars", () => {
                strictEqual(_id.length, 16);
            });
        });
    });

    describe("when inserts a doc without options, it responds", () => {
        insert({"foo": 42}, undefined, (err, _id) => {
            it("err = null", () => {
                strictEqual(err, null);
            });

            it("_id is string ", () => {
                strictEqual(typeof _id, "string");
            });

            it("_id is 16 chars", () => {
                strictEqual(_id.length, 16);
            });
        });
    });

    describe("when count docs", () => {
        count({}, (err, count) => {
            it("err = null", () => {
                strictEqual(err, null);
            });

            it("count is 2 ", () => {
                strictEqual(count, 2);
            });
        });
    });

    describe("when try to remove two docs without multi: 1", () => {
        remove({foo: {$exists: 1}}, undefined, (err, numRemoved) => {
            it("it returns an error", () => {
                strictEqual(typeof err, "string");
            });

            it("numRemoved = 0", () => {
                strictEqual(numRemoved, 0);
            });
        });
    });

    describe("when find a doc", () => {
        find({foo: {$gt: 20}}, undefined, (err, docs) => {
            it("err = null", () => {
                strictEqual(err, null);
            });

            it("docs is an array", () => {
                strictEqual(Array.isArray(docs), true);
            });

            it("it includes the correct doc", () => {
                strictEqual(docs[0].foo, 42);
            });
        });
    });

    describe("when find with query of null", () => {
        find(null, {}, (err, docs) => {
            it("it returns an error", () => {
                strictEqual(typeof err, "string");
            });

            it("docs is an array", () => {
                strictEqual(Array.isArray(docs), true);
            });

            it("docs is empty", () => {
                strictEqual(docs.length, 0);
            });
        });
    });

    describe("when find with a missing query", () => {
        find(undefined, {}, (err, docs) => {
            it("it returns an error", () => {
                strictEqual(typeof err, "string");
            });

            it("docs is an array", () => {
                strictEqual(Array.isArray(docs), true);
            });

            it("docs is empty", () => {
                strictEqual(docs.length, 0);
            });
        });
    });

    describe("when update a doc", () => {
        update({foo: 42}, {$set: {foo: 66}}, undefined, (err, numUpdated) => {
            it("err = null", () => {
                strictEqual(err, null);
            });

            it("numUpdated is 1", () => {
                strictEqual(numUpdated, 1);
            });
        });
    });

    describe("when find-one", () => {
        findOne({foo: 66}, {}, (err, doc) => {
            it("err = null", () => {
                strictEqual(err, null);
            });

            it("docs is an object", () => {
                strictEqual(typeof doc, "object");
            });

            it("it returns the correct doc", () => {
                strictEqual(doc.foo, 66);
            });
        });
    });

});

function count(query, callback) {
    const path     = "/count";
    const postBody = {
        dbName: dbTagName,
        secret: apiSecret,
    };

    if (query !== undefined) {
        postBody.query = query;
    }

    router.testPost(path, postBody, (json) => {
        const {err, data} = json;
        const count = data || 0;

        callback(err, count);
    });
}

function find(query, projections, callback) {
    const path     = "/find";
    const postBody = {
        dbName: dbTagName,
        secret: apiSecret,
    };

    if (query !== undefined) {
        postBody.query = query;
    }

    if (projections !== undefined) {
        postBody.projections = projections;
    }

    router.testPost(path, postBody, (json) => {
        const {err, data} = json;
        const docs = data !== null ? data : [];

        callback(err, docs);
    });
}

function findOne(query, projections, callback) {
    const path     = "/find-one";
    const postBody = {
        dbName: dbTagName,
        secret: apiSecret,
    };

    if (query !== undefined) {
        postBody.query = query;
    }

    if (projections !== undefined) {
        postBody.projections = projections;
    }

    router.testPost(path, postBody, (json) => {
        const {err, data} = json;
        const doc = data !== null ? data : undefined;

        callback(err, doc);
    });
}

function insert(doc, options, callback) {
    const path     = "/insert";
    const postBody = {
        dbName: dbTagName,
        secret: apiSecret,
        doc,
    };

    if (doc !== undefined) {
        postBody.doc = doc;
    }

    if (options !== undefined) {
        postBody.options = options;
    }

    router.testPost(path, postBody, (json) => {
        const {err, data} = json;
        const id          = data || undefined;

        callback(err, id);
    });
}

function remove(query, options, callback) {
    const path     = "/remove";
    const postBody = {
        dbName: dbTagName,
        secret: apiSecret,
    };

    if (query !== undefined) {
        postBody.query = query;
    }

    if (options !== undefined) {
        postBody.options = options;
    }

    router.testPost(path, postBody, (json) => {
        const {err, data} = json;
        const numRemoved  = data || 0;

        callback(err, numRemoved);
    });
}

function update(query, update, options, callback) {
    const path     = "/update";
    const postBody = {
        dbName: dbTagName,
        secret: apiSecret,
    };

    if (query !== undefined) {
        postBody.query = query;
    }

    if (update !== undefined) {
        postBody.update = update;
    }

    if (options !== undefined) {
        postBody.options = options;
    }

    router.testPost(path, postBody, (json) => {
        const {err, data} = json;
        const numUpdated  = data || 0;

        callback(err, numUpdated);
    });
}

/**
 * @typedef {Object} ExpressRouterMoq
 *
 * @property {(path: string, controller: (req: Req, res: Res) => void) => void} post
 * @property {(path: string, postBody: Record<string, any>, callback: (json: {err: string|null, data: Object|null}) => void) => void} testPost
 */

/**
 * Moq of Express Router
 *
 * @return {ExpressRouterMoq}
 */
function makeRouter() {
    const postRoutes = {};

    /**
     * Sets the route path and the controller
     *
     * @param {string} path
     * @param {(req: Req, res: Res) => void} controller
     */
    function post(path, controller) {
        postRoutes[path] = controller;
    }

    /**
     *  Imitates a POST request
     *
     * @param {string} path
     * @param {Object} postBody - POST body
     * @param {(json: {err: string|null; data: any}) => void} callback
     */
    function testPost(path, postBody, callback) {
        const controller = postRoutes[path];

        const req = {body: encodeBody(postBody)};
        const res = {json: callback};

        controller(req, res);
    }

    function encodeBody(postBody) {
        /** @type {Record<string, any>} */
        const body = {};

        for (const field of Object.keys(postBody)) {
            const value = postBody[field];
            body[field] = typeof value === "object" ? JSON.stringify(value) : value;
        }

        return body;
    }

    return {
        post,
        testPost,
    };
}
