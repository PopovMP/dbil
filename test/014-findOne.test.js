'use strict'

const {strictEqual} = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')

const {getDb} = require('../index.js')
const db  = getDb()

db.insert({planet: 'Mars',    system: 'solar',  inhabited: false})
db.insert({planet: 'Earth',   system: 'solar',  inhabited: true })
db.insert({planet: 'Jupiter', system: 'solar',  inhabited: false})
db.insert({planet: 'Omicron', system: 'micron', inhabited: true })

describe('findOne tests', () => {

	describe('findOne({})', () => {
		const doc = db.findOne({})

		it('returns undefined', () => {
			strictEqual(doc, undefined)
		})
	})

	describe('findOne multiple matches', () => {
		const doc = db.findOne({system: 'solar'})

		it('returns a doc', () => {
			strictEqual(doc['system'], 'solar')
		})
	})

	describe('exact match', () => {
		const doc = db.findOne({system: 'solar', inhabited: true})

		it('returns correct doc', () => {
			strictEqual(doc['planet'], 'Earth')
		})
	})
})
