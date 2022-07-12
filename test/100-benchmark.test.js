'use strict'

const {strictEqual}  = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')
const {getDb}        = require('../index.js')

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
			console.log(`Inserted ${count} docs for ${time}ms. ops/sec: ${opsPerSec}`)
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
			console.log(`Found ${count} docs for ${time}ms. ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})

	describe('findOne', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++) {
			const doc = db.findOne({index: i, b: {$gte: 42}}, {index: true})

			if (doc['index'] === i)
				count++
		}

		const time = Date.now() - timeStart

		it('find ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / time) * countObjects)
			console.log(`Found ${count} docs for ${time}ms. ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})

	describe('findOne by id', () => {
		const timeStart = Date.now()
		let count = 0

		const ids = db.find({}, {_id: 1}).map(doc => doc._id)

		for (const id of ids) {
			db.findOne({_id: id}, {index: 1})
			count++
		}

		const time = Date.now() - timeStart

		it('find ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / time) * countObjects)
			console.log(`Found ${count} docs for ${time}ms. ops/sec: ${opsPerSec}`)
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
			console.log(`Updated ${count} docs for ${time}ms. ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})

	describe('remove', () => {
		const timeStart = Date.now()
		let count = 0

		for (let i = 0; i < countObjects; i++) {
			const numRemoved = db.remove({index: i, b: {$lt: 42}})

			if (numRemoved === 1)
				count++
		}

		const time = Date.now() - timeStart

		it('remove ops/sec > 5000', () => {
			const opsPerSec = Math.round((1000 / time) * countObjects)
			console.log(`Removed ${count} docs for ${time}ms. ops/sec: ${opsPerSec}`)
			strictEqual(opsPerSec > 5000, true)
		})
	})
})
