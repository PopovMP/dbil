'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {dbProjection} = require('../lib/db-projection')

describe('db-projection', () => {
	const doc = {a: 1, b: 2, c: 3, _id: 'foo'}

	describe('dbProjection(doc, {})', () => {
		const res = dbProjection(doc, {})

		it('it returns the complete doc', () => {
			strictEqual(JSON.stringify(res), JSON.stringify(doc))
		})
	})

	describe('dbProjection(doc, {a: 1})', () => {
		const res = dbProjection(doc, {a: 1})

		it('res includes 2 fields', () => {
			strictEqual(Object.keys(res).length, 2)
		})

		it('res includes doc.a', () => {
			strictEqual(res.a, doc.a)
		})

		it('res includes doc._id', () => {
			strictEqual(res._id, doc._id)
		})
	})

	describe('dbProjection(doc, {a: 0})', () => {
		const res = dbProjection(doc, {a: 0})

		it('res includes 3 fields', () => {
			strictEqual(Object.keys(res).length, 3)
		})

		it('res does not include doc.a', () => {
			strictEqual(res.a, undefined)
		})

		it('res includes doc._id', () => {
			strictEqual(res._id, doc._id)
		})
	})

	describe('dbProjection(doc, {_id: 0})', () => {
		const res = dbProjection(doc, {_id: 0})

		it('res includes 3 fields', () => {
			strictEqual(Object.keys(res).length, 3)
		})

		it('res does not include doc._id', () => {
			strictEqual(res._id, undefined)
		})
	})

	describe('mixed projection', () => {
		const res = dbProjection(doc, {a: 1, b: 0})

		it('it returns undefined', () => {
			strictEqual(res, undefined)
		})
	})
})
