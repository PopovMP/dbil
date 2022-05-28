'use strict'

const {logError} = require('@popovmp/micro-logger')

const {loadDb, saveDb}      = require('./lib/io-helper')
const {dbQuery, dbQueryOne} = require('./lib/db-query')
const {dbProjection}        = require('./lib/db-projection')
const {dbInsert}            = require('./lib/db-insert')
const {dbUpdate}            = require('./lib/db-update')

const dbHolder = {}

/**
 * @typedef {Object} ModifyOptions
 *
 * @property {boolean} [multi]
 * @property {boolean} [skipSave]
 */

/**
 *  @param {string} [filePath]
 */
function makeDb(filePath)
{
	const inMemory = typeof filePath !== 'string' || filePath === ''

	const db = inMemory ? {} : loadDb(filePath)

	/**
	 * Counts docs in DB.
	 *
	 * @param {Object} query
	 *
	 * @return {number}
	 */
	function count(query)
	{
		return dbQuery(db, query).length
	}

	/**
	 * Finds docs in DB. Returns an array of docs.
	 *
	 * @param {Object} query
	 * @param {Object} [projection]
	 *
	 * @return {Object[]}
	 */
	function find(query, projection = {})
	{
		const ids = dbQuery(db, query)
		const res = []

		for (const id of ids)
			res.push( dbProjection(db[id], projection) )

		return res
	}

	/**
	 * Finds the first match doc in DB. Returns a doc or undefined.
	 *
	 * @param {Object} query
	 * @param {Object} [projection]
	 *
	 * @return {Object | undefined}
	 */
	function findOne(query, projection = {})
	{
		/** @type {string|undefined} */
		const id = dbQueryOne(db, query)

		return id && dbProjection(db[id], projection)
	}

	/**
	 * Inserts a new document to DB.
	 * Returns the ID of the inserted document.
	 * Returns an array of the inserted IDs in case of multiple documents.
	 * Returns `undefined` on a failure.
	 *
	 * @param {Object || Object[]} doc
	 *
	 * @return {string | string[] | undefined}
	 */
	function insert(doc)
	{
		if ( Array.isArray(doc) ) {
			const ids = []

			for (const singleDoc of doc)
				ids.push( dbInsert(db, singleDoc) )

			save()

			return ids
		}

		const id = dbInsert(db, doc)

		save()

		return id
	}

	/**
	 * Remove documents.
	 * Returns the count of the removed docs
	 *
	 * @param {Object} query
	 * @param {ModifyOptions} [options]
	 *
	 * @return {number} Count of removed documents
	 */
	function remove(query, options = {})
	{
		const ids = dbQuery(db, query)

		if (ids.length === 0)
			return 0

		// check for a possibly unwanted remove of multiple docs
		if (ids.length > 1 && !options.multi)
			return 0

		for (const id of ids)
			delete db[id]

		if (!options.skipSave)
			save()

		return ids.length
	}

	/**
	 * Updates all documents matching the query.
	 * Returns the count of the updated docs.
	 *
	 * @param {Object} query
	 * @param {Object} update
	 * @param {ModifyOptions} [options]
	 *
	 * @return {number} Count of updated documents
	 */
	function update(query, update, options = {})
	{
		const ids = dbQuery(db, query)

		if (ids.length === 0)
			return 0

		// Check of possibly unwanted update of multiple docs
		if (ids.length > 1 && !options.multi)
			return 0

		let countUpdated = 0
		for (const id of ids)
			countUpdated += dbUpdate(db[id], update) ? 1 : 0

		if (!options.skipSave)
			save()

		return countUpdated
	}

	/**
	 * Saves DB to disc.
	 */
	function save()
	{
		if (inMemory)
			return

		saveDb(db, filePath, (err) => {
			if (err)
				logError(`Error with DB save: ${err}`, 'save')
		})
	}

	return {
		count,
		find,
		findOne,
		insert,
		remove,
		update,
		save,
	}
}

/**
 * Gets DB
 *
 * @param {string} [filePath]
 * @param {string} [dbTag]
 */
function getDb(filePath, dbTag)
{
	if (!filePath)
		return makeDb()

	const holderKey = dbTag || filePath

	if (!dbHolder[holderKey])
		dbHolder[holderKey] = makeDb(filePath)

	return dbHolder[holderKey]
}

module.exports = {
	getDb,
}
