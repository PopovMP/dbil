'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {getDb}        = require('../index.js')

describe('insert tests', () => {

	describe('insert(doc)', () => {
		const db  = getDb()
		const doc = {a: 42}

		const insertId = db.insert(doc)

		it('count 1', () => {
			const count = db.count(doc)
			strictEqual(count, 1)
		})

		it('doc has the correct property', () => {
			const found = db.find(doc, {})
			strictEqual(found[0]['a'], 42)
		})

		it('doc has _id of type string', () => {
			const found = db.find(doc, {})
			strictEqual( typeof found[0]['_id'] , 'string')
		})

		it('doc has _id of length 16', () => {
			const found = db.find(doc, {})
			strictEqual( found[0]['_id'].length , 16)
		})

		it('returns the doc _id', () => {
			const found = db.find(doc, {})
			strictEqual( insertId, found[0]['_id'])
		})

		it('doc has 2 properties', () => {
			const found = db.find(doc, {})
			strictEqual( Object.keys(found[0]).length ,2)
		})

		it('inserted doc is a copy', () => {
			doc['a'] = 13
			const count = db.count({'a': 42})
			strictEqual( count, 1)
			doc['a'] = 42
		})
	})

	describe('insert(doc) with _id', () => {
		const db  = getDb()
		const doc = {a: 42, _id: 'foo'}

		const insertId = db.insert(doc)

		it('count 1', () => {
			const count = db.count(doc)
			strictEqual(count, 1)
		})

		it('doc has the correct _id', () => {
			const found = db.find(doc, {})
			strictEqual(found[0]['_id'] , 'foo')
		})

		it('returns the doc _id', () => {
			strictEqual(insertId, 'foo')
		})

		it('doc has 2 properties', () => {
			const found = db.find(doc, {})
			strictEqual(Object.keys(found[0]).length ,2)
		})

		it('doc has the correct property', () => {
			const found = db.find(doc, {})
			strictEqual(found[0]['a'], 42)
		})
	})

	describe('insert(null)', () => {
		const db  = getDb()
		const insertId = db.insert(null)

		it('count 0', () => {
			const count = db.count({})
			strictEqual(count, 0)
		})

		it('returns undefined', () => {
			strictEqual( insertId, undefined)
		})
	})

	describe('insert( Object.create(null) )', () => {
		const doc = Object.create(null)
		Object.assign(doc, {_id: 'foo'})

		const db  = getDb()
		const insertId = db.insert(doc)

		it('count 1', () => {
			const count = db.count({})
			strictEqual(count, 1)
		})

		it('returns id', () => {
			strictEqual( insertId, 'foo' )
		})
	})

	describe('insert(undefined)', () => {
		const db  = getDb()
		const insertId = db.insert(undefined)

		it('count 0', () => {
			const count = db.count({})
			strictEqual(count, 0)
		})

		it('returns undefined', () => {
			strictEqual( insertId, undefined)
		})
	})

	describe('insert({})', () => {
		const db  = getDb()
		const insertId = db.insert({})

		it('count 1', () => {
			const count = db.count({})
			strictEqual(count, 1)
		})

		it('returns _id', () => {
			strictEqual(typeof insertId, 'string')
		})
	})
})
