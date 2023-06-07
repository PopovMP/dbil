"use strict";

const {strictEqual}  = require("assert");
const {describe, it} = require("node:test");
const {uid, clone}   = require("../lib/utils");

describe("uid", () => {

    describe("uid(16)", () => {
        const id = uid(16);

        it("id is a string", () => {
            strictEqual(typeof id, "string");
        });

        it("id is 16 letters", () => {
            strictEqual(id.length, 16);
        });
    });

    describe("uid creates 1000 unique ids", () => {
        const ids = [];

        for (let i = 0; i < 1000; i += 1) {
            ids.push(uid(16));
        }

        it("ids are unique", () => {
            ids.sort();

            for (let i = 1; i < 1000; i += 1) {
                strictEqual(ids[i] !== ids[i - 1], true);
            }
        });
    });
});

describe("clone", () => {
    const obj = {a: 1, b: "foo", c: {a: 1, b: [1, 2, 3, 4]}, list: [1, 2, 3, 4], nil: null, und: undefined};

    describe("when given an object", () => {
        const cloneObj = clone(obj);
        const cloneTx  = JSON.stringify(cloneObj);
        const objTx    = JSON.stringify(obj);

        it("returns similar object", () => {
            strictEqual(cloneTx, objTx);
        });

        it("returns a different object", () => {
            obj.a       = 42;
            obj.b       = "bar";
            obj.c.a     = 13;
            obj.c.b[0]  = 13;
            obj.list[0] = 13;
            obj.nil     = undefined;
            delete obj.und;

            strictEqual(cloneTx, JSON.stringify(cloneObj));
        });
    });
});
