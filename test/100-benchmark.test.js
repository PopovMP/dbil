'use strict'

const {strictEqual } = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {getDb       } = require('../index.js')

describe('benchmark', () => {
	const db = getDb() // Make an in-memory DB
	const countObjects = 1000

	describe('insert', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++) {
			const doc = {index: i, b: 42}
			const id  = db.insert(doc)

			if (id)
				count++
		}

		const time = Date.now() - timeStart

		it('insert ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / time) * countObjects)
			console.log(`Inserted ${count} docs for ${time}ms. Ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})

	describe('find', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++) {
			const found = db.find({index: i, b: {$gte: 42}}, {index: true})

			if (found[0].index === i)
				count++
		}

		const time = Date.now() - timeStart

		it('find ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / time) * countObjects)
			console.log(`Found ${count} docs for ${time}ms. Ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})

	describe('update', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++) {
			count += db.update({index: i, b: {$gte: 42}}, {$set: {b: 13}}, {multi: false})
		}

		const time = Date.now() - timeStart

		it('update ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / time) * countObjects)
			console.log(`Updated ${count} docs for ${time}ms. Ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})
})

