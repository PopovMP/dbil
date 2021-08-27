'use strict'

const {strictEqual} = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {getDb} = require('../index.js')

describe('benchmark', () => {
	const db = getDb()
	const countObjects = 1000

	describe('insert', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++) {
			const doc = {index: i, b: 42}
			const id = db.insert(doc)

			if (id) {
				count++
			}
		}

		const timeEnd = Date.now() - timeStart

		it('insert ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / timeEnd) * countObjects)
			console.log(`Inserted ${count} docs for ${timeEnd}ms. Ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})

	describe('findOne', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++) {
			const doc = db.findOne({index: i, b: {$gte: 42}}, {index: true})

			if (doc['index'] === i) {
				count++
			}
		}

		const timeEnd = Date.now() - timeStart

		it('findOne ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / timeEnd) * countObjects)
			console.log(`Found ${count} docs for ${timeEnd}ms. Ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})

	describe('update', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++) {
			count += db.update({index: i, b: {$gte: 42}}, {index: 42}, {multi: false})
		}

		const timeEnd = Date.now() - timeStart

		it('update ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / timeEnd) * countObjects)
			console.log(`Updated ${count} docs for ${timeEnd}ms. Ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})
})
