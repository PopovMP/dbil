'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {getDb}        = require('../index.js')

const db  = getDb()

db.insert({planet: 'Mars',    system: 'solar',  inhabited: false})
db.insert({planet: 'Earth',   system: 'solar',  inhabited: true })
db.insert({planet: 'Jupiter', system: 'solar',  inhabited: false})
db.insert({planet: 'Omicron', system: 'micron', inhabited: true })

describe('find tests', () => {

	describe('find({})', () => {
		const allDocs = db.find({})

		it('returns 4 documents', () => {
			strictEqual(allDocs.length, 4)
		})
	})

	describe('db.find({system: "solar"})', () => {
		const docs = db.find({system: 'solar'})

		it('returns 3 documents', () => {
			strictEqual(docs.length, 3)
		})
	})

	describe('db.find({system: "solar", inhabited: true})', () => {
		const docs = db.find({system: 'solar', inhabited: true})

		it('returns 1 documents', () => {
			strictEqual(docs.length, 1)
		})
	})

	describe('db.find({planet: "Pluto"})', () => {
		const docs = db.find({planet: 'Pluto'})

		it('returns 0 documents', () => {
			strictEqual(docs.length, 0)
		})
	})
})
