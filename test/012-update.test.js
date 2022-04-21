'use strict'

const {strictEqual} = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')

const {getDb} = require('../index.js')

describe('update tests - {multi: false}', () => {
	const db  = getDb()
	const doc = {a: 42}

	const docId = db.insert(doc)

	describe('$set: {a: 13}', () => {
		it('returns 1 updated', () => {
			const cntUpdated = db.update({a: 42}, {$set: {a: 13}})
			strictEqual(cntUpdated, 1)
		})

		it('doc has the correct property', () => {
			const found = db.find({'_id': docId}, {})
			strictEqual(found[0]['a'], 13)
		})
	})

	describe('$set: {b: "foo"}', () => {
		it('returns 1 updated', () => {
			const cntUpdated = db.update({a: 13}, {$set: {b: 'foo'}})
			strictEqual(cntUpdated, 1)
		})

		it('doc has the correct property', () => {
			const found = db.find({'_id': docId}, {})
			strictEqual(found[0]['b'], 'foo')
		})
	})

	describe('$set: {c: 1, d: 2, e: 3}', () => {
		it('returns 1 updated', () => {
			const cntUpdated = db.update({a: 13}, {$set: {c: 1, d: 2, e: 3}})
			strictEqual(cntUpdated, 1)
		})

		it('doc has the correct property', () => {
			const found = db.find({'_id': docId}, {})
			strictEqual(found[0]['c'], 1)
			strictEqual(found[0]['d'], 2)
			strictEqual(found[0]['e'], 3)
		})
	})

	describe('$inc: {a: 1}', () => {
		it('returns 1 updated', () => {
			const cntUpdated = db.update({a: 13}, {$inc: {a: 1}})
			strictEqual(cntUpdated, 1)
		})

		it('doc has the correct property', () => {
			const found = db.find({'_id': docId}, {})
			strictEqual(found[0]['a'], 14)
		})
	})

	describe('$inc: {a: -1}', () => {
		it('returns 1 updated', () => {
			const cntUpdated = db.update({a: 14}, {$inc: {a: -1}})
			strictEqual(cntUpdated, 1)
		})

		it('doc has the correct property', () => {
			const found = db.find({'_id': docId}, {})
			strictEqual(found[0]['a'], 13)
		})
	})

	describe('$unset: {b: true}', () => {
		it('returns 1 updated', () => {
			const cntUpdated = db.update({a: 13}, {$unset: {b: true}})
			strictEqual(cntUpdated, 1)
		})

		it('doc has the correct property', () => {
			const found = db.find({'_id': docId}, {})
			strictEqual(found[0]['b'], undefined)
		})
	})

	describe('update `_id`', () => {
		const found1 = db.find({a: 13})

		it('returns 0 updated', () => {
			const cntUpdated = db.update({a: 13}, {$set: {_id: 0}})
			strictEqual(cntUpdated, 0)
		})

		it('doc has the correct id', () => {
			const found2 = db.find({a: 13})
			strictEqual(found2[0]['_id'], found1[0]['_id'])
		})
	})
})

describe('update options', () => {
	const db  = getDb()

	db.insert({a: 42})
	db.insert({a: 42})

	describe('$set: {a: 13}', () => {
		it('returns 2 updated', () => {
			const cntUpdated = db.update({a: 42}, {$set: {a: 13}}, {multi: true})
			strictEqual(cntUpdated, 2)
		})

		it('doc has the correct property', () => {
			const docs = db.find({}, {a: 1, _id: 0})
			strictEqual(docs[0]['a'], 13)
			strictEqual(docs[1]['a'], 13)
		})
	})

	describe('select several with {multi: false}', () => {
		it('no updated docs', () => {
			const cntUpdated = db.update({}, {$set: {a: 13}}, {multi: false})
			strictEqual(cntUpdated, 0)
		})
	})
})
