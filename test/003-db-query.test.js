'use strict'

const {strictEqual} = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')

const {dbQuery, dbQueryOne} = require('../lib/db-query')

describe('query tests', () => {
	const db  = {
		'foo': {_id: 'foo', a: 42, b: 'b', c: '1', f: 'car', d: 0},
		'bar': {_id: 'bar', a: 13, b: 'b', c: '2', f: 'mar', s: [1]},
		'baz': {_id: 'baz',        b: 'b', c: '1', f: 'map'},
	}

	describe('no match', () => {
		it('returns []', () => {
			const ids = dbQuery(db, {a: 999})
			strictEqual(ids.length, 0)
		})
	})

	describe('match all {}', () => {
		it('returns all', () => {
			const ids = dbQuery(db, {})
			strictEqual(ids.length, 3)
		})
	})

	describe('match one field', () => {
		it('returns correct _id', () => {
			const ids = dbQuery(db, {a: 42})
			strictEqual(ids[0], 'foo')
		})

		it('returns 1 match', () => {
			const ids = dbQuery(db, {a: 42})
			strictEqual(ids.length, 1)
		})

		it('returns 3 matches', () => {
			const ids = dbQuery(db, {b: 'b'})
			strictEqual(ids.length, 3)
		})

		it('matches {field: 0}', () => {
			const ids = dbQuery(db, {d: 0})
			strictEqual(ids[0], 'foo')
		})
	})

	describe('match multiple fields', () => {
		it('match 2 docs', () => {
			const ids = dbQuery(db, {b: 'b', c: '1'})
			strictEqual(ids.length, 2)
		})

		it('match 1 doc', () => {
			const ids = dbQuery(db, {b: 'b', c: '2'})
			strictEqual(ids.length, 1)
		})

		it('match 1 doc', () => {
			const ids = dbQuery(db, {a: {$gte: 13}, c: '1'})
			strictEqual(ids.length, 1)
		})

		it('match 2 docs', () => {
			const ids = dbQuery(db, {a: {$gte: 13}, b: 'b'})
			strictEqual(ids.length, 2)
		})
	})

	describe('$exists', () => {
		it('$exists: true', () => {
			const ids = dbQuery(db, {a: {$exists: true}})
			strictEqual(ids.length, 2)
		})

		it('$exists: false', () => {
			const ids = dbQuery(db, {a: {$exists: false}})
			strictEqual(ids.length, 1)
		})
	})

	describe('$in', () => {
		it('$in: [...]', () => {
			const ids = dbQuery(db, {a: {$in: [13, 14]}})
			strictEqual(ids.length, 1)
			strictEqual(ids[0], 'bar')
		})
	})

	describe('$includes', () => {
		it('string field $includes: substr', () => {
			const ids = dbQuery(db, {f: {$includes: 'ma'}})
			strictEqual(ids.length, 2)
		})

		it('array field $includes: elem', () => {
			const ids = dbQuery(db, {s: {$includes: 1}})
			strictEqual(ids.length, 1)
		})
	})

	describe('$gt', () => {
		it('1 match', () => {
			const ids = dbQuery(db, {a: {$gt: 13}})
			strictEqual(ids.length, 1)
		})

		it('2 matches', () => {
			const ids = dbQuery(db, {a: {$gt: 10}})
			strictEqual(ids.length, 2)
		})
	})

	describe('$gte', () => {
		it('1 matches', () => {
			const ids = dbQuery(db, {a: {$gte: 40}})
			strictEqual(ids.length, 1)
		})

		it('2 matches', () => {
			const ids = dbQuery(db, {a: {$gte: 13}})
			strictEqual(ids.length, 2)
		})
	})

	describe('$regex', () => {
		it('matches numbers', () => {
			const ids = dbQuery(db, {a: {$regex: /\d\d/}})
			strictEqual(ids.length, 2)
		})

		it('matches string', () => {
			const ids = dbQuery(db, {f: {$regex: /ar/}})
			strictEqual(ids.length, 2)
		})
	})

	describe('$where', () => {
		it('returns 1 match', () => {
			const ids = dbQuery(db, {$where: (doc) => doc.a === 42})
			strictEqual(ids.length, 1)
		})

		it('returns 2 matches', () => {
			const ids = dbQuery(db, {$where: (doc) => doc.hasOwnProperty('a')})
			strictEqual(ids.length, 2)
		})
	})

	describe('$type', () => {
		it("$type: 'number'", () => {
			const ids = dbQuery(db, {a: {$type: 'number'}})
			strictEqual(ids.length, 2)
		})

		it("$type: 'string'", () => {
			const ids = dbQuery(db, {b: {$type: 'string'}})
			strictEqual(ids.length, 3)
		})

		it("$type: 'undefined'", () => {
			const ids = dbQuery(db, {a: {$type: 'undefined'}})
			strictEqual(ids.length, 1)
		})

		it("$type: 'array'", () => {
			const ids = dbQuery(db, {s: {$type: 'array'}})
			strictEqual(ids.length, 1)
		})
	})

	describe('{$and: [...]}', () => {
		it('returns 1 match', () => {
			const ids = dbQuery(db, {$and: [{a: {$gte: 13}}, {a: {$lt: 14}}]})
			strictEqual(ids.length, 1)
		})
	})

	describe('{$or: [...]}', () => {
		it('returns 2 matches', () => {
			const ids = dbQuery(db, {$or: [{a: {$eq: 13}}, {a: {$eq: 42}}]})
			strictEqual(ids.length, 2)
		})
	})

	describe('{$not: {...}}', () => {
		it('returns 2 matches', () => {
			const ids = dbQuery(db, {$not: {a: {$exists: true}, c: '2'}})
			strictEqual(ids.length, 2)
		})
	})
})

describe('queryOne tests', () => {
	const db = {
		'foo': {_id: 'foo', a: 42},
		'bar': {_id: 'bar', a: 13},
		'baz': {_id: 'baz', a: 13},
	}

	describe('dbQueryOne no match', () => {
		it('returns empty string', () => {
			const id = dbQueryOne(db, {a: 10})
			strictEqual(id, '')
		})
	})

	describe('dbQueryOne multiple matches', () => {
		it('returns first id', () => {
			const id = dbQueryOne(db, {a: 13})
			strictEqual(id, 'bar')
		})
	})

	describe('dbQueryOne exact match', () => {
		it('returns correct id', () => {
			const id = dbQueryOne(db, {a: 42})
			strictEqual(id, 'foo')
		})
	})

	describe('dbQueryOne match _id', () => {
		it('returns correct id', () => {
			const id = dbQueryOne(db, {_id: 'baz'})
			strictEqual(id, 'baz')
		})
	})
})
