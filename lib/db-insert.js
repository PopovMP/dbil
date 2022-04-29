'use strict'

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
 * @return { string | undefined }
 */
function dbInsert(db, doc)
{
	// Doc must be a plain object
	if (typeof doc !== 'object' || doc === null || Array.isArray(doc) )
		return undefined

	if ( doc.hasOwnProperty('_id') ) {
		if (typeof doc._id !== 'string')
			return undefined // _id must be a string

		if (db[doc._id])
			return undefined // _id must be unique

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
