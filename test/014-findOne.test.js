'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {getDb}        = require('../index.js')

const db = getDb()

db.insert({planet: 'Mars',    system: 'solar',  inhabited: false})
db.insert({planet: 'Earth',   system: 'solar',  inhabited: true })
db.insert({planet: 'Jupiter', system: 'solar',  inhabited: false})
db.insert({planet: 'Omicron', system: 'micron', inhabited: true })

describe('findOne', () => {

	describe('when called with an empty query', () => {
		const doc = db.findOne({})

		it('returns one of the db docs', () => {
			strictEqual(typeof doc, 'object')
		})
	})

	describe('whe matches multiple docs', () => {
		const doc = db.findOne({system: 'solar'})

		it('returns one of the matched docs', () => {
			strictEqual(doc['system'], 'solar')
		})
	})

	describe('when matches a single doc', () => {
		const doc = db.findOne({system: 'solar', inhabited: true})

		it('returns the correct doc', () => {
			strictEqual(doc['planet'], 'Earth')
		})
	})

	describe('when does not match a doc', () => {
		const doc = db.findOne({system: 'sirius'})

		it('returns `undefined`', () => {
			strictEqual(doc, undefined)
		})
	})
})
