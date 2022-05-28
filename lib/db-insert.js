'use strict'

const {logError} = require('@popovmp/micro-logger')

const {uid, cloneObj} = require('./utils')

/**
 * Gets an unique document id.
 *
 * @param { Object } db
 *
 * @return { string }
 */
function getId(db)
{
	const id = uid(16)

	return db[id]
		? getId(db)
		: id
}

/**
 * Inserts a document in DB
 * Returns the id of the newly inserted document or `undefined`
 *
 * @param { Object } db
 * @param { Object } doc
 *
 * @return { string | undefined }
 */
function dbInsert(db, doc)
{
	if (typeof doc !== 'object' || doc === null || Array.isArray(doc) ) {
		logError(`doc is not an object: ${doc}`, 'dbInsert')
		return
	}

	if ( doc.hasOwnProperty('_id') ) {
		if (typeof doc._id !== 'string') {
			logError(`_id is not a string: ${doc._id}`, 'dbInsert')
			return
		}

		if (db[doc._id]) {
			logError(`_id is not unique: ${doc._id}`, 'dbInsert')
			return
		}

		db[doc._id] = cloneObj(doc)

		return doc._id
	}

	const id = getId(db)

	db[id] = cloneObj(doc)
	db[id]._id = id

	return id
}

module.exports = {
	dbInsert,
}
