"use strict";

const {strictEqual}  = require("assert");
const {describe, it} = require("node:test");
const {dbProjection} = require("../lib/projection");

describe("db-projection", () => {
    const doc = {a: 1, b: 2, c: 3, _id: "foo"};

    describe("dbProjection(doc, {})", () => {
        const res = dbProjection(doc, {});

        it("it returns the complete doc", () => {
            strictEqual(JSON.stringify(res), JSON.stringify(doc));
        });
    });

    describe("dbProjection(doc, {a: 1})", () => {
        const res = dbProjection(doc, {a: 1});

        it("res includes one field", () => {
            strictEqual(Object.keys(res).length, 1);
        });

        it("res includes doc.a", () => {
            strictEqual(res.a, doc.a);
        });
    });

    describe("dbProjection(doc, {a: 0})", () => {
        const res = dbProjection(doc, {a: 0});

        it("res includes 3 fields", () => {
            strictEqual(Object.keys(res).length, 3);
        });

        it("res does not include doc.a", () => {
            strictEqual(res.a, undefined);
        });
    });

    describe("dbProjection(doc, {_id: 0})", () => {
        const res = dbProjection(doc, {_id: 0});

        it("res includes 3 fields", () => {
            strictEqual(Object.keys(res).length, 3);
        });

        it("res does not include doc._id", () => {
            strictEqual(res._id, undefined);
        });
    });

    describe("mixed projection", () => {
        const res = dbProjection(doc, {a: 1, b: 0});

        it("it returns undefined", () => {
            strictEqual(res, undefined);
        });
    });
});
