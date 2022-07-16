'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {getLastError, resetLastError} = require('@popovmp/micro-logger')
const {dbUpdate} = require('../lib/update')

describe('dbUpdate', () => {

	describe('$inc', () => {

		it('when $inc a non-existing field, it creates the field with value of delta', () => {
			const doc = {}
			dbUpdate(doc, {$inc: {a: 1}})
			strictEqual(doc.a, 1)
		})

		it('when $inc `a` with delta of 1, it increments `a`', () => {
			const doc = {a: 1}
			dbUpdate(doc, {$inc: {a: 1}})
			strictEqual(doc.a, 2)
		})

		it('when $inc `a` and `b` with delta of -1, it decrements `a` and `b`', () => {
			const doc = {a: -13, b: 42}
			dbUpdate(doc, {$inc: {a: -1, b: -1}})
			strictEqual(doc.a, -14)
			strictEqual(doc.b, 41)
		})

		it('when $inc `a` with delta of 0, it does not change `a`', () => {
			const doc = {a: 1}
			dbUpdate(doc, {$inc: {a: 0}})
			strictEqual(doc.a, 1)
		})

		it('when $inc is successful, it returns 1', () => {
			const doc = {a: 1}
			const numUpdated = dbUpdate(doc, {$inc: {a: 0}})
			strictEqual(numUpdated, 1)
		})

		it('when try $inc a non-numeric field, it returns 0', () => {
			const doc = {name: 'foo'}
			const numUpdated = dbUpdate(doc, {$inc: {name: 1}})
			strictEqual(numUpdated, 0)
		})

		it('when try $inc a non-numeric field, it logs an error', () => {
			const doc = {name: 'foo'}
			resetLastError()
			dbUpdate(doc, {$inc: {name: 1}})
			const err = getLastError()
			strictEqual(err, 'cannot $inc field "name" of type: string')
		})

		it('when try $inc with a non-numeric delta, it returns 0', () => {
			const doc = {a: 1}
			const numUpdated = dbUpdate(doc, {$inc: {a: 'foo'}})
			strictEqual(numUpdated, 0)
		})

		it('when try $inc with a non-numeric delta, it logs an error', () => {
			const doc = {a: 1}
			resetLastError()
			dbUpdate(doc, {$inc: {a: 'foo'}})
			const err = getLastError()
			strictEqual(err, 'cannot $inc with a non-numeric delta: foo')
		})
	})

	describe('$push', () => {

		it('when $push to a non-existing field, it creates the field with the given element', () => {
			const doc = {}
			dbUpdate(doc, {$push: {list: 42}})
			strictEqual(doc.list[0], 42)
		})

		it('when $push to a field, it pushes the element', () => {
			const doc = {list: []}
			dbUpdate(doc, {$push: {list: 42}})
			strictEqual(doc.list[0], 42)
		})

		it('when $push to a field, it returns 1', () => {
			const doc = {list: []}
			const numUpdated = dbUpdate(doc, {$push: {list: 42}})
			strictEqual(numUpdated, 1)
		})

		it('when try $push to a non-array field, it returns 0', () => {
			const doc = {name: 'foo'}
			const numUpdated = dbUpdate(doc, {$push: {name: 1}})
			strictEqual(numUpdated, 0)
		})

		it('when try $push to a non-array field, it logs an error', () => {
			const doc = {name: 'foo'}
			resetLastError()
			dbUpdate(doc, {$push: {name: 1}})
			const err = getLastError()
			strictEqual(err, 'cannot $push to field "name" of type: string')
		})
	})

	describe('when $set `a`', () => {
		const doc = {a: 1, b: 1}
		dbUpdate(doc, {$set: {a: 13}})

		it('it sets `a`', () => {
			strictEqual(doc.a, 13)
		})

		it('it does not change `b`', () => {
			strictEqual(doc.b, 1)
		})
	})

	describe('when $set `a` and `b`', () => {
		const doc = {a: 1, b: 1}
		dbUpdate(doc, {$set: {a: 42, b: 42}})

		it('it sets `a`', () => {
			strictEqual(doc.a, 42)
		})

		it('it sets `b`', () => {
			strictEqual(doc.b, 42)
		})
	})

	describe('when $unset `a` with flag  1 and `b`with flag `false`', () => {
		const doc = {a: 1, b: 1}
		dbUpdate(doc, {$unset: {a: 1, b: false}})

		it('it unsets `a`', () => {
			strictEqual(doc.a, undefined)
		})

		it('it does not unset `b`', () => {
			strictEqual(doc.b, 1)
		})
	})
})
