'use strict'

const {uid, cloneObj} = require('./utils')

/**
 * Gets an unique document id.
 *
 * @param { Object } db
 *
 * @return { string }
 */
function getId(db) {
	const id = uid(16)

	if (db[id]) {
		return getId(db)
	}

	return id
}

/**
 * Inserts a document in DB
 * Returns the id of the newly inserted document or `undefined`
 *
 * @param { Object } db
 * @param { Object } doc
 * @return { string | undefined }
 */
function dbInsert(db, doc) {
	if (typeof doc !== 'object' || doc === null || Array.isArray(doc)) {
		// Cannot insert such a document
		return undefined
	}

	if (doc._id) {
		if (db[doc._id]) {
			// Document with such an _id already exists
			return undefined
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
