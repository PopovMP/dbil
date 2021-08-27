'use strict'

const {strictEqual} = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')

const { dbQuery } = require('../lib/db-query')

describe('query tests', () => {
	const db  = {
		'foo': {_id: 'foo', a: 42, b: 'b', c: '1'},
		'bar': {_id: 'bar', a: 13, b: 'b', c: '2'},
		'baz': {_id: 'baz',        b: 'b', c: '1'}
	}

	describe('dbQuery(db, query) no match', () => {
		it('returns []', () => {
			const ids = dbQuery(db, {a: 999})
			strictEqual(ids.length, 0)
		})
	})

	describe('dbQuery(db, query) all match', () => {
		it('returns all', () => {
			const ids = dbQuery(db, {})
			strictEqual(ids.length, 3)
		})
	})

	describe('dbQuery(db, query) exact match', () => {
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
	})

	describe('dbQuery(db, query) match multiple properties', () => {
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

	describe('dbQuery(db, {field: {$exists: true}} )', () => {
		it('returns 2 matches', () => {
			const ids = dbQuery(db, {a: {$exists: true}})
			strictEqual(ids.length, 2)
		})
	})

	describe('dbQuery(db, {field: {$exists: false}} )', () => {
		it('returns 1 matches', () => {
			const ids = dbQuery(db, {a: {$exists: false}})
			strictEqual(ids.length, 1)
		})
	})

	describe('dbQuery(db, {field: {$gt: number}} )', () => {
		it('returns 1 matches', () => {
			const ids = dbQuery(db, {a: {$gt: 13}})
			strictEqual(ids.length, 1)
		})

		it('returns 2 matches', () => {
			const ids = dbQuery(db, {a: {$gt: 10}})
			strictEqual(ids.length, 2)
		})
	})

	describe('dbQuery(db, {field: {$gte: number}} )', () => {
		it('returns 1 matches', () => {
			const ids = dbQuery(db, {a: {$gte: 40}})
			strictEqual(ids.length, 1)
		})

		it('returns 2 matches', () => {
			const ids = dbQuery(db, {a: {$gte: 13}})
			strictEqual(ids.length, 2)
		})
	})

	describe('dbQuery(db, {field: {$regex: //}} )', () => {
		it('matches numbers', () => {
			const ids = dbQuery(db, {a: {$regex: /\d\d/}})
			strictEqual(ids.length, 2)
		})

		it('matches string', () => {
			const ids = dbQuery(db, {_id: {$regex: /ba/}})
			strictEqual(ids.length, 2)
		})
	})

	describe('dbQuery(db, {$where: doc => boolean)', () => {
		it('returns 1 match', () => {
			const ids = dbQuery(db, {$where: (doc) => doc.a === 42})
			strictEqual(ids.length, 1)
		})

		it('returns 2 matches', () => {
			const ids = dbQuery(db, {$where: (doc) => doc.hasOwnProperty('a')})
			strictEqual(ids.length, 2)
		})
	})

	describe('dbQuery(db, {$and: [...]})', () => {
		it('returns 1 match', () => {
			const ids = dbQuery(db, {$and: [{a: {$gte: 13}}, {a: {$lt: 14}}]})
			strictEqual(ids.length, 1)
		})
	})

	describe('dbQuery(db, {$or: [...]})', () => {
		it('returns 2 matches', () => {
			const ids = dbQuery(db, {$or: [{a: {$eq: 13}}, {a: {$eq: 42}}]})
			strictEqual(ids.length, 2)
		})
	})

	describe('dbQuery(db, {$not: {...}})', () => {
		it('returns 2 matches', () => {
			const ids = dbQuery(db, {$not: {a: {$exists: true}, c: '2'}})
			strictEqual(ids.length, 2)
		})
	})
})
