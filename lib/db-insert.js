'use strict'

const {logError} = require('@popovmp/micro-logger')

const {uid, cloneObj} = require('./utils')

/**
 * Gets a unique document id.
 *
 * @param {Object} db
 *
 * @return {string}
 */
function getId(db)
{
	const id = uid(16)

	return Object.hasOwn(db, id) ? getId(db) : id
}

/**
 * Inserts a document in DB
 * Returns the id of the newly inserted document or `undefined`
 *
 * @param {Object} db
 * @param {Object} doc
 *
 * @return {string|undefined}
 */
function dbInsert(db, doc)
{
	if (typeof doc !== 'object' || Array.isArray(doc) || doc === null) {
		logError(`doc is not an object: ${doc}`, 'dbInsert')
		return
	}

	return Object.hasOwn(doc, '_id') ? insertDocWithId(db, doc) : insertDoc(db, doc)
}

/**
 * Inserts a doc with a given _id
 *
 * @param {Object} db
 * @param {Object} doc
 *
 * @returns {string|undefined}
 */
function insertDocWithId(db, doc)
{
	const docId = doc._id

	if (typeof docId !== 'string' || docId === '') {
		logError(`_id is not a string: ${docId}`, 'dbInsert')
		return
	}

	if ( Object.hasOwn(db, docId) ) {
		logError(`_id is not unique: ${docId}`, 'dbInsert')
		return
	}

	db[docId] = cloneObj(doc)

	return docId
}

/**
 * Inserts a doc
 *
 * @param {Object} db
 * @param {Object} doc
 *
 * @returns {string}
 */
function insertDoc(db, doc)
{
	const id = getId(db)

	db[id] = cloneObj(doc)
	db[id]._id = id

	return id
}

module.exports = {
	dbInsert,
}
