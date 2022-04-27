'use strict'

const {strictEqual} = require('assert')
const {describe, it} = require('@popovmp/mocha-tiny')

const {getDb} = require('../index.js')

const db = getDb()

function resetDB(docs) {
	db.remove({}, {multi: true})
	db.insert(docs)
}

describe('update', () => {
	describe('single match', () => {
		it('when $set one field, it returns 1', () => {
			resetDB({_id: 1, a: 42})
			const cntUpdated = db.update({a: 42}, {$set: {a: 13}})
			strictEqual(cntUpdated, 1)
		})

		it('when $set one field, the field is updated', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$set: {a: 13}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0].a, 13)
		})

		it('when $set a new field, it returns 1', () => {
			resetDB({_id: 1, a: 42})
			const cntUpdated = db.update({a: 42}, {$set: {b: 'foo'}})
			strictEqual(cntUpdated, 1)
		})

		it('when $set a new field, the new field is added', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$set: {b: 'foo'}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0].b, 'foo')
		})

		it('when $set 3 fields, it returns 1', () => {
			resetDB({_id: 1, a: 42})
			const cntUpdated = db.update({a: 42}, {$set: {c: 1, d: 2, e: 3}})
			strictEqual(cntUpdated, 1)
		})

		it('when $set 3 fields, the fields are updated', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$set: {c: 1, d: 2, e: 3}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0].c, 1)
			strictEqual(docs[0].d, 2)
			strictEqual(docs[0].e, 3)
		})

		it('when $inc a field, it returns 1', () => {
			resetDB({_id: 1, a: 42})
			const cntUpdated = db.update({a: 42}, {$inc: {a: 1}})
			strictEqual(cntUpdated, 1)
		})

		it('when $inc a field, the field is incremented', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$inc: {a: 1}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0].a, 43)
		})

		it('when $inc a field with delta = 3, the field is incremented by 3', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$inc: {a: 3}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0].a, 45)
		})

		it('when $inc a field with delta = -1, the field is decremented', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$inc: {a: -1}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0].a, 41)
		})

		it('when $unset one field, it returns 1', () => {
			resetDB({_id: 1, a: 42})
			const cntUpdated = db.update({a: 42}, {$unset: {a: true}})
			strictEqual(cntUpdated, 1)
		})

		it('when $unset one field, the field is deleted', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$unset: {a: true}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0].a, undefined)
		})

		it('when $unset with a falsy value, it returns 0', () => {
			resetDB({_id: 1, a: 42})
			const cntUpdated = db.update({a: 42}, {$unset: {a: 0}})
			strictEqual(cntUpdated, 0)
		})

		it('when $unset with a falsy value, the field is not deleted', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$unset: {a: false}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0].a, 42)
		})

		it('when applies multiple operations, the doc is updated properly', () => {
			resetDB({_id: 1, a: 13, b: 42, f: 'foo'})
			const update = {
				$set  : {a: 42, c: 64},
				$inc  : {b: 3},
				$unset: {f: true},
				$dummy: {d: 128}
			}
			db.update({_id: 1}, update)
			const docs = db.find({_id: 1})
			strictEqual(docs[0].a, 42)
			strictEqual(docs[0].b, 45)
			strictEqual(docs[0].c, 64)
			strictEqual(docs[0].f, undefined)
			strictEqual(docs[0].d, undefined)
		})
	})

	describe('multiple matches', () => {
		it('when updates 3 documents, it returns 3', () => {
			resetDB([{a: 1}, {a: 2}, {a: 3}, {a: 4}, {a: 5}])
			const cntUpdated = db.update({a: {$gt: 2}}, {$set: {a: 13}}, {multi: true})
			strictEqual(cntUpdated, 3)
		})

		it('when updates 3 documents, the docs have the correct fields', () => {
			resetDB([{a: 1}, {a: 2}, {a: 3}, {a: 4}, {a: 5}])
			db.update({a: {$gt: 2}}, {$set: {a: 13}}, {multi: true})
			const docs = db.find({})
			strictEqual(docs[2]['a'], 13)
			strictEqual(docs[3]['a'], 13)
			strictEqual(docs[4]['a'], 13)
		})
	})

	describe('zero matches', () => {
		it('when does not match a doc, it returns 0', () => {
			resetDB([{a: 1}, {a: 2}])
			const cntUpdated = db.update({a: 42}, {$set: {a: 13}}, {multi: true})
			strictEqual(cntUpdated, 0)
		})

		it('when does not match a doc, the docs are not changed', () => {
			resetDB([{a: 1}, {a: 2}])
			db.update({a: 42}, {$set: {a: 13}}, {multi: true})
			const docs = db.find({})
			strictEqual(docs[0]['a'], 1)
			strictEqual(docs[1]['a'], 2)
		})
	})

	describe('improper cases', () => {
		it('when there are no operators, it returns 0', () => {
			resetDB([{a: 1}])
			const cntUpdated = db.update({a: 1}, {a: 13})
			strictEqual(cntUpdated, 0)
		})
		it('when there are no operators, the filed is not changed', () => {
			resetDB([{a: 1}])
			db.update({a: 1}, {a: 13})
			const docs = db.find({})
			strictEqual(docs[0]['a'], 1)
		})

		it('when match several docs with default options, it returns 0', () => {
			resetDB([{a: 1}, {a: 1}])
			const cntUpdated = db.update({a: 1}, {$set: {a: 13}})
			strictEqual(cntUpdated, 0)
		})

		it('when match several docs with {multi: false}, it returns 0', () => {
			resetDB([{a: 1}, {a: 1}])
			const cntUpdated = db.update({a: 1}, {$set: {a: 13}}, {multi: false})
			strictEqual(cntUpdated, 0)
		})

		// Cannot $inc non-numeric field
		it('when $inc a non-numeric field, it returns 0', () => {
			resetDB({_id: 1, a: 'foo'})
			const cntUpdated = db.update({a: 'foo'}, {$inc: {a: 1}})
			strictEqual(cntUpdated, 0)
		})

		// Cannot $set _id
		it('when $set _id, it returns 0', () => {
			resetDB({_id: 1, a: 42})
			const cntUpdated = db.update({a: 42}, {$set: {_id: 'foo'}})
			strictEqual(cntUpdated, 0)
		})

		// Cannot $set _id
		it('when $set _id, the document is not updated', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$set: {_id: 'foo'}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0]._id, 1)
		})

		// Cannot $unset _id
		it('when $unset _id, it returns 0', () => {
			resetDB({_id: 1, a: 42})
			const cntUpdated = db.update({a: 42}, {$unset: {_id: 'foo'}})
			strictEqual(cntUpdated, 0)
		})

		// Cannot $unset _id
		it('when $unset _id, the document is not updated', () => {
			resetDB({_id: 1, a: 42})
			db.update({a: 42}, {$unset: {_id: 'foo'}})
			const docs = db.find({_id: 1})
			strictEqual(docs[0]._id, 1)
		})
	})
})
