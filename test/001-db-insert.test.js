"use strict";

const {strictEqual}  = require("assert");
const {describe, it} = require("node:test");
const {dbInsert}     = require("../lib/insert");

describe("db-insert", () => {

    describe("dbInsert(db, Object)", () => {
        const db  = {};
        const doc = {foo: 42};
        const id  = dbInsert(db, doc);

        it("it returns the document id", () => {
            strictEqual(typeof id, "string");
        });

        it("Document exists", () => {
            strictEqual(db[id].foo, 42);
        });
    });

    describe("dbInsert(db, null)", () => {
        const db  = {};
        const doc = null;
        const id  = dbInsert(db, doc);

        it("it returns `undefined`", () => {
            strictEqual(typeof id, "undefined");
        });

        it("Document does not exist", () => {
            strictEqual(Object.keys(db).length, 0);
        });
    });

    describe("dbInsert(db, [])", () => {
        const db  = {};
        const doc = [];
        const id  = dbInsert(db, doc);

        it("it returns `undefined`", () => {
            strictEqual(typeof id, "undefined");
        });

        it("Document does not exist", () => {
            strictEqual(Object.keys(db).length, 0);
        });
    });

    describe('dbInsert(db, {_id: "foo"}) - existing _id', () => {
        const db  = {"foo": {_id: "foo", a: 42}};
        const doc = {_id: "foo", a: 13};
        const id  = dbInsert(db, doc);

        it("it returns `undefined`", () => {
            strictEqual(typeof id, "undefined");
        });

        it("existing document is not changed", () => {
            strictEqual(db["foo"].a, 42);
        });
    });

    describe('dbInsert(db, {_id: "foo"}) - new _id', () => {
        const db  = {"foo": {_id: "foo", a: 42}};
        const doc = {_id: "bar", a: 13};
        const id  = dbInsert(db, doc);

        it("it returns an id", () => {
            strictEqual(typeof id, "string");
        });

        it("existing document is not changed", () => {
            strictEqual(db["foo"].a, 42);
        });

        it("new document is inserted", () => {
            strictEqual(db["bar"].a, 13);
        });
    });

    describe("dbInsert(db, Object) - inserts a clone", () => {
        const db  = {};
        const doc = {foo: 42};
        const id  = dbInsert(db, doc);

        doc.foo = 13;

        it("Document is a clone", () => {
            strictEqual(db[id].foo, 42);
        });
    });
});
