'use strict'

const {strictEqual}    = require('assert')
const {describe, it}   = require('@popovmp/mocha-tiny')
const {loadDb, saveDb} = require('../lib/io-helper')

const filepath = './db.json'
const testDb   = {foo: {a: 1, _id: 'foo'}}

describe('io-helper', () => {
	describe('loadDb()', () => {
		const db = loadDb()

		it('creates an Object', () => {
			strictEqual(typeof db, 'object')
		})

		it('db is empty', () => {
			strictEqual(Object.keys(db).length, 0)
		})
	})

	describe('saveDb(db, filename, callback)', () => {
		saveDb(testDb, filepath,
			saveDb_ready)
	})
})

function saveDb_ready(err) {
	it('no errors', () => {
		strictEqual(err, null)
	})

	describe('loadDb(filename)', () => {
		const db = loadDb(filepath)

		it('db is an Object', () => {
			strictEqual(typeof db, 'object')
		})

		it('db is correct', () => {
			strictEqual(JSON.stringify(db), JSON.stringify(testDb))

			saveDb({}, filepath,
				(err) => {
					if (err) {
						console.error(err)
					}
				})
		})
	})
}
