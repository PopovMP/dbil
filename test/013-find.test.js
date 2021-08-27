'use strict'

const {strictEqual} = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')

const {getDb} = require('../index.js')
const db  = getDb()

db.insert({planet: 'Mars',    system: 'solar',    inhabited: false})
db.insert({planet: 'Earth',   system: 'solar',    inhabited: true })
db.insert({planet: 'Jupiter', system: 'solar',    inhabited: false})
db.insert({planet: 'Omicron', system: 'futurama', inhabited: true })

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
})

describe('findOne', () => {
	describe('findOne({system: "futurama"})', () => {
		const doc = db.findOne({system: 'futurama'})

		it('returns 1 document', () => {
			strictEqual(typeof doc, 'object')
		})

		it('doc has the correct property', () => {
			strictEqual(doc['planet'], 'Omicron')
			strictEqual(doc['system'], 'futurama')
		})
	})

	describe('findOne({system: "solar"})', () => {
		const doc = db.findOne({system: 'solar'})

		it('no documents found', () => {
			strictEqual(doc, undefined)
		})
	})
})
