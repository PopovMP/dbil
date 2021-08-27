'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {dbUpdate} = require('../lib/db-update')

describe('db-projection', () => {
	const doc = {a: 1, b: 2, _id: 'foo'}

	describe('dbUpdate(doc, {$inc: {a: 1}})', () => {
		dbUpdate(doc, {$inc: {a: 1}})

		it('it increments `a`', () => {
			strictEqual(doc.a, 2)
		})
	})

	describe('dbUpdate(doc, {$inc: {a: -1, b: -1}})', () => {
		dbUpdate(doc, {$inc: {a: -1, b: -1}})

		it('it decrements `a`', () => {
			strictEqual(doc.a, 1)
		})

		it('it decrements `b`', () => {
			strictEqual(doc.b, 1)
		})
	})

	describe('dbUpdate(doc, {$set: {a: 13}})', () => {
		dbUpdate(doc, {$set: {a: 13}})

		it('it sets `a`', () => {
			strictEqual(doc.a, 13)
		})

		it('it does not change `b`', () => {
			strictEqual(doc.b, 1)
		})
	})

	describe('dbUpdate(doc, {$set: {a: 42, b: 42}})', () => {
		dbUpdate(doc, {$set: {a: 42, b: 42}})

		it('it sets `a`', () => {
			strictEqual(doc.a, 42)
		})

		it('it sets `b`', () => {
			strictEqual(doc.b, 42)
		})
	})

	describe('dbUpdate(doc, {$unset: {a: 1, b: false}})', () => {
		dbUpdate(doc, {$unset: {a: 1, b: false}})

		it('it unsets `a`', () => {
			strictEqual(doc.a, undefined)
		})

		it('it does not unset `b`', () => {
			strictEqual(doc.b, 42)
		})
	})

	describe('dbUpdate(doc, {$set: {a: 42}, $inc: {b: 1}})', () => {
		dbUpdate(doc, {$set: {a: 42}, $inc: {b: 1}})

		it('it sets `a`', () => {
			strictEqual(doc.a, 42)
		})

		it('it increments `b`', () => {
			strictEqual(doc.b, 43)
		})
	})
})
