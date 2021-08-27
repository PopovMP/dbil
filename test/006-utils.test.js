'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')

const {uid, cloneObj} = require('../lib/utils')

describe('uid', () => {

	describe('uid(16)', () => {
		const id = uid(16)

		it('id is a string', () => {
			strictEqual(typeof id, 'string')
		})

		it('id is 16 letters', () => {
			strictEqual(id.length, 16)
		})
	})

	describe('uid creates 1000 unique ids', () => {
		const ids = []

		for (let i = 0; i < 1000; i++) {
			ids.push(uid(16))
		}

		it('ids are unique', () => {
			ids.sort()

			for (let i = 1; i < 1000; i++) {
				strictEqual(ids[i] !== ids[i - 1], true)
			}
		})
	})
})

describe('cloneObj', () => {
	const obj = {a: 1, b: 'foo', c: {a: 1, b: [1, 2, 3, 4]}, list: [1, 2, 3, 4]}

	describe('cloneObj(obj)', () => {
		const clone   = cloneObj(obj)
		const cloneTx = JSON.stringify(clone)
		const objTx   = JSON.stringify(obj)

		it('the clone is similar', () => {
			strictEqual(cloneTx, objTx)
		})

		it('it is a different object', () => {
			obj.a       = 42
			obj.b       = 'bar'
			obj.c.a     = 13
			obj.c.b[0]  = 13
			obj.list[0] = 13

			strictEqual(cloneTx, JSON.stringify(clone))
		})
	})
})


