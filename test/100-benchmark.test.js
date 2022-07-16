'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {getDb}        = require('../index.js')

describe('benchmark', () => {
	const db = getDb() // Make an in-memory DB
	const countObjects = 1000

	function validate(operation, timeStart, count)
	{
		const time = Date.now() - timeStart

		it(`${operation} ops/sec > 5000`, () => {
			const opsPerSec = Math.round((1000 / time) * countObjects)
			console.log(`        ${operation} ${count} docs for ${time}ms. ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	}

	describe('insert', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++)
			count += db.insert({index: i, b: 42}) ? 1 : 0

		validate('insert', timeStart, count)
	})

	describe('find', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++)
			count += db.find({index: i, b: {$gte: 42}}, {index: true}).length

		validate('find', timeStart, count)
	})

	describe('findOne', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++)
			count += db.findOne({index: i, b: {$gte: 42}}, {index: true}) ? 1 : 0

		validate('findOne', timeStart, count)
	})

	describe('findOne by _id', () => {
		const timeStart = Date.now()
		let count = 0

		const ids = db.find({}, {_id: 1}).map(doc => doc._id)

		for (const id of ids)
			count += db.findOne({_id: id}, {index: 1}) ? 1 : 0

		validate('findOne', timeStart, count)
	})

	describe('update', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++)
			count += db.update({index: i, b: {$gte: 42}}, {$set: {b: 13}}, {multi: false})

		validate('update', timeStart, count)
	})

	describe('remove', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++)
			count += db.remove({index: i, b: {$lt: 42}})

		validate('remove', timeStart, count)
	})
})
